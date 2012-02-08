/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

defineModule("Facebook", function (require, exports) {
	var kirin = require("kirin");
	var api = require("api-utils");
	var backend = kirin.proxy("Facebook-backend");
	var networking = require("Networking");
	var settings = require("Settings");
	var dates = require("dates");
	
	// Keeps hold of the user's message from the last time around if there was a failure.
	// This lets us pre-populate the message field with the same message and avoiding the 
	// user's frustration of having to type it all in again. 
	// See 20552: ('Write Something..' text is lost on network error when attempting to share)
	var savedMessageFromLastFail = "";
	
	// Just shows a standard issue "sorry we can't get it to work right now, please try again later"
	var showFacebookFailMsg = function() {
		backend.showErrorMessage_("Oops!", "We couldn't connect to Facebook. Try again later.");
	};
	
	// Given an access_token, this calls facebook's Graph REST API to make a wall post.  
	var postUsingGraphAPI = function(postKeyValues, accessToken, successCallback, failureCallback, fbAccessRevokedCallback) {
		postKeyValues.access_token = accessToken;
				
		networking.downloadJSON({
			url: "https://graph.facebook.com/me/feed",
			method: "POST",
			params: postKeyValues,
			payload: successCallback,
			onError: function(devErrorCode){
				if (devErrorCode >= 400 && devErrorCode <= 403) {
					// zomg facebook deleted us
					fbAccessRevokedCallback();
				} else {
					savedMessageFromLastFail = postKeyValues.message;
					showFacebookFailMsg();
					failureCallback(devErrorCode);
				}
			}
		});
	};
	
	/**
	 * Posts to the user's wall.
	 *  
	 * If the user needs to login and/or authourise the application, the backend 
	 * module is used to show the appropriate "Platform Dialogs" (e.g. a WebView 
	 * of the facebook mobile web login, or Facebook's iOS/Android Platform Dialogs API).
	 *
	 * @param {Object} wallPostObj argument should be an object like:
	 * {   
	 *    link: "URL link attached to this post" // Optional
	 *    name: "The name of the link" // Optional
	 *    caption: "The caption of the link (appears beneath the link name)" // Optional
	 *    description: "A description of the link (appears beneath the link caption)" // Optional
	 *    
	 *    picture: "A URL link to the picture included with this post" // Optional
	 *    
	 *    icon: "A link to an icon representing the type of this post" // Optional
	 *    attribution: "A string indicating which application was used to create this post" // Optional
	 * }
	 * 
	 * @param {Function} successCallback Mandatory. Called when the post was published
	 * @param {Function} failureCallback Mandatory. Called when a network error (or facebook error) prevented the post. 
	 * @param {Function} cancelCallback Optional. Called in the case where the user cancelled the login, cancelled the authorisation, or cancelled the preview.
	 * 
	 * Handy Facebook ref: http://developers.facebook.com/docs/reference/api/post/
	 */
	exports.publishToWall = function (wallPostObj, successCallback, failureCallback, cancelCallback) {
		wallPostObj = api.normalizeAPI({
			'string': {
				optional: ['link', 'name', 'caption', 'description', 'picture', 'icon', 'attribution']
			}
		}, wallPostObj);
		
		// Obtain current token from the settings
		var tokenFromSettings = settings.get("facebook.access_token");
		var tokenPerishTimestamp = settings.get("facebook.expires_at");
		
		// Check current token is not past its sell by date
		var tokenFromSettingsIsValid = false;
		if(tokenFromSettings && (tokenPerishTimestamp - dates.getCurrentTime().getTime()) > 0) {
			tokenFromSettingsIsValid = true;
		}
		
		// Function that deals with showing the preview popup and asking the 
		// user for their comment and confirmation for publishing. It will then 
		// post it with the mesasge once it gets user confirmation.
		var getUserPreviewComment = function() {
			if(savedMessageFromLastFail) {
				// Last time we tried to publish there was a failure preventing it from ending up on the wall.
				// In such a case, we want to pre-populate the user's message with the same message from last time.
				// See 20552: ('Write Something..' text is lost on network error when attempting to share)
				wallPostObj.message = savedMessageFromLastFail;
				savedMessageFromLastFail = "";
			}
			
			backend.showPostPreview_({
				facebookKeyValues: wallPostObj,
				onPublishedCBToken: kirin.wrapCallback(function(userText) {
					console.log("Publish pressed. User text is "+userText);
					wallPostObj.message = userText;
					postUsingGraphAPI(
                        wallPostObj, 
                        settings.get("facebook.access_token"), 
                        successCallback, 
                        failureCallback, 
                        function() {
                            // Facebook access revoked
                            settings.remove("facebook.access_token");
                            settings.commit();
                            exports.publishToWall(wallPostObj, successCallback, failureCallback, cancelCallback);
                        });
                }, "Facebook.", "publish."),
				onCancelledCBToken: kirin.wrapCallback(function() {
					console.log("Publish was cancelled");
					if(_.isFunction(cancelCallback)) {
						cancelCallback();
					}
				}, "Facebook.", "cancelled.")
			});
		};
		
		if(tokenFromSettingsIsValid) {
			// With the valid token, call Facebook's Graph API to do a post..
			getUserPreviewComment();
		} else {
			// When the access token is not valid, ask the Facebook-backend to login/authorise 
			// the application and obtain a new token.
			
			var wrappedBackendSuccess = kirin.wrapCallback(function(userId, accessToken, expiresInSeconds) {
				// Stash the new token in the settings for next time around.
				settings.put("facebook.user_id", userId);
				settings.put("facebook.access_token", accessToken);
				settings.put("facebook.expires_at", dates.getCurrentTime().getTime() + (expiresInSeconds * 1000));
				settings.commit();
				
				getUserPreviewComment();
			}, "Facebook.", "success.");
			
			var wrappedBackendFailure = kirin.wrapCallback(function(devErrMsg) { 
				showFacebookFailMsg();
				failureCallback(devErrMsg);
			}, "Facebook.", "failure.");
			
			var wrappedBackendCancel = kirin.wrapCallback(function(){
				if(_.isFunction(cancelCallback)) {
					cancelCallback();
				} else {
					console.log("Facebook.js: NOOP cancel callback.");
				}
			}, "Facebook.", "cancel.");
			
			backend.procureAccessToken_({
				withThesePermissions: ["publish_stream"],
				successCBToken: wrappedBackendSuccess, 
				failureCBToken: wrappedBackendFailure,
				cancelCBToken: wrappedBackendCancel
			});
		}
	};
});
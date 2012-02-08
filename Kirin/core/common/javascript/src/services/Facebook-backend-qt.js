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

defineModule("Facebook-backend", function (require, exports) {
	var backend = {};
	var kirin = require("kirin");
	
	/**
	 * Returns the facebook access_token with the required permissions to the success callback 
	 * if all goes well. This will normally involve showing a facebook dialog (in Qt land this is 
	 * a WebView to their login & authorize application pages) and making the user go through the 
	 * facebook flow until we have an access token. 
	 * 
	 * @param paramObj An object containing the parameters as key/values. It must contain:
	 * {
	 *    withThesePermissions: An array of strings, the permissions required. e.g. ["publish_stream"],
	 *    successCBToken: Takes 3 arguments: user_id, access_token, expires_in,
	 *    failureCBToken: Called when there's a network error, or facebook error. Takes 1 argument: a developer friendly error string
	 *    cancelCBToken: Called when the user cancels the login or authorisation.
	 * }
	 */
	backend.procureAccessToken_ = function(paramObj) {
		var deleteCallbacks = function() {
			kirin.native2js.deleteCallback(paramObj.successCBToken, 
											paramObj.failureCBToken,
											paramObj.cancelCBToken);
		};
		
		kirin.proxy("qmlFacebookUI").getUserToken(paramObj.withThesePermissions,
			function(userId, freshAccessToken, expiresInSeconds) {
				// Success!
				kirin.native2js.callCallback(paramObj.successCBToken, userId, freshAccessToken, expiresInSeconds);
				deleteCallbacks();
			}, function(errorMsg) {
				// Network failure, or facebook failure!
				kirin.native2js.callCallback(paramObj.failureCBToken, errorMsg);
				deleteCallbacks();
			}, function() {
				// User cancelled!
				kirin.native2js.callCallback(paramObj.cancelCBToken);
				deleteCallbacks();
			});
	};
	
	/**
	 * @param {Object} paramObj Looks like:
	 * {
	 *    facebookKeyValues: {
	 *       message: String.
	 *       link: "URL link attached to this post" // Optional
	 *       name: "The name of the link" // Optional
	 *       caption: "The caption of the link (appears beneath the link name)" // Optional
	 *       description: "A description of the link (appears beneath the link caption)" // Optional
	 *       picture: "A URL link to the picture included with this post" // Optional
	 *       icon: "A link to an icon representing the type of this post" // Optional
	 *       attribution: "A string indicating which application was used to create this post" // Optional
	 *    },
	 *    
	 *    onPublishCBToken: Callback token. Takes string argument containing the user's optional comment.
	 *    onCancelledCBToken: Callback token. No args
	 * }
	 */
	backend.showPostPreview_ = function(paramObj) {
		kirin.proxy("qmlFacebookPreview").showPreview(paramObj.facebookKeyValues, function(userText) {
				kirin.native2js.callCallback(paramObj.onPublishedCBToken, userText);
				kirin.native2js.deleteCallback(paramObj.onPublishedCBToken, paramObj.onCancelledCBToken);
			}, function(errorMsg) {
				kirin.native2js.callCallback(paramObj.onCancelledCBToken, errorMsg);
				kirin.native2js.deleteCallback(paramObj.onPublishedCBToken, paramObj.onCancelledCBToken);
			});
	};
	
	/**
	 * Display a simple error message. Most likely saying that "There was a problem contacting Facebook. Try again Later".
	 * 
	 * @param {String} errorTitle The title of the error popup/dialog/response
	 * @param {String} errorMessage The message content of the error popup/dialog/response
	 */
	backend.showErrorMessage_ = function(errorTitle, errorMessage) {
		// Knowing here, full well, that the NativeAppDelegate is the qmlRoot which has a 
		// handy showAlert function perfect for an error popup.
		kirin.proxy("NativeAppDelegate").showAlert(errorTitle, errorMessage, "stateDismissOnly", true, true);
	};
	
	kirin.native2js.registerProxy("Facebook-backend", backend);
});
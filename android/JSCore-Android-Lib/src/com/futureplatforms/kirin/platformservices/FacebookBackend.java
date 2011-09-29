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


package com.futureplatforms.kirin.platformservices;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;

import com.facebook.android.AsyncFacebookRunner;
import com.facebook.android.AsyncFacebookRunner.RequestListener;
import com.facebook.android.DialogError;
import com.facebook.android.Facebook;
import com.facebook.android.Facebook.DialogListener;
import com.facebook.android.FacebookError;
import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.IJava2Js;
import com.futureplatforms.kirin.R;
import com.futureplatforms.kirin.api.IFacebookBackend;

public class FacebookBackend implements IFacebookBackend {

	private final IJava2Js mJS;
	
	@SuppressWarnings("unused")
	private final Context mContext;
	private SharedPreferences mPrefs;
	private AsyncFacebookRunner mAsyncPermissionCheck;

	private Facebook mFacebook;

	public FacebookBackend(Context context, SharedPreferences prefs,
			IJava2Js js) {
		mJS = js;
		mContext = context;

		// facebook.app.id
		mPrefs = prefs;
	}

	protected Activity getCurrentActivity() {

		return (Activity) mJS.getService("NativeScreenObject");
	}

	protected Facebook getFacebook() {
		if (mFacebook == null) {
			String appid = mPrefs.getString("facebook.app.id", null);
			Log.i(C.TAG, "FacebookBackend.getFacebook: App ID - " + appid);
			mFacebook = new Facebook(appid);
		}
		return mFacebook;
	}

	protected Facebook resetFacebook(Facebook fb) {
		fb.setAccessToken(null);
		fb.setAccessExpires(0);
		return fb;
	}

	@Override
	public void onAdditionToWebView() {
		// NOP
	}

	/**
	 * Returns the facebook access_token with the required permissions to the
	 * success callback if all goes well. This will normally involve showing a
	 * facebook dialog (in Qt land this is a WebView to their login & authorize
	 * application pages) and making the user go through the facebook flow until
	 * we have an access token.
	 * 
	 * @param paramObj
	 *            An object containing the parameters as key/values. It must
	 *            contain: { withThesePermissions: An array of strings, the
	 *            permissions required. e.g. ["publish_stream"], successCBToken:
	 *            Takes 3 arguments: user_id, access_token, expires_in,
	 *            failureCBToken: Called when there's a network error, or
	 *            facebook error. Takes 1 argument: a developer friendly error
	 *            string cancelCBToken: Called when the user cancels the login
	 *            or authorisation. }
	 */
	@Override
	public void procureAccessToken_(final JSONObject params) {
		Log.i(C.TAG, "FacebookBackend.procureAccessToken_: params = " + params);

		Facebook fb = resetFacebook(getFacebook());
		if (params.has("tokenExpire") && params.has("accessToken")) {
			fb.setAccessToken(params.optString("accessToken"));
			fb.setAccessExpires(params.optLong("tokenExpire"));
		}

		JSONArray permissionsJSON = params.optJSONArray("withThesePermissions");
		final String[] permissions = new String[permissionsJSON.length()];
		for (int i = 0; i < permissions.length; i++) {
			permissions[i] = permissionsJSON.optString(i);
		}

		/**
		 * If the current token and expiry time is valid check we have the
		 * appropriate permissions
		 */
		if (fb.isSessionValid()) {

			final Runnable loginRunnable = new Runnable() {

				@Override
				public void run() {
					requireNewUserLogin(params, permissions);
				}
			};

			if (mAsyncPermissionCheck == null) {
				mAsyncPermissionCheck = new AsyncFacebookRunner(fb);
				mAsyncPermissionCheck.request("me/permissions",
						new RequestListener() {

							@Override
							public void onMalformedURLException(
									MalformedURLException e, Object state) {
								mAsyncPermissionCheck = null;
								getCurrentActivity().runOnUiThread(
										loginRunnable);
							}

							@Override
							public void onIOException(IOException e,
									Object state) {
								mAsyncPermissionCheck = null;
								getCurrentActivity().runOnUiThread(
										loginRunnable);
							}

							@Override
							public void onFileNotFoundException(
									FileNotFoundException e, Object state) {
								mAsyncPermissionCheck = null;
								getCurrentActivity().runOnUiThread(
										loginRunnable);
							}

							@Override
							public void onFacebookError(FacebookError e,
									Object state) {
								mAsyncPermissionCheck = null;
								getCurrentActivity().runOnUiThread(
										loginRunnable);
							}

							@Override
							public void onComplete(String fbResponse,
									Object state) {
								mAsyncPermissionCheck = null;
								JSONObject responseObj;
								try {
									responseObj = new JSONObject(fbResponse);

									if (responseObj.optJSONObject("error") != null) {
										// There was error - relogin
										onFacebookError(null, null);
										return;
									}

									JSONArray dataArray = responseObj
											.optJSONArray("data");

									if (dataArray == null
											|| dataArray.length() <= 0) {
										// There was error - relogin
										onFacebookError(null, null);
										return;
									}

									JSONObject dataObject = dataArray
											.getJSONObject(0);

									boolean hasAllPermissions = true;
									for (String p : permissions) {
										int permissionValue = dataObject
												.optInt(p, 0);
										if (permissionValue != 1) {
											hasAllPermissions = false;
											break;
										}
									}

									if (hasAllPermissions) {
										int fakeUserID = -1;
										mJS.callCallback(
												params.optString("successCBToken"),
												'"' + fakeUserID + '"',
												'"' + getFacebook()
														.getAccessToken() + '"',
												getFacebook()
														.getAccessExpires());

										cleanupCallbacks(params,
												"successCBToken",
												"failureCBToken",
												"cancelCBToken");
										mAsyncPermissionCheck = null;
										return;
									}
								} catch (JSONException e) {
									e.printStackTrace();
								}

								getCurrentActivity().runOnUiThread(
										loginRunnable);
							}
						});
			}

		} else {
			requireNewUserLogin(params, permissions);
		}

	}

	private void requireNewUserLogin(final JSONObject params,
			String[] permissions) {
		Log.i(C.TAG, "FacebookBackend.requireNewUserLogin: ");
		/**
		 * The current expiry time / token is invalid, create a new one
		 */
		Activity currentActivity = getCurrentActivity();

		Facebook fb = resetFacebook(getFacebook());
		fb.authorize(currentActivity, permissions, C.REQUEST_CODE_FACEBOOK,
				new DialogListener() {

					private void cleanup() {
						cleanupCallbacks(params, "successCBToken",
								"failureCBToken", "cancelCBToken");
					}

					private void callback(String tokenKey, Object... args) {
						String token = params.optString(tokenKey);
						if (token != null) {
							mJS.callCallback(token, args);
						}
					}

					@Override
					public void onFacebookError(FacebookError e) {
						Log.i(C.TAG, "Facebook onFacebookError", e);
						callback("failureCBToken",
								"\"" + e.getLocalizedMessage() + "\"");
						cleanup();
					}

					@Override
					public void onError(DialogError e) {
						Log.i(C.TAG, "Facebook onError", e);
						callback("failureCBToken",
								"\"" + e.getLocalizedMessage() + "\"");
						cleanup();
					}

					@Override
					public void onComplete(Bundle values) {
						Log.i(C.TAG,
								"FacebookBackend.requireNewUserLogin(...).new DialogListener() {...}.onComplete: ");
						// Return token, user FBID, expiry date of token
						int fakeUserID = -1;
						callback("successCBToken", '"' + fakeUserID + '"',
								'"' + values.getString(Facebook.TOKEN) + '"',
								values.getString(Facebook.EXPIRES));
						cleanup();
					}

					@Override
					public void onCancel() {
						Log.i(C.TAG,
								"FacebookBackend.requireNewUserLogin(...).new DialogListener() {...}.onCancel: ");
						callback("cancelCBToken");
						cleanup();
					}
				});
	}

	public void authorizeCallback(int requestCode, int resultCode, Intent data) {
		Log.i(C.TAG, "FacebookBackend.authorizeCallback: ");
		Facebook fb = getFacebook();
		fb.authorizeCallback(requestCode, resultCode, data);
	}

	private void cleanupCallbacks(JSONObject obj, String... keys) {
		List<String> tokens = new ArrayList<String>();
		for (String tokenKey : keys) {
			String token = obj.optString(tokenKey);
			if (token != null && token.trim().length() > 0) {
				tokens.add(token);
			}
		}

		if (!tokens.isEmpty()) {
			mJS.deleteCallback(tokens.toArray(new String[tokens.size()]));
		}

	}

	@Override
	public void handlePostRequest_(final JSONObject params) {
		Log.i(C.TAG, "FacebookBackend.handlePostRequest_: " + params);

		Facebook fb = resetFacebook(getFacebook());

		fb.setAccessToken(params.optString("accessToken", ""));
		fb.setAccessExpires(params.optLong("tokenExpire", 0));

		JSONObject wallPostObj = params.optJSONObject("facebookKeyValues");

		Bundle parameters = new Bundle();
		parameters.putString("message", wallPostObj.optString("message", ""));
		parameters.putString("caption", wallPostObj.optString("caption", ""));
		parameters.putString("picture", wallPostObj.optString("picture", ""));
		parameters.putString("link", wallPostObj.optString("link", ""));
		parameters.putString("name", wallPostObj.optString("name", ""));

		fb.dialog(getCurrentActivity(), "feed", parameters,
				new DialogListener() {

					private void cleanup() {
						cleanupCallbacks(params, "onSuccessCBToken",
								"onCancelledCBToken", "onFailureCBToken");
					}

					private void callback(String tokenKey, Object... args) {
						String token = params.optString(tokenKey);
						if (token != null) {
							mJS.callCallback(token, args);
						}
					}

					@Override
					public void onComplete(Bundle values) {
						/**
						 * Because the Error / Failure callback will invoke a
						 * dialog informing the user an error has occured, we
						 * are calling the cancelled callback.
						 * 
						 * The rationale being that the Facebook Dialog displays
						 * its own error message, meaning its unneccessary to
						 * display a second error message
						 */
						Log.i(C.TAG,
								"FacebookBackend.handlePostRequest_(...).new DialogListener() {...}.onComplete: ");
						if (values.containsKey("error_code")) {
							callback("onCancelledCBToken");
						} else {
							callback("onSuccessCBToken");
							cleanup();
						}
					}

					@Override
					public void onFacebookError(FacebookError e) {
						Log.i(C.TAG,
								"FacebookBackend.handlePostRequest_(...).new DialogListener() {...}.onFacebookError: "
										+ e.getLocalizedMessage());
						callback("onFailureCBToken",
								"\"" + e.getLocalizedMessage() + "\"");
						cleanup();
					}

					@Override
					public void onError(DialogError e) {
						Log.i(C.TAG,
								"FacebookBackend.handlePostRequest_(...).new DialogListener() {...}.onError: "
										+ e.getLocalizedMessage());
						callback("onFailureCBToken",
								"\"" + e.getLocalizedMessage() + "\"");
						cleanup();
					}

					@Override
					public void onCancel() {
						Log.i(C.TAG,
								"FacebookBackend.handlePostRequest_(...).new DialogListener() {...}.onCancel: ");
						callback("onCancelledCBToken");
						cleanup();
					}

				});
	}

	@Override
	public void showErrorMessage_(String title, String msg) {
		Log.i(C.TAG, "FacebookBackend.showErrorMessage_: ");
		Activity currentActivity = getCurrentActivity();

		AlertDialog.Builder builder = new AlertDialog.Builder(currentActivity);
		builder.setMessage(msg).setCancelable(true).setTitle(title)
				.setNeutralButton(R.string.ok, null);
		AlertDialog alert = builder.create();
		alert.show();
	}
}

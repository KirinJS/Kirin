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


package com.futureplatforms.kirin;

public final class C {
	public static final String TAG = "Kirin";
	public static final int MENU_DUMP_DB = 0x1001;
	public static String JS_TAG = "Kirin.js";

	private static String sUserAgentString = "futureplatforms.com app"; // this will be replaced.

	public static final int REQUEST_CODE_FACEBOOK = 0xFACEB00;
	public static final int REQUEST_CODE_LOCALNOTIFICATION = 0xCAFE;
	
	public static final int REQUEST_CODE_ON_BOOT = 0xEEEB00;
    public static final String KEY_NOTIFICATION_STORE = "localNotifications";
    public static final String ACTION_LOCAL_NOTIFICATION = "com.futureplatforms.kirin.locationNotification";
    public static final String URI_SCHEME = "kirin";
    public static final String URI_HOST = "com.futureplatforms";
    public static final String URI_PATH_LOCALNOTIFICATION = "localNotifications";
    public static final boolean DEBUGGING_SHOW_NATIVE_TO_JS_CALLS = true;
    public static final boolean DEBUGGING_SHOW_CONSOLE_LOG = true;
	

	private C() {
		// no instantiation
	}


    public static void setUserAgentString(String userAgentString) {
        sUserAgentString = userAgentString;
    }

    public static String getUserAgentString() {
        return sUserAgentString;
    }
}

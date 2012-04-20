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


package com.futureplatforms.kirin.internal.fragmentation;

import java.text.MessageFormat;

import android.annotation.TargetApi;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;


import com.futureplatforms.kirin.C;

@TargetApi(8)
public class WebChromeClient8 extends WebChromeClient {

    // this will die on SDK < 8
    public boolean onConsoleMessage(ConsoleMessage m) {
        String sourceID = m.sourceId();
        sourceID = sourceID.substring(sourceID.lastIndexOf('/') + 1);
        String msg = MessageFormat.format("{2} (line {1}): {0}", m.message(), m.lineNumber(), sourceID);
        switch (m.messageLevel()) {
        case DEBUG:
            Log.d(C.JS_TAG, msg);
            break;
        case LOG:
            Log.i(C.JS_TAG, msg);
            break;
        case ERROR:
            Log.e(C.JS_TAG, msg);
            break;
        case WARNING:
            Log.w(C.JS_TAG, msg);
            break;
        default: 
            return super.onConsoleMessage(m);
        }
        return true;
    }
}

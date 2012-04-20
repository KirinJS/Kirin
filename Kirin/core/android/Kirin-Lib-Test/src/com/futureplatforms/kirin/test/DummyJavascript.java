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


package com.futureplatforms.kirin.test;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import junit.framework.Assert;
import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.IJava2Js;
import com.futureplatforms.kirin.IKirinDropbox;
import com.futureplatforms.kirin.internal.attic.KirinDropbox;

public class DummyJavascript implements IJava2Js {

    public Map<String, Object[]> mCallbacks = new HashMap<String, Object[]>();
    
    public List<String> mDeletedCallbacks = new ArrayList<String>();
    
    public List<String> mOrderOfCallbacks = new ArrayList<String>();

    private IKirinDropbox mDropbox = new KirinDropbox();
    
    public void clear() {
        mOrderOfCallbacks.clear();
        mCallbacks.clear();
        mDeletedCallbacks.clear();
        mDropbox  = new KirinDropbox();
    }
    
    @Override
    public void callCallback(String callback, Object... args) {
        if (callback == null) {
            return;
        }
        String s = MessageFormat.format(callback, args);
        Log.i(C.TAG, "DummyJavascript.callCallback: " + s);
        mCallbacks.put(callback, args);
        mOrderOfCallbacks.add(callback);
    }

    @Override
    public void callJS(String pattern, Object... args) {
        callCallback(pattern, args);
    }

    @Override
    public void deleteCallback(String... callbacks) {
        for (String cb : callbacks) {
            if (cb == null) {
                continue;
            }
            mDeletedCallbacks.add(cb);
        }
    }
    
    public void verifyCalledCallbacks(String... callbacks) {
        Assert.assertEquals(Arrays.asList(callbacks), mOrderOfCallbacks);
    }
    
    public void verifyDeletedCallbacks(String... expectedCallbacks) {
        checkCallbacks(mDeletedCallbacks, expectedCallbacks);
    }

    private void checkCallbacks(List<String> observedCallbacks, String... expectedCallbacks) {
        String message = MessageFormat.format("Expected {0} but observed {1}", Arrays.asList(expectedCallbacks), observedCallbacks);
        if (expectedCallbacks.length != observedCallbacks.size()) {
            Assert.fail(message);
        }
        
        for (int i=0; i<expectedCallbacks.length; i++) {
            Assert.assertTrue(message, observedCallbacks.contains(expectedCallbacks[i]));
        }
    }

    @Override
    public IKirinDropbox getDropbox() {
        return mDropbox;
    }

    public void verifyCallback(String string, Object... expectedArgs) {
        Object[] actualArgs = mCallbacks.get(string);
        
        Assert.assertEquals("Number of args for " + string + " callback does not match", expectedArgs.length, actualArgs.length);
        
        for (int i=0; i<expectedArgs.length; i++) {
            
            Assert.assertEquals(expectedArgs[i].toString(), actualArgs[i].toString());
        }
    }
    
    public Object[] getCallbackArgs(String callbackName) {
        return mCallbacks.get(callbackName);
    }

    public String getPathToJavascriptDir() {
        return "javascript";
    }

    @Override
    public Object getService(String proxyName) {
        // TODO Auto-generated method stub
        return null;
    }
}

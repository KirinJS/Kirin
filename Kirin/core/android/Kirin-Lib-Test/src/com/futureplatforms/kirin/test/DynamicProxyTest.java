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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.test.AndroidTestCase;

import com.futureplatforms.kirin.internal.attic.ProxyGenerator;
import com.futureplatforms.kirin.test.dummies.DummyJavascript;
import com.futureplatforms.kirin.test.dummies.DummyKirinHelper;

public class DynamicProxyTest extends AndroidTestCase {
    private DummyJavascript mJS;
    private ProxyGenerator mGenerator;

    public static interface ITestInterface {
        void withNoArgs();
        void withOneArg(String s);
        void withOneArg(int s);
        void withOneArg(boolean s);

        void withTwoArgs(String s1, boolean s2);
        
        void withTwoArgs(JSONArray array, JSONObject object);
    }
    
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        
        mJS = new DummyJavascript();
        
        mGenerator = new ProxyGenerator();
    }
    
    public void testInvocationHandler() throws JSONException {
        ITestInterface proxy = mGenerator.generate(new DummyKirinHelper(), ITestInterface.class);
        
        proxy.withNoArgs();
        
        proxy.withTwoArgs("foo", true);
        
        JSONArray array = new JSONArray("[1,2,3]");
        proxy.withTwoArgs(array, new JSONObject("{}"));
    }
    
}

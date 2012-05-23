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
import com.futureplatforms.kirin.test.dummies.DummyKirinHelper;

public class DynamicProxyTest extends AndroidTestCase {
    private ProxyGenerator mGenerator;
	private DummyKirinHelper mKirinHelper;

    public static interface ITestModule {
        void withNoArgs();
        void withOneArg(String s);
        void withOneArg(int s);
        void withOneArg(boolean s);

        void withTwoArgs(String s1, boolean s2);
        
        void withTwoArgs(JSONArray array, JSONObject object);
    }
    
    public static interface ITestResponse {
    	void setId(long id);
    	void setName(String name);
    }
    
    public static interface ITestParams {
    	long getId();
    	String getName();
    }
    
    public static interface ITestRequest {
    	void callback(ITestResponse response);
    	void errback(int number, boolean flag);
    	
    	String getName();
    	boolean isReady();
    	
    	ITestParams getParams();
    }
    
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        
        
        mGenerator = new ProxyGenerator();
        
        mKirinHelper = new DummyKirinHelper();
    }
    
    
    
    public void testModuleProxy() throws JSONException {
        ITestModule proxy = mGenerator.javascriptProxyForModule(mKirinHelper, ITestModule.class);
        
        proxy.withNoArgs();
        
        proxy.withTwoArgs("foo", true);
        
        JSONArray array = new JSONArray("[1,2,3]");
        proxy.withTwoArgs(array, new JSONObject("{}"));
    }
    
    public void testRequestProxy() throws JSONException {
    	JSONObject obj = new JSONObject();
    	ITestRequest proxy = mGenerator.javascriptProxyForRequest(mKirinHelper, obj, ITestRequest.class);
    	
    	obj.put("name", "myName");
    	obj.put("ready", true);
    	
    	assertEquals(obj.optString("name"), proxy.getName());
    	assertEquals(obj.optBoolean("ready"), proxy.isReady());
    	
    	JSONObject paramsObject = new JSONObject();
    	paramsObject.put("name", "anotherName");
    	paramsObject.put("id", 42l);
    	
    	obj.put("params", paramsObject);
    	
    	ITestParams params = proxy.getParams();
    	assertNotNull(params);
    	assertTrue(params instanceof ITestParams);
    	
    	assertEquals(paramsObject.opt("name"), params.getName());
    	
    }
    
}

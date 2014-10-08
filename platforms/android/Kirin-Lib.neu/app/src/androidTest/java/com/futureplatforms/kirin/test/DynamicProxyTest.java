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
        
        void withTwoJsonArgs(JSONArray array, JSONObject object);
    }
    
    public static interface ITestResponse {
    	void setId(long id);
    	void setName(String name);
    }
    
    public static interface ITestParams {
    	long getId();
    	String getName();
    	
    	void setName(String name);
    	void setId(long id);
    }
    
    public static interface ITestRequest {
    	void callback2(ITestResponse response, String string);
    	void callback(ITestResponse response);
    	void errback(int number, boolean flag);
    	
    	String getName();
    	boolean isReady();
    	
    	ITestParams getParams();
    }
    
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        
        mKirinHelper = new DummyKirinHelper();
        mGenerator = new ProxyGenerator(mKirinHelper);
    }
    
    
    
    public void testModuleProxy() throws JSONException {
        ITestModule proxy = mGenerator.javascriptProxyForModule(ITestModule.class);
        
        proxy.withNoArgs();
        assertEquals("withNoArgs[]", mKirinHelper.mLastCall);
        
        proxy.withTwoArgs("foo", true);
        // toString is being called, so foo isn't being quited.
        assertEquals("withTwoArgs[foo, true]", mKirinHelper.mLastCall);
        
        JSONArray array = new JSONArray("[1,2,3]");
        proxy.withTwoJsonArgs(array, new JSONObject("{}"));
        assertEquals("withTwoJsonArgs[[1,2,3], {}]", mKirinHelper.mLastCall);
    }
    
    public void testRequestProxy_properties() throws JSONException {
    	JSONObject obj = new JSONObject();
    	ITestRequest proxy = mGenerator.javascriptProxyForRequest(obj, ITestRequest.class);
    	
    	obj.put("name", "myName");
    	obj.put("ready", true);
    	
    	
    	// Test getters.
    	assertEquals(obj.optString("name"), proxy.getName());
    	assertEquals(obj.optBoolean("ready"), proxy.isReady());
    	
    	// Test more complicated getters, with interfaces.
    	JSONObject paramsObject = new JSONObject();
    	paramsObject.put("name", "anotherName");
    	paramsObject.put("id", 42l);
    	
    	obj.put("params", paramsObject);
    	
    	ITestParams params = proxy.getParams();
    	assertNotNull(params);
    	assertTrue(params instanceof ITestParams);
    	
    	assertEquals(paramsObject.opt("name"), params.getName());
    	
    	// test removals from the backing object, and toString().
    	obj.remove("ready");
    	obj.remove("params");
    	assertEquals("{\"name\":\"myName\"}", proxy.toString());
    }
    
    public void testRequestProxy_callingMethods() throws JSONException {
    	JSONObject obj = new JSONObject();
    	ITestRequest proxy = mGenerator.javascriptProxyForRequest(obj, ITestRequest.class);
    	
    	obj.put("name", "myName");
    	obj.put("ready", true);
    	
    	
    	// test method calls
    	obj.put("__id", "myCallbackObj0");
    	// the method won't fire if it's not present in the object.
    	//obj.put("errback", true);
    	proxy.errback(32, false);
    	assertNull(mKirinHelper.mLastCall);
    	
    	// now the method will be called.
    	obj.put("errback", true);
    	proxy.errback(32, false);
    	assertEquals("myCallbackObj0.errback[32, false]", mKirinHelper.mLastCall);
    	
    	obj.put("callback", true);
    	
    	ITestResponse response = mGenerator.javascriptProxyForResponse(new JSONObject(), ITestResponse.class);
    	
    	response.setName("poobah");
    	proxy.callback(response);
    	
    	assertEquals("myCallbackObj0.callback[{\"name\":\"poobah\"}]", mKirinHelper.mLastCall);
    	
    	mKirinHelper.clear();
    	obj.put("callback2", true);
    	proxy.callback2(response, "paz");
    	assertEquals("myCallbackObj0.callback2[{\"name\":\"poobah\"}, paz]", mKirinHelper.mLastCall);
    }

    public void testResponseProxy() throws JSONException {
    	JSONObject obj = new JSONObject();
    	ITestParams proxy = mGenerator.javascriptProxyForResponse(obj, ITestParams.class);
    	
    	obj.put("name", "initialName");
    	assertEquals("{\"name\":\"initialName\"}", proxy.toString());
    	
    	obj.put("id", 56l);
    	assertEquals(obj.optString("name"), proxy.getName());
    	assertEquals(obj.optLong("id"), proxy.getId());
    	
    	String newName = "myNewName";
    	long newId = 32l;
    	proxy.setName(newName);
    	proxy.setId(newId);
    	assertEquals(newName, obj.optString("name"));
    	assertEquals(newId, obj.optLong("id"));
    	
    	
    }
    
}

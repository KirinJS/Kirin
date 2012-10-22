package com.futureplatforms.kirin.test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;

import android.test.AndroidTestCase;

import com.futureplatforms.kirin.helpers.IKirinHelper;
import com.futureplatforms.kirin.helpers.KirinHelper;
import com.futureplatforms.kirin.test.dummies.DummyJsContext;
import com.futureplatforms.kirin.test.dummies.DummyNativeContext;

public class KirinHelperTest extends AndroidTestCase {

	private static final String MY_MODULE_NAME = "MyModule";
	private IKirinHelper mKirinHelper;
	private DummyJsContext mJsContext;
	private DummyNativeContext mNativeContext;
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
		mJsContext = new DummyJsContext();
		mNativeContext = new DummyNativeContext();
		mKirinHelper = new KirinHelper(this, MY_MODULE_NAME, mJsContext, mNativeContext, null);
	}
	
	public void testLifecycle() {
		
		assertFalse(mNativeContext.isModuleRegistered());
		assertNull(mNativeContext.mLastModuleName);
		assertNull(mNativeContext.mLastNativeObject);
		
		List<String> methods = Arrays.asList("foo", "bar", "baz");
		mNativeContext.setDummyMethods(methods);
		
		
		mKirinHelper.onLoad();
		
		assertTrue(mNativeContext.isModuleRegistered());
		
		assertSame(this, mNativeContext.mLastNativeObject);
		
		// prove that the js context has had the object proxy call.
		assertEquals(MY_MODULE_NAME, mNativeContext.mLastModuleName);
		assertEquals("EXPOSED_TO_NATIVE.native2js.loadProxyForModule('MyModule', ['foo','bar','baz'])", mJsContext.mLastCall);
		
		// now to test onUnload();
		mKirinHelper.onUnload();
		
		assertFalse(mNativeContext.isModuleRegistered());
		assertEquals("EXPOSED_TO_NATIVE.native2js.unloadProxyForModule('MyModule')", mJsContext.mLastCall);
	}
	
	public void testJsMethod_noArgs() {
		assertNull(mJsContext.mLastCall);
		
		mKirinHelper.jsMethod("aMethodCall");
		
		assertTrue(mJsContext.mLastCall.contains(MY_MODULE_NAME));
		assertTrue(mJsContext.mLastCall.contains("aMethodCall"));
		
		assertEquals("EXPOSED_TO_NATIVE.native2js.execMethod('MyModule', 'aMethodCall', null, null)", mJsContext.mLastCall);		
	}
	
	public void testJsMethod_withTypedArg() {
		assertNull(mJsContext.mLastCall);
		
		mKirinHelper.jsMethod("aMethodCallWithArgs", 1);
		
		assertTrue(mJsContext.mLastCall.contains(MY_MODULE_NAME));
		assertTrue(mJsContext.mLastCall.contains("aMethodCallWithArgs"));
		
		assertEquals("EXPOSED_TO_NATIVE.native2js.execMethod('MyModule', 'aMethodCallWithArgs', [1], null)", mJsContext.mLastCall);
		mJsContext.reset();
		testJsMethod_withArgs("1", 1);
		testJsMethod_withArgs("1000000000", 1000000000); // no commas 
		testJsMethod_withArgs("1000000000000", 1000000000000l); // no commas 
		testJsMethod_withArgs("2.0", 2.0d);
		testJsMethod_withArgs("2.0", 2.0f);
		testJsMethod_withArgs("true", true);
		testJsMethod_withArgs("\'testingString\'", "testingString");
		testJsMethod_withArgs("\'testingStri\\'ng\'", "testingStri'ng");
		testJsMethod_withArgs("\'testingStri\\ng\'", "testingStri\ng");
		
		testJsMethod_withArgs("'a string'", "a string");
		
		
		testJsMethod_withArgs("[]", new ArrayList<String>());
		testJsMethod_withArgs("[1,2,3]", Arrays.asList(1,2,3));
		
		Map<String, Integer> map = new HashMap<String, Integer>();
		testJsMethod_withArgs("{}", map);
		
		map.put("key", 1);
		testJsMethod_withArgs("{\"key\":1}", map);
		
		// this behaviour reflects how JSONObject works. 
		Map<String, IKirinHelper> difficultMap = new HashMap<String, IKirinHelper>();
		difficultMap.put("key", mKirinHelper);
		testJsMethod_withArgs("{\"key\":\"" + mKirinHelper + "\"}", difficultMap);
	}
	
	public void testJsMethod_withMultipleArgs() {
		testJsMethod_withArgs("1,true", 1, true);
		testJsMethod_withArgs("2.0,false", 2.0d, false);
		testJsMethod_withArgs("2.0,[3,4,5]", 2.0f, Arrays.asList(3,4,5));
		testJsMethod_withArgs("true,1.0", true, 1.0d);
	}
	
	public void testJsMethod_withArgs(String expectedArgsList, Object... args) {
		assertNull(mJsContext.mLastCall);
		
		mKirinHelper.jsMethod("aMethodCallWithArgs", (Object[]) args);
		assertTrue(mJsContext.mLastCall.contains(MY_MODULE_NAME));
		assertTrue(mJsContext.mLastCall.contains("aMethodCallWithArgs"));
		assertTrue("Found: " + mJsContext.mLastCall, mJsContext.mLastCall.contains(expectedArgsList));
		mJsContext.reset();
	}
	
	
	
	public void testJsCallback_noArgs() {
		assertNull(mJsContext.mLastCall);
		
		mKirinHelper.jsCallback("callback001");
		
		assertTrue(mJsContext.mLastCall.contains("callback001"));
		
		assertEquals("EXPOSED_TO_NATIVE.native2js.execCallback('callback001')", mJsContext.mLastCall);
		mJsContext.reset();
	}
	
	public void testJsCallback_witSingleArg() {
		assertNull(mJsContext.mLastCall);
		mKirinHelper.jsCallback("callback001", 1);
		
		assertTrue(mJsContext.mLastCall.contains("callback001"));
		assertEquals("EXPOSED_TO_NATIVE.native2js.execCallback('callback001', [1])", mJsContext.mLastCall);
		mJsContext.reset();
	}
	
	public void testJsCallback_witMultipleArgs() {
		assertNull(mJsContext.mLastCall);
		mKirinHelper.jsCallback("callback001", 1, true);
		
		assertTrue(mJsContext.mLastCall.contains("callback001"));
		assertEquals("EXPOSED_TO_NATIVE.native2js.execCallback('callback001', [1,true])", mJsContext.mLastCall);
		mJsContext.reset();
	}
	
	public void testCleanupCallbacks() {
		assertNull(mJsContext.mLastCall);
		mKirinHelper.cleanupCallback();
		assertNull(mJsContext.mLastCall);
		
		
		mKirinHelper.cleanupCallback("callback001");
		assertEquals("EXPOSED_TO_NATIVE.native2js.deleteCallback(['callback001'])", mJsContext.mLastCall);
		mJsContext.reset();

		mKirinHelper.cleanupCallback("callback001", "callback002");
		assertEquals("EXPOSED_TO_NATIVE.native2js.deleteCallback(['callback001','callback002'])", mJsContext.mLastCall);
		mJsContext.reset();
	}
	
	public void testCleanupCallbacks_withConfigObject() throws JSONException {
		JSONObject config = new JSONObject();
		assertNull(mJsContext.mLastCall);
		mKirinHelper.cleanupCallback(config);
		assertNull(mJsContext.mLastCall);
		
		mKirinHelper.cleanupCallback(config, "non-existant-callback");
		assertNull(mJsContext.mLastCall, mJsContext.mLastCall);
		
		config.put("callback", "callback001");
		mKirinHelper.cleanupCallback(config, "callback");
		assertEquals("EXPOSED_TO_NATIVE.native2js.deleteCallback(['callback001'])", mJsContext.mLastCall);
		mJsContext.reset();
		
		config.put("errback", "errback002");
		mKirinHelper.cleanupCallback(config, "callback", "errback");
		assertEquals("EXPOSED_TO_NATIVE.native2js.deleteCallback(['callback001','errback002'])", mJsContext.mLastCall);
		mJsContext.reset();

	}
}

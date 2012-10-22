package com.futureplatforms.kirin.helpers;

import org.json.JSONObject;

import com.futureplatforms.kirin.state.IKirinDropbox;
import com.futureplatforms.kirin.state.IKirinFileSystem;

public interface IKirinHelper {

	/*
	 * Calling Javascript
	 */
	
	/**
	 * Call a method on the bound module, with the given arguments. 
	 * Arguments should be already prepared for execution by Javascript.
	 * 
	 * @param methodName
	 * @param args
	 */
	void jsMethod(String methodName, Object... args);
	
	void jsCallbackObjectMethod(String objectId, String methodName, Object... args);
	
	<T> T jsSyncMethod(Class<T> returnType, String methodName, Object... args);
	
	<T> T jsSyncCallbackObjectMethod(String objectId, Class<T> returnType, String methodName, Object... args);
	
	@Deprecated
	void jsCallback(String callbackId, Object... args);
	
	@Deprecated
	void jsCallback(JSONObject config, String callbackName, Object... args);
	
	@Deprecated
	void cleanupCallback(String... callbackIds);
	
	@Deprecated
	void cleanupCallback(JSONObject config, String... callbackNames);
	
	/*
	 * Application State.
	 */
	
	IKirinDropbox getDropbox();
	
	IKirinFileSystem getFileSystem();
	
	/*
	 * Lifecycle methods.
	 */
	
	void onLoad();
	
	void onUnload();
	
	<T> T javascriptProxyForModule(Class<T> interfaceClass);
}

package com.futureplatforms.kirin.helpers;

import org.json.JSONObject;

import com.futureplatforms.kirin.IKirinDropbox;

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
	
	void jsCallback(String callbackId, Object... args);
	
	void jsCallback(JSONObject config, String callbackName, Object... args);
	
	void cleanupCallback(String... callbackIds);
	
	void cleanupCallback(JSONObject config, String... callbackNames);
	
	/*
	 * Application State.
	 */
	
	IKirinDropbox getDropbox();
	
	/*
	 * Lifecycle methods.
	 */
	
	void onLoad();
	
	void onUnload();
}

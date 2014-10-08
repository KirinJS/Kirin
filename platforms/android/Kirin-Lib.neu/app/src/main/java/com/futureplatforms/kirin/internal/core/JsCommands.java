package com.futureplatforms.kirin.internal.core;

public final class JsCommands {
	public static final String EXECUTE_METHOD_JS = "EXPOSED_TO_NATIVE.native2js.execMethod(''{0}'', ''{1}'', null, {2})";
	public static final String EXECUTE_METHOD_JS_WITH_ARGS = "EXPOSED_TO_NATIVE.native2js.execMethod(''{0}'', ''{1}'', [{2}], {3})";
	
	public static final String REGISTER_MODULE_WITH_METHODS = "EXPOSED_TO_NATIVE.native2js.loadProxyForModule(''{0}'', [''{1}''])";
	public static final String UNREGISTER_MODULE = "EXPOSED_TO_NATIVE.native2js.unloadProxyForModule(''{0}'')";
	
	public static final String EXECUTE_CALLBACK_METHOD_JS = "EXPOSED_TO_NATIVE.native2js.execCallbackMethod(''{0}'', ''{1}'', null, {2})";
	public static final String EXECUTE_CALLBACK_METHOD_WITH_ARGS_JS = "EXPOSED_TO_NATIVE.native2js.execCallbackMethod(''{0}'', ''{1}'', [{2}], {3})";
	
	@Deprecated
	public static final String EXECUTE_CALLBACK_JS = "EXPOSED_TO_NATIVE.native2js.execCallback(''{0}'')";
	@Deprecated
	public static final String EXECUTE_CALLBACK_WITH_ARGS_JS = "EXPOSED_TO_NATIVE.native2js.execCallback(''{0}'', [{1}])";
	@Deprecated
	public static final String DELETE_CALLBACK_JS = "EXPOSED_TO_NATIVE.native2js.deleteCallback([''{0}''])";
	
}

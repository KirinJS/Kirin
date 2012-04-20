package com.futureplatforms.kirin.internal;

public final class JsCommands {
	public static final String EXECUTE_METHOD_JS = "EXPOSED_TO_NATIVE.native2js.execMethod(''{0}'', ''{1}'')";
	public static final String EXECUTE_METHOD_JS_WITH_ARGS = "EXPOSED_TO_NATIVE.native2js.execMethod(''{0}'', ''{1}'', [{2}])";
	public static final String EXECUTE_CALLBACK_JS = "EXPOSED_TO_NATIVE.native2js.execCallback(''{0}'')";
	public static final String EXECUTE_CALLBACK_WITH_ARGS_JS = "EXPOSED_TO_NATIVE.native2js.execCallback(''{0}'', [{1}])";
	public static final String DELETE_CALLBACK_JS = "EXPOSED_TO_NATIVE.native2js.deleteCallback([''{0}''])";
	public static final String REGISTER_MODULE_WITH_METHODS = "EXPOSED_TO_NATIVE.native2js.loadProxyForModule(''{0}'', [''{1}''])";
	public static final String UNREGISTER_MODULE = "EXPOSED_TO_NATIVE.native2js.unloadProxyForModule(''{0}'')";
}

package com.futureplatforms.kirin.internal.core;

import java.util.Collection;

public interface INativeContext {
	Collection<String> getMethodNamesForObject(String objectName);
	
	void registerNativeObject(String moduleName, Object object);
	
	void unregisterNativeObject(String moduleName);
	
	void executeCommandFromModule(String moduleName, String methodName, Object... args);
}

package com.futureplatforms.kirin.internal.core;

import java.util.Collection;

import com.futureplatforms.kirin.internal.attic.ProxyGenerator;

public interface INativeContext {
	Collection<String> getMethodNamesForObject(String objectName);
	
	void registerNativeObject(String moduleName, Object object, ProxyGenerator proxyGenerator);
	
	void unregisterNativeObject(String moduleName);
	
	void executeCommandFromModule(String moduleName, String methodName, Object... args);
}

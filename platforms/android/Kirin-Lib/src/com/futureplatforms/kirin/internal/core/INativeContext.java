package com.futureplatforms.kirin.internal.core;

import java.util.Collection;

import com.futureplatforms.kirin.internal.attic.ProxyGenerator;
import com.futureplatforms.kirin.internal.core.NativeContext.SettableFuture;

public interface INativeContext {
	Collection<String> getMethodNamesForObject(String objectName);
	
	void registerNativeObject(String moduleName, Object object, ProxyGenerator proxyGenerator);
	
	void unregisterNativeObject(String moduleName);
	
	void executeCommandFromModule(String moduleName, String methodName, Object... args);
	
	<T> SettableFuture<T> getFuture(Long id);
	
	<T> void setReturnValue(Long id, T value);
	
	Long createNewId();
}

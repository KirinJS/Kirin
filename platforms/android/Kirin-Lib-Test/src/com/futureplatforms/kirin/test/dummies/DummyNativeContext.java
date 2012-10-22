package com.futureplatforms.kirin.test.dummies;

import java.util.Collection;
import java.util.List;

import com.futureplatforms.kirin.internal.attic.ProxyGenerator;
import com.futureplatforms.kirin.internal.core.INativeContext;
import com.futureplatforms.kirin.internal.core.NativeContext.SettableFuture;

public class DummyNativeContext implements INativeContext {

	private Collection<String> mMethodNames;
	
	public String mLastModuleName;
	
	public Object mLastNativeObject;
	
	public void setDummyMethods(List<String> methodNames) {
		mMethodNames = methodNames;
	}
	
	@Override
	public Collection<String> getMethodNamesForObject(String moduleName) {
		return mMethodNames;
	}

	@Override
	public void registerNativeObject(String moduleName, Object object, ProxyGenerator proxyGenerator) {
		mLastModuleName = moduleName;
		mLastNativeObject = object;
	}

	@Override
	public void unregisterNativeObject(String moduleName) {
		if (moduleName == null || moduleName.equals(mLastModuleName)) {
			mLastModuleName = null;
			mLastNativeObject = null;
		}
	}
	
	@Override
	public void executeCommandFromModule(String moduleName, String methodName,
			Object... args) {
		// NOP
	}

	// Helpful for testing.
	
	public boolean isModuleRegistered() {
		return mLastModuleName != null;
	}
	
	public void reset() {
		unregisterNativeObject(null);
		mMethodNames = null;
	}

	@Override
	public <T> SettableFuture<T> getFuture(Long id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public <T> void setReturnValue(Long id, T value) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Long createNewId() {
		// TODO Auto-generated method stub
		return null;
	}


	
}

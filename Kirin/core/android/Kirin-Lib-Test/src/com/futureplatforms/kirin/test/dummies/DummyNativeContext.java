package com.futureplatforms.kirin.test.dummies;

import java.util.Collection;
import java.util.List;

import com.futureplatforms.kirin.core.internal.INativeContext;

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
	public void registerNativeObject(String moduleName, Object object) {
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


	
}

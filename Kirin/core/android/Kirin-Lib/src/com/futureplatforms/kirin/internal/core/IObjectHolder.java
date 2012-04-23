package com.futureplatforms.kirin.internal.core;

import java.util.Collection;

public interface IObjectHolder {

	public void invoke(String methodName, Object... args);
	
	Collection<String> getMethodNames();
}

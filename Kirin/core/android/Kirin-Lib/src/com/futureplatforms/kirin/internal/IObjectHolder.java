package com.futureplatforms.kirin.internal;

import java.util.Collection;

public interface IObjectHolder {

	public void invoke(String methodName, Object... args);
	
	Collection<String> getMethodNames();
}

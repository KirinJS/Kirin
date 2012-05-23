package com.futureplatforms.kirin.internal.core;

import java.util.concurrent.Executor;

import com.futureplatforms.kirin.internal.attic.ProxyGenerator;

public class DefaultObjectHandler extends AbstractObjectHolder {

	private final Executor mExecutor;
	
	public DefaultObjectHandler(Executor executor, Object object, ProxyGenerator proxyGenerator) {
		super(object, proxyGenerator);
		mExecutor = executor;
	}
	
	@Override
	protected void enqueue(Runnable methodCall) {
		mExecutor.execute(methodCall);
	}

}

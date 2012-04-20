package com.futureplatforms.kirin.internal;

import java.util.concurrent.Executor;

public class DefaultObjectHandler extends AbstractObjectHolder {

	private final Executor mExecutor;
	
	public DefaultObjectHandler(Executor executor, Object object) {
		super(object);
		mExecutor = executor;
	}
	
	@Override
	protected void enqueue(Runnable methodCall) {
		mExecutor.execute(methodCall);
	}

}

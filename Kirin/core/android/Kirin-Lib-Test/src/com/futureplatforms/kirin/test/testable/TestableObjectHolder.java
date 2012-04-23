package com.futureplatforms.kirin.test.testable;

import com.futureplatforms.kirin.core.internal.AbstractObjectHolder;

public class TestableObjectHolder extends AbstractObjectHolder {

	public TestableObjectHolder(Object nativeObject) {
		super(nativeObject);
	}

	@Override
	protected void enqueue(Runnable methodCall) {
		// no queuing, just run inline.
		methodCall.run();
	}

}

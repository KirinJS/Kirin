package com.futureplatforms.kirin.test.testable;

import com.futureplatforms.kirin.internal.attic.ProxyGenerator;
import com.futureplatforms.kirin.internal.core.AbstractObjectHolder;

public class TestableObjectHolder extends AbstractObjectHolder {

	public TestableObjectHolder(Object nativeObject) {
		super(nativeObject, new ProxyGenerator(null));
	}

	@Override
	protected void enqueue(Runnable methodCall) {
		// no queuing, just run inline.
		methodCall.run();
	}

}

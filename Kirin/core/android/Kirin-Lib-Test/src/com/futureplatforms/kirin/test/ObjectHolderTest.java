package com.futureplatforms.kirin.test;

import java.util.Collection;

import com.futureplatforms.kirin.test.testable.TestableObjectHolder;

import android.test.AndroidTestCase;

public class ObjectHolderTest extends AndroidTestCase {

	private TestableObjectHolder mObjectHolder;

	private enum LastMethod {
		NO_ARGS, SINGLE_ARG, TWO_ARGS;
	}
	

	
	private LastMethod mLastMethodCalled;
	private Object[] mLastArgs;
	
	@Override
	protected void setUp() throws Exception {
		
		super.setUp();
		
		mObjectHolder = new TestableObjectHolder(this);
	}
	
	public void testGetMethodNames() {
		
		Collection<String> methodNames = mObjectHolder.getMethodNames();
		
		assertTrue(methodNames + "", methodNames.contains("testGetMethodNames"));
		assertTrue(methodNames + "", methodNames.contains("myDummyNoArgMethod"));
		assertTrue(methodNames + "", methodNames.contains("myDummySingleArgMethod"));
		
		// the method doesn't exist.
		assertFalse(methodNames + "", methodNames.contains("methodDoesNotExist"));

		
		// even though the method exists, it's an android framework method, so we don't want to give it access.
		// declared by a android.* class, so we shouldn't expect it to be exposed to Javascript
		assertFalse(methodNames + "", methodNames.contains("setUp"));
		
		// declared by a java.* class, so we shouldn't expect it to be exposed to Javascript
		assertFalse(methodNames + "", methodNames.contains("hashCode"));
		
		
	}
	
	public void testInvocation() {
		mObjectHolder.invoke("myDummyNoArgMethod");
		assertEquals(LastMethod.NO_ARGS, mLastMethodCalled);
		assertTrue(mLastArgs.length == 0);
		
		mObjectHolder.invoke("myDummySingleArgMethod", 42);
		assertEquals(LastMethod.SINGLE_ARG, mLastMethodCalled);
		assertTrue(mLastArgs.length == 1);
		assertTrue(mLastArgs[0].equals(42));
	}
	
	public void myDummyNoArgMethod() {
		mLastMethodCalled = LastMethod.NO_ARGS;
		mLastArgs = new Object[0];
	}
	
	public void myDummySingleArgMethod(int i) {
		mLastMethodCalled = LastMethod.SINGLE_ARG;
		mLastArgs = new Object[] {i};
	}
}

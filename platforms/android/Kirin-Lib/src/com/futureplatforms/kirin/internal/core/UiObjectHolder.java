package com.futureplatforms.kirin.internal.core;


import android.os.Handler;

public class UiObjectHolder extends AbstractObjectHolder {

	private final Handler mHandler;
	
	public UiObjectHolder(Handler handler, Object nativeObject) {
		super(nativeObject);
		mHandler = handler;
	}
	
	@Override
	protected void enqueue(Runnable methodCall) {
		mHandler.post(methodCall);
	}

}

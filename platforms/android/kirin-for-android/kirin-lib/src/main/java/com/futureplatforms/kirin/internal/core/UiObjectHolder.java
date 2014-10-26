package com.futureplatforms.kirin.internal.core;


import com.futureplatforms.kirin.internal.attic.ProxyGenerator;

import android.os.Handler;

public class UiObjectHolder extends AbstractObjectHolder {

	private final Handler mHandler;
	
	public UiObjectHolder(Handler handler, Object nativeObject, ProxyGenerator proxyGenerator) {
		super(nativeObject, proxyGenerator);
		mHandler = handler;
	}
	
	@Override
	protected void enqueue(Runnable methodCall) {
		mHandler.post(methodCall);
	}

}

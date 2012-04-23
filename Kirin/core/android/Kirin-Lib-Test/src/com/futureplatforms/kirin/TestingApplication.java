package com.futureplatforms.kirin;

import android.app.Application;

import com.futureplatforms.kirin.helpers.IKirinApplication;

public class TestingApplication extends Application implements IKirinApplication {

	private Kirin mKirin;

	@Override
	public void onCreate() {
		mKirin = Kirin.create(this.getApplicationContext());
		super.onCreate();
	}
	
	@Override
	public Kirin getKirin() {
		return mKirin;
	}

}

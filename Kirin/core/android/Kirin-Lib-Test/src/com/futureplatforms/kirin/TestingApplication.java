package com.futureplatforms.kirin;

import com.futureplatforms.kirin.helpers.IKirinApplication;

import android.app.Application;

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

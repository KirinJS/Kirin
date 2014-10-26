package com.futureplatforms.kirin.application;

import android.app.Application;

import com.futureplatforms.kirin.Kirin;

public class KirinApplication extends Application implements IKirinApplication {

	protected Kirin mKirin;
	
	@Override
	public void onCreate() {
		super.onCreate();
		mKirin = createKirin();
	}
	
	@Override
	public Kirin getKirin() {
		return mKirin;
	}
	
	protected Kirin createKirin() {
		return Kirin.create(this.getApplicationContext());
	}

}

package com.futureplatforms.kirin.internal;

import android.app.Activity;

import com.futureplatforms.kirin.IKirinDropbox;
import com.futureplatforms.kirin.helpers.IKirinState;
import com.futureplatforms.kirin.internal.attic.KirinDropbox;

public class KirinAppState implements IKirinState {

	private final IKirinDropbox mDropbox;
	
	public KirinAppState() {
		this(null);
	}
	
	public KirinAppState(IKirinDropbox dropbox) {
		if (dropbox == null) {
			dropbox = new KirinDropbox();
		}
		mDropbox = dropbox;
	}
	
	@Override
	public Activity getActivity() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public IKirinDropbox getDropbox() {
		return mDropbox;
	}

	@Override
	public void setActivity(Activity activity) {
		// TODO Auto-generated method stub
		
	}

}

package com.futureplatforms.kirin.internal;

import android.app.Activity;

import com.futureplatforms.kirin.IKirinDropbox;
import com.futureplatforms.kirin.extensions.IKirinExtension;
import com.futureplatforms.kirin.helpers.IKirinState;
import com.futureplatforms.kirin.internal.attic.KirinDropbox;

public class KirinAppState implements IKirinState {

	private final IKirinDropbox mDropbox;
	
	private Activity mCurrentActivity;
	
	private IKirinExtension mCurrentExtension;
	
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
	public IKirinDropbox getDropbox() {
		return mDropbox;
	}

	@Override
	public void setActivity(Activity activity) {
		mCurrentActivity = activity;
	}

	@Override
	public Activity getActivity() {
		return mCurrentActivity;
	}
	
	@Override
	public void setActiveExtension(IKirinExtension extension) {
		mCurrentExtension = extension;
	}

	@Override
	public IKirinExtension getActiveExtension() {
		return mCurrentExtension;
	}


}

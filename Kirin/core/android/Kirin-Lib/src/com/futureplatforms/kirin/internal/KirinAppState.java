package com.futureplatforms.kirin.internal;

import android.app.Activity;
import android.content.Context;

import com.futureplatforms.kirin.IKirinDropbox;
import com.futureplatforms.kirin.extensions.IKirinExtension;
import com.futureplatforms.kirin.helpers.IKirinState;
import com.futureplatforms.kirin.internal.attic.KirinDropbox;
import com.futureplatforms.kirin.state.IKirinFileSystem;

public class KirinAppState implements IKirinState {

	private final IKirinDropbox mDropbox;
	
	private final IKirinFileSystem mPaths;
	
	private Activity mCurrentActivity;
	
	private IKirinExtension mCurrentExtension;
	
	public KirinAppState(Context context) {
		this(context, null, null);
	}
	
	public KirinAppState(Context context, IKirinDropbox dropbox, IKirinFileSystem paths) {
		if (dropbox == null) {
			dropbox = new KirinDropbox();
		}
		mDropbox = dropbox;
		if (paths == null) {
			paths = new KirinPaths(context);
		}
		
		mPaths = paths;
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

	@Override
	public IKirinFileSystem getPaths() {
		return mPaths;
	}


}

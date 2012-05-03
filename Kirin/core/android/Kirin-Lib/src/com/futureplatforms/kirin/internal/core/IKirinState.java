package com.futureplatforms.kirin.internal.core;

import android.app.Activity;

import com.futureplatforms.kirin.extensions.IKirinExtension;
import com.futureplatforms.kirin.state.IKirinDropbox;
import com.futureplatforms.kirin.state.IKirinFileSystem;

public interface IKirinState {
	void setActivity(Activity activity);
	Activity getActivity();

	IKirinDropbox getDropbox();
	
	void setActiveExtension(IKirinExtension extension);
	IKirinExtension getActiveExtension();
	IKirinFileSystem getPaths();
	
}

package com.futureplatforms.kirin.helpers;

import android.app.Activity;

import com.futureplatforms.kirin.IKirinDropbox;
import com.futureplatforms.kirin.extensions.IKirinExtension;

public interface IKirinState {
	void setActivity(Activity activity);
	Activity getActivity();

	IKirinDropbox getDropbox();
	
	void setActiveExtension(IKirinExtension extension);
	IKirinExtension getActiveExtension();
	
}

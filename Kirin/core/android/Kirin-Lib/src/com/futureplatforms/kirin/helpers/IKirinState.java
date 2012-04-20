package com.futureplatforms.kirin.helpers;

import com.futureplatforms.kirin.IKirinDropbox;

import android.app.Activity;

public interface IKirinState {
	void setActivity(Activity activity);
	Activity getActivity();

	IKirinDropbox getDropbox();
	
	
	
}

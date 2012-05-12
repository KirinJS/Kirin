package com.futureplatforms.kirin.helpers;

import android.app.Activity;

public interface IKirinExtensionHelper extends IKirinHelper {

	Activity getActivity();

	void onStart();

	void onStop();

	void setActive();

}
package com.futureplatforms.kirin.helpers;

import android.app.Activity;

import com.futureplatforms.kirin.internal.IJsContext;
import com.futureplatforms.kirin.internal.INativeContext;

public class KirinApplicationHelper extends KirinUiFragmentHelper {

	public KirinApplicationHelper(Object nativeObject, String moduleName,
			IJsContext jsContext, INativeContext nativeContext,
			IKirinState appState) {
		super(nativeObject, moduleName, jsContext, nativeContext, appState);
	}

	public Activity getActivity() {
		return getAppState().getActivity();
	}
	
}

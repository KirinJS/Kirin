package com.futureplatforms.kirin.helpers;

import android.app.Activity;
import android.content.Intent;

import com.futureplatforms.kirin.internal.IJsContext;
import com.futureplatforms.kirin.internal.INativeContext;

public class KirinScreenHelper extends KirinUiFragmentHelper {

	public KirinScreenHelper(Activity nativeObject, String moduleName,
			IJsContext jsContext, INativeContext nativeContext,
			IKirinState appState) {
		super(nativeObject, moduleName, jsContext, nativeContext, appState);
	}

	@Override
	public void onResume(Object... args) {
		getAppState().setActivity((Activity) getNativeObject());
		super.onResume(args);
	}
	
	@Override
	public void onPause() {
		if (getAppState().getActivity() == getNativeObject()) {
			getAppState().setActivity(null);
		}
		super.onPause();
	}
	
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		// TODO 
	}	
	
}

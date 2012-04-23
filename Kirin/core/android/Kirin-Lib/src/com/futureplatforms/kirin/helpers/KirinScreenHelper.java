package com.futureplatforms.kirin.helpers;

import android.app.Activity;
import android.content.Intent;

import com.futureplatforms.kirin.extensions.IKirinExtension;
import com.futureplatforms.kirin.internal.core.IJsContext;
import com.futureplatforms.kirin.internal.core.INativeContext;

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
		IKirinExtension extension = getAppState().getActiveExtension();
		if (extension != null) {
			extension.onActivityResult(requestCode, resultCode, data);
			// TODO what happens if there is a chain of extensions?
			getAppState().setActiveExtension(null);
		}
	}	
	
}

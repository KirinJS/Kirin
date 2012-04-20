package com.futureplatforms.kirin.helpers;

import android.app.Activity;

import com.futureplatforms.kirin.extensions.IKirinExtension;
import com.futureplatforms.kirin.internal.IJsContext;
import com.futureplatforms.kirin.internal.INativeContext;

public class KirinExtensionHelper extends KirinHelper {

	public KirinExtensionHelper(IKirinExtension nativeObject, String moduleName,
			IJsContext jsContext, INativeContext nativeContext,
			IKirinState appState) {
		super(nativeObject, moduleName, jsContext, nativeContext, appState);
	}

	public Activity getActivity() {
		return getAppState().getActivity();
	}
	
	public void onStart() {
		this.jsMethod("onStart");
	}
	
	public void onStop() {
		this.jsMethod("onStop");
	}
	
	public void setActive() {
		getAppState().setActiveExtension((IKirinExtension) getNativeObject());
	}

}

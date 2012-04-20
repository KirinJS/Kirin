package com.futureplatforms.kirin.helpers;

import com.futureplatforms.kirin.internal.IJsContext;
import com.futureplatforms.kirin.internal.INativeContext;

public class KirinUiFragmentHelper extends KirinHelper {

	public KirinUiFragmentHelper(Object nativeObject, String moduleName,
			IJsContext jsContext, INativeContext nativeContext,
			IKirinState appState) {
		super(nativeObject, moduleName, jsContext, nativeContext, appState);
	}
	
	public void onPause() {
		super.jsMethod("onPause");
	}
	
	public void onResume(Object... args) {
		super.jsMethod("onResume", (Object[]) args);
	}
	
}

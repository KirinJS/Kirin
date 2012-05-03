package com.futureplatforms.kirin.helpers;

import android.app.Activity;

import com.futureplatforms.kirin.extensions.IKirinExtension;
import com.futureplatforms.kirin.internal.core.IJsContext;
import com.futureplatforms.kirin.internal.core.IKirinState;
import com.futureplatforms.kirin.internal.core.INativeContext;

public class KirinExtensionHelper extends KirinHelper implements IKirinExtensionHelper {

	public KirinExtensionHelper(IKirinExtension nativeObject, String moduleName,
			IJsContext jsContext, INativeContext nativeContext,
			IKirinState appState) {
		super(nativeObject, moduleName, jsContext, nativeContext, appState);
	}

	/* (non-Javadoc)
	 * @see com.futureplatforms.kirin.helpers.IKirinExtensionHelper#getActivity()
	 */
	@Override
	public Activity getActivity() {
		return getAppState().getActivity();
	}
	
	/* (non-Javadoc)
	 * @see com.futureplatforms.kirin.helpers.IKirinExtensionHelper#onStart()
	 */
	@Override
	public void onStart() {
		this.jsMethod("onStart");
	}
	
	/* (non-Javadoc)
	 * @see com.futureplatforms.kirin.helpers.IKirinExtensionHelper#onStop()
	 */
	@Override
	public void onStop() {
		this.jsMethod("onStop");
	}
	
	/* (non-Javadoc)
	 * @see com.futureplatforms.kirin.helpers.IKirinExtensionHelper#setActive()
	 */
	@Override
	public void setActive() {
		getAppState().setActiveExtension((IKirinExtension) getNativeObject());
	}

}

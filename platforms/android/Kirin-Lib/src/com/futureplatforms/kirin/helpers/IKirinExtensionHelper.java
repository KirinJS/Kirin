package com.futureplatforms.kirin.helpers;

import android.app.Activity;

public interface IKirinExtensionHelper extends IKirinHelper {


	/**
	 * Lifecycle method. Should never be called by application code.
	 *  
	 * This will be called after all extensions have had their onLoad methods called.
	 */
	void onStart();

	/**
	 * Lifecycle method. Should never be called by application code.
	 * 	 
	 * This will be called on all extensions before any onLoad methods 
	 * are called.
	 */
	void onStop();
	
	/**
	 * The current screen activity, if any. This is useful to have if you 
	 * need to do anything like launch another activity.
	 * @return
	 */
	Activity getActivity();

	/**
	 * Call this if you are about to launch an activity.
	 * 
	 * It is not clear if you'll need your extension to implement 
	 * `IKirinExtensionOnUiThread`. It will be set inactive automatically.
	 */
	void setActive();

}
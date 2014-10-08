package com.futureplatforms.kirin.extensions;

import android.content.Context;
import android.content.Intent;

import com.futureplatforms.kirin.Kirin;
import com.futureplatforms.kirin.application.IKirinApplication;
import com.futureplatforms.kirin.helpers.IKirinExtensionHelper;

public class KirinExtensionAdapter implements IKirinExtension {

	private final String mModuleName;
	
	protected final IKirinExtensionHelper mKirinHelper;
	
	private final Context mContext;
	
	public KirinExtensionAdapter(Context context, String moduleName) {
		this(context, moduleName, null);
	}
	
	public KirinExtensionAdapter(Context context, String moduleName, IKirinExtensionHelper helper) {
		mModuleName = moduleName;
		mContext = context;
		if (helper == null) {
			helper = getKirin().bindExtension(mModuleName, this);
		}
		mKirinHelper = helper;
	}
	
	@Override
	public void onLoad() {
		mKirinHelper.onLoad();
	}

	@Override
	public void onStart() {
		mKirinHelper.onStart();
	}

	@Override
	public void onStop() {
		mKirinHelper.onStop();
	}

	@Override
	public void onUnload() {
		mKirinHelper.onStop();
	}

	public Context getContext() {
		return mContext;
	}
	
	/**
	 * This is to implement catching of results from activities launched by the extension.
	 * 
	 * Before launching the extension, you should ensure you call <code>mKirinHelper.setActive()</code>.
	 * 
	 * The default implementation does nothing, though this may not always be the case. Extenders of this method
	 * should always call <code>super.onActivityResult</code> somewhere in the implementation. 
	 */
	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		// NOP
	}

	/**
	 * Utility method to get an 
	 */
	protected <T> T bindExtensionModule(Class<T> javascriptModule) {
		return mKirinHelper.javascriptProxyForModule(javascriptModule);
	}
	
	
	protected Kirin getKirin() {
		return ((IKirinApplication) mContext.getApplicationContext()).getKirin();
	}
}

package com.futureplatforms.kirin;

import android.app.Activity;
import android.app.Application;
import android.content.Context;

import com.futureplatforms.kirin.extensions.IKirinExtension;
import com.futureplatforms.kirin.extensions.KirinExtensions;
import com.futureplatforms.kirin.helpers.IKirinHelper;
import com.futureplatforms.kirin.helpers.KirinApplicationHelper;
import com.futureplatforms.kirin.helpers.KirinExtensionHelper;
import com.futureplatforms.kirin.helpers.KirinHelper;
import com.futureplatforms.kirin.helpers.KirinScreenHelper;
import com.futureplatforms.kirin.helpers.KirinUiFragmentHelper;
import com.futureplatforms.kirin.internal.core.IJsContext;
import com.futureplatforms.kirin.internal.core.IKirinState;
import com.futureplatforms.kirin.internal.core.INativeContext;
import com.futureplatforms.kirin.internal.core.KirinAppState;
import com.futureplatforms.kirin.internal.core.KirinWebViewHolder;
import com.futureplatforms.kirin.internal.core.NativeContext;

public class Kirin {

	private final INativeContext mNativeContext;
	
	private final IJsContext mJsContext;
	
	private final IKirinState mKirinState;
	
	private final Context mContext;
	
	private KirinExtensions mKirinExtensions = null;
	

	public static Kirin create(Context context) {
		return new Kirin(context, null, null, null);
	}

	public Kirin(Context androidContext, INativeContext nativeContext, IJsContext jsContext, IKirinState state) {
		mContext = androidContext.getApplicationContext();
		if (nativeContext == null) {
			nativeContext = new NativeContext();
		}
		mNativeContext = nativeContext;
		
		if (jsContext == null) {
			jsContext = new KirinWebViewHolder(mContext, mNativeContext);
		}
		mJsContext = jsContext;
		
		if (state == null) {
			state = new KirinAppState(mContext);
		}
		mKirinState = state;
	}
	
	public IKirinHelper bindObject(String moduleName, Object nativeObject) {
		ensureStarted();
		return new KirinHelper(nativeObject, moduleName, mJsContext, mNativeContext, mKirinState);
	}
	
	public KirinUiFragmentHelper bindFragment(String moduleName, Object nativeObject) {
		ensureStarted();
		return new KirinUiFragmentHelper(nativeObject, moduleName, mJsContext, mNativeContext, mKirinState);
	}
	
	public KirinScreenHelper bindScreen(String moduleName, Activity activity) {
		ensureStarted();
		return new KirinScreenHelper(activity, moduleName, mJsContext, mNativeContext, mKirinState);
	}
	
	public KirinExtensionHelper bindExtension(String moduleName, IKirinExtension extension) {
		return new KirinExtensionHelper(extension, moduleName, mJsContext, mNativeContext, mKirinState);
	}
	
	public KirinApplicationHelper bindApplication(String moduleName, Application application) {
		ensureStarted();
		return new KirinApplicationHelper(application, moduleName, mJsContext, mNativeContext, mKirinState);
	}
	
	private void ensureStarted() {
		getKirinExtensions().ensureStarted();
	}
	
	public void setKirinExtensions(KirinExtensions kirinExtensions) {
		if (kirinExtensions != null && mKirinExtensions != null) {
			throw new IllegalStateException("Cannot change KirinServices contained once the first service has been added");
		}
		mKirinExtensions = kirinExtensions;
	}
	
	public KirinExtensions getKirinExtensions() {
		if (mKirinExtensions == null) {
			setKirinExtensions(KirinExtensions.coreExtensions(mContext));
		}
		return mKirinExtensions;
	}

	
}

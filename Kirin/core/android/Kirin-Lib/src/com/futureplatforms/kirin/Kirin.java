package com.futureplatforms.kirin;

import android.app.Activity;
import android.content.Context;

import com.futureplatforms.kirin.helpers.IKirinHelper;
import com.futureplatforms.kirin.helpers.IKirinState;
import com.futureplatforms.kirin.helpers.KirinHelper;
import com.futureplatforms.kirin.helpers.KirinScreenHelper;
import com.futureplatforms.kirin.helpers.KirinUiFragmentHelper;
import com.futureplatforms.kirin.internal.IJsContext;
import com.futureplatforms.kirin.internal.INativeContext;
import com.futureplatforms.kirin.internal.KirinAppState;
import com.futureplatforms.kirin.internal.KirinWebViewHolder;
import com.futureplatforms.kirin.internal.NativeContext;

public class Kirin {

	private final INativeContext mNativeContext;
	
	private final IJsContext mJsContext;
	
	private final IKirinState mKirinState;
	
	private final Context mContext;
	
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
			state = new KirinAppState();
		}
		mKirinState = state;
	}
	
	public IKirinHelper bindObject(String moduleName, Object nativeObject) {
		return new KirinHelper(nativeObject, moduleName, mJsContext, mNativeContext, mKirinState);
	}
	
	public KirinUiFragmentHelper bindFragment(String moduleName, Object nativeObject) {
		return new KirinUiFragmentHelper(nativeObject, moduleName, mJsContext, mNativeContext, mKirinState);
	}
	
	public KirinScreenHelper bindScreen(String moduleName, Activity activity) {
		return new KirinScreenHelper(activity, moduleName, mJsContext, mNativeContext, mKirinState);
	}
}

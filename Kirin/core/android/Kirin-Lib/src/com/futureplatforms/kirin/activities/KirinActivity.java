package com.futureplatforms.kirin.activities;

import android.app.Activity;
import android.content.Intent;

import com.futureplatforms.kirin.Kirin;
import com.futureplatforms.kirin.application.IKirinApplication;
import com.futureplatforms.kirin.helpers.KirinScreenHelper;


public abstract class KirinActivity extends Activity {

	protected KirinScreenHelper mKirinHelper;
	
	protected <T> T bindScreen(String moduleName, Class<T> javascriptModule) {
		bindScreen(moduleName);
		return mKirinHelper.createProxy(javascriptModule);
	}
	
	protected void bindScreen(String moduleName) {
		bindScreenWithoutLoading(moduleName);
		mKirinHelper.onLoad();
	}
	
	protected void bindScreenWithoutLoading(String moduleName) {
		mKirinHelper = getKirin().bindScreen(moduleName, this);
	}
	
	
	protected Kirin getKirin() {
		return ((IKirinApplication) this.getApplication()).getKirin();
	}
	
	@Override
	protected void onPause() {
		super.onPause();
		mKirinHelper.onPause();
	}
	
	@Override
	protected void onResume() {
		super.onResume();
		if (mKirinHelper == null) {
			throw new IllegalStateException("The activity has no javascript module bound to it. Did you call bindScreen()?");
		}
		mKirinHelper.onResume();
	}
	
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		mKirinHelper.onActivityResult(requestCode, resultCode, data);
	}
	
	@Override
	protected void onDestroy() {
		super.onDestroy();
		mKirinHelper.onUnload();
	} 
}

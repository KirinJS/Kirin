package com.futureplatforms.kirin.extensions;

import java.util.Collection;
import java.util.LinkedList;

import android.content.Context;
import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.extensions.databases.DatabasesBackend;
import com.futureplatforms.kirin.extensions.networking.NetworkingBackend;
import com.futureplatforms.kirin.extensions.settings.SettingsBackend;
import com.futureplatforms.kirin.extensions.settings.PreferencesBackendImpl;

public class KirinExtensions {

	private boolean mIsStarted = false;
	
	private Collection<IKirinExtension> mAllExtensions;
	
	public static KirinExtensions coreExtensions(Context context) {
		KirinExtensions extensions = emptyExtensions();
		Log.i(C.TAG, "Registering core extensions");
		// this one is stable.
		extensions.registerExtension(new SettingsBackend(context));
		// this one is in alpha.
		extensions.registerExtension(new PreferencesBackendImpl(context));
		extensions.registerExtension(new NetworkingBackend(context));
		extensions.registerExtension(new DatabasesBackend(context));
		
		
		return extensions;
	}

	private static KirinExtensions emptyExtensions() {
		return new KirinExtensions();
	}
	
	public KirinExtensions() {
		mAllExtensions = new LinkedList<IKirinExtension>();
	}
	
	public void registerExtension(IKirinExtension extension) {
		mAllExtensions.add(extension);
		extension.onLoad();
		if (mIsStarted) {
			extension.onStart();
		}
	}
	
	public void ensureStarted() {
		if (mIsStarted) {
			return;
		}
		// TODO consider using Locks to make sure that this is thread safe.
		mIsStarted = true;
		
		for (IKirinExtension extension : mAllExtensions) {
			extension.onStart();
		}
	}
	
	
	public void unloadExtensions() {
		if (!mIsStarted) {
			return;
		}
		
		for (IKirinExtension extension : mAllExtensions) {
			extension.onStop();
		}
		
		for (IKirinExtension extension : mAllExtensions) {
			extension.onUnload();
		}
		
		mIsStarted = false;
	}
	
	public boolean isStarted() {
		return mIsStarted;
	}
}

package com.futureplatforms.kirin.internal;

import java.text.MessageFormat;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import android.app.Activity;
import android.os.Handler;
import android.util.Log;
import android.view.View;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.helpers.IKirinServiceOnNonDefaultThread;
import com.futureplatforms.kirin.helpers.IKirinServiceOnUiThread;

public class NativeContext implements INativeContext {

	private final Map<String, IObjectHolder> mObjectHolders = new ConcurrentHashMap<String, IObjectHolder>();
	
	private final Executor mDefaultExecutorService;
	
	public NativeContext() {
		this(Executors.newCachedThreadPool());
	}
	
	public NativeContext(Executor defaultExecutor) {
		mDefaultExecutorService = defaultExecutor;
	}

	@Override
	public Collection<String> getMethodNamesForObject(String objectName) {
		return getObjectHolder(objectName).getMethodNames();
	}

	private IObjectHolder getObjectHolder(String objectName) {
		IObjectHolder holder = mObjectHolders.get(objectName);
		if (holder == null) {
			throw new IllegalStateException("No object for " + objectName + " has been registered. This is almost certainly a bug in Kirin.");
		}
		return holder;
	}

	private void logThread(Object object, String threadPoolName) {
		Log.d(C.TAG, MessageFormat.format("Will dispatch to KirinService {0} on a {1} thread(s)", object.getClass().getName(), threadPoolName));
	}
	
	@Override
	public void registerNativeObject(String moduleName, Object object) {
		IObjectHolder objectHolder = null;
		if (object instanceof View || object instanceof Activity || object instanceof IKirinServiceOnUiThread) {
			objectHolder = new UiObjectHolder(new Handler(), object);
			logThread(object, "UI");
		} else if (object instanceof IKirinServiceOnNonDefaultThread) {
			Executor executor = ((IKirinServiceOnNonDefaultThread) object).getExecutor();
			if (executor == null) {
				logThread(object, "default background");
				executor = mDefaultExecutorService;
			} else {
				logThread(object, "custom background");
			}
			objectHolder = new DefaultObjectHandler(executor, object);
		}
		mObjectHolders.put(moduleName, objectHolder);
	}

	@Override
	public void unregisterNativeObject(String moduleName) {
		mObjectHolders.remove(moduleName);
	}

	@Override
	public void executeCommandFromModule(String moduleName, String methodName, Object... args) {
		getObjectHolder(moduleName).invoke(methodName, (Object[]) args);
	}

}

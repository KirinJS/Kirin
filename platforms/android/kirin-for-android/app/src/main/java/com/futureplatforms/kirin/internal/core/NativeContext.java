package com.futureplatforms.kirin.internal.core;

import java.text.MessageFormat;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;

import android.app.Activity;
import android.os.Handler;
import android.util.Log;
import android.view.View;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.extensions.IKirinExtensionOnNonDefaultThread;
import com.futureplatforms.kirin.extensions.IKirinExtensionOnUiThread;
import com.futureplatforms.kirin.internal.attic.ProxyGenerator;

public class NativeContext implements INativeContext {

	public static final class SettableFuture<T> {
		
		private final CountDownLatch mLatch = new CountDownLatch(1);

		private T mValue;
		
		public T get() {
			try {
				mLatch.await();
			} catch (InterruptedException e) {
				Log.e(C.TAG, "Problem handling return value");
			}
			Log.d(C.TAG, "Getting value: " + mValue);
			return mValue;
		}
		
		public void set(T value) {
			mValue = value;
			Log.d(C.TAG, "Setting value: " + mValue);
			mLatch.countDown();
		}
	}

	private final Map<String, IObjectHolder> mObjectHolders = new ConcurrentHashMap<String, IObjectHolder>();
	
	private final Map<Long, SettableFuture<?>> mFutureMap = new ConcurrentHashMap<Long, SettableFuture<?>>();
	private final AtomicLong mNextId = new AtomicLong(0);
	
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
	public void registerNativeObject(String moduleName, Object object, ProxyGenerator proxyGenerator) {
		IObjectHolder objectHolder = null;
		if (object instanceof View || object instanceof Activity || object instanceof IKirinExtensionOnUiThread) {
			objectHolder = new UiObjectHolder(new Handler(), object, proxyGenerator);
			logThread(object, "UI");
		} else if (object instanceof IKirinExtensionOnNonDefaultThread) {
			Executor executor = ((IKirinExtensionOnNonDefaultThread) object).getExecutor();
			if (executor == null) {
				logThread(object, "default background");
				executor = mDefaultExecutorService;
			} else {
				logThread(object, "custom background");
			}
			objectHolder = new DefaultObjectHandler(executor, object, proxyGenerator);
		} else {
			logThread(object, "default background");
			objectHolder = new DefaultObjectHandler(mDefaultExecutorService, object, proxyGenerator);
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

	@Override
	public <T> SettableFuture<T> getFuture(Long id) {
		@SuppressWarnings("unchecked")
		SettableFuture<T> future = (SettableFuture<T>) mFutureMap.get(id);
		if (future == null) {
			future = new SettableFuture<T>();
			mFutureMap.put(id, future);
		}
		return future;
	}

	@Override
	public <T> void setReturnValue(Long id, T value) {
		@SuppressWarnings("unchecked")
		SettableFuture<Object> future = (SettableFuture<Object>) mFutureMap.remove(id);
		if (future != null) {
			future.set(value);
		}
	}

	@Override
	public Long createNewId() {
		return mNextId.incrementAndGet();
	}

}

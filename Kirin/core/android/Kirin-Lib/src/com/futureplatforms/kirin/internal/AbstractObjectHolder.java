package com.futureplatforms.kirin.internal;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.MessageFormat;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import android.text.TextUtils;
import android.util.Log;

import com.futureplatforms.kirin.C;

public abstract class AbstractObjectHolder implements IObjectHolder {


	private static final class JavaMethodCall implements Runnable {
		private final Method mMethod;
		private final Object[] mArgs;
		private final Object mNativeObject;

		private JavaMethodCall(Object object, Method method, Object[] args) {
			mMethod = method;
			mArgs = args;
			mNativeObject = object;
		}

		@Override
		public void run() {
			try {
				mMethod.invoke(mNativeObject, mArgs);
			} catch (InvocationTargetException ex) {
				Throwable e = ex.getTargetException();
				reportException(e);
			} catch (Exception e) {
				reportException(e);
			}
		}

		private void reportException(Throwable e) {
			String[] classes = new String[mArgs.length];
			for (int i = 0; i < mArgs.length; i++) {
				classes[i] = mArgs[i].getClass().getName();
			}

			Log.e(C.TAG, "Problem calling " + mNativeObject.getClass().getSimpleName() + "."
							+ mMethod.getName() + "(" + TextUtils.join(", ", mMethod.getParameterTypes()) + ");");
			
			Log.d(C.TAG, "\tJSON arg types  : " + Arrays.toString(classes));
			Log.d(C.TAG, "\tActual values   : " + Arrays.toString(mArgs));
			Log.e(C.TAG, "Stacktrace:", e);
		}
	}

	private boolean mIsInitialized;
	
	private Map<String, Method> mMethodMap;
	
	protected final Object mNativeObject;
	
	public AbstractObjectHolder(Object nativeObject) {
		mNativeObject = nativeObject;
	}
	
	@Override
	public Collection<String> getMethodNames() {
		ensureInitialized();
		return mMethodMap.keySet();
	}

	private void ensureInitialized() {
		// TODO does this need locks around it?
		if (!mIsInitialized) {
			calculateMethods();
			mIsInitialized = true;
		}
	}
	
	private void calculateMethods() {
		mMethodMap = new HashMap<String, Method>();
		Class<?> clazz = mNativeObject.getClass();
        for (Method method : clazz.getMethods()) {
            String className = method.getDeclaringClass().getName();
            if (!className.startsWith("android.") && !className.startsWith("java")) {
                String name = method.getName();
                if (mMethodMap.containsKey(name)) {
                	Log.w(C.TAG, "More than one " + name + " name declared on " + clazz + ". Behaviour is undefined.");
                }
				mMethodMap.put(name, method);
            }
        }
	}

	protected abstract void enqueue(Runnable methodCall);

	@Override
	public void invoke(final String methodName, final Object... args) {
		ensureInitialized();
		
		final Method method = mMethodMap.get(methodName);
        if (method == null) {
            Log.e(C.TAG, MessageFormat.format("Can''t invoke {0} on {1}", methodName, mNativeObject));
            return;
        }
	    
		enqueue(new JavaMethodCall(mNativeObject, method, args));
	}



}

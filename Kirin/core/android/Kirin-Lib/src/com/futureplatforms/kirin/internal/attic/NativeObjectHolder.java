/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


package com.futureplatforms.kirin.internal.attic;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.MessageFormat;
import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import android.content.Context;
import android.util.Log;

import com.futureplatforms.kirin.C;

public abstract class NativeObjectHolder {

    private Object mCurrent;
    private Class<?> mClass;
    private boolean mInitialized;
    protected final Map<String, Method> mMethodMap;
    protected final Context mContext;

    public NativeObjectHolder(Context context) {
        this(context, new ConcurrentHashMap<String, Method>());
    }
    
    public NativeObjectHolder(Context context, Map<String, Method> methodMap) {
        mContext = context;
        mMethodMap = methodMap;
        
    }

    public Object doInvoke(final String methodName, final Object... args) {
        if (!mInitialized) {
            initReflection();
        }
        
    
    
        final Method method = mMethodMap.get(methodName);
        if (method == null) {
            Log.e(C.TAG, MessageFormat.format("Can''t invoke {0} on {1}", methodName, mCurrent));
            return null;
        }
    
        enqueue(new Runnable() {
    
            @Override
            public void run() {
                try {
                    method.invoke(mCurrent, args);
                    return;
                } catch (InvocationTargetException ex) {
                    Throwable e = ex.getTargetException();
                    Log.e(C.TAG, MessageFormat.format("Problem invoking {0} on {1}", methodName, mCurrent), e);
                } catch (Exception e) {
                    Log.e(C.TAG, MessageFormat.format("Problem invoking {0} on {1}", methodName, mCurrent), e);
                }
    
    
                String[] classes = new String[args.length];
                for (int i = 0; i < args.length; i++) {
                    classes[i] = args[i].getClass().getName();
                }
                
                Log.e(C.TAG, "Method signature mismatch for " +mClass.getSimpleName() + "." + method.getName() + ":");
                Log.d(C.TAG, "\tJava arg types  : " + Arrays.toString(method.getParameterTypes()));
                Log.d(C.TAG, "\tJSON arg types  : " + Arrays.toString(classes));
                Log.d(C.TAG, "\tActual values   : " + Arrays.toString(args));
    
            }
    
        });
    
        return null;
    }

    protected abstract void enqueue(Runnable runnable);

    private void initReflection() {
        mMethodMap.clear();
    
        if (mClass == null) {
            mClass = mCurrent.getClass();
        }
        
        for (Method method : mClass.getMethods()) {

            String className = method.getDeclaringClass().getName();
            if (!className.startsWith("android.") && !className.startsWith("java")) {
                mMethodMap.put(method.getName(), method);
            }

        }
        mInitialized = true;
    }

    public Object getCurrent() {
        if (mCurrent == null && mClass != null) {
            mCurrent = instantiate(mClass);
        }
        return mCurrent;
    }

    private Object instantiate(Class<?> clazz) {
        
        try {
            return clazz.getConstructor(Context.class).newInstance(mContext);
        } catch (Exception e) {
            // not yet.
        }
        
        try {
            return clazz.newInstance();
        } catch (Exception e) {
            Log.e(C.TAG, MessageFormat.format("Couldn't instantiate {0} with either Context or noarg constructors", clazz.getName()), e);
            
        }
        return null;
    }

    public Collection<String> getMethodNames() {
        if (!mInitialized) {
            initReflection();
        }
        return mMethodMap.keySet();
    }

    public void setCurrent(Object current) {
        mCurrent = current;
        mClass = null;
        mInitialized = false;
    }

    public void setClass(Class<?> clazz) {
        if (mClass == null || !mClass.equals(clazz)) {
            mClass = clazz;
            mCurrent = null;
        }
    }

}
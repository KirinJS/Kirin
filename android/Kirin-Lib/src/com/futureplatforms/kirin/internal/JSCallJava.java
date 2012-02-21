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


package com.futureplatforms.kirin.internal;

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;

import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.os.Handler;
import android.util.Log;

import com.futureplatforms.kirin.C;

public class JSCallJava {

    private final Map<String, NativeObjectHolder> mClassInvokers;

    private final Context mContext;

    private final Handler mDefaultHandler;

    public JSCallJava(Context context, Handler handler) {
        this(context, handler, new HashMap<String, NativeObjectHolder>());
    }

    public JSCallJava(Context context, Handler handler, Map<String, NativeObjectHolder> map) {
        mClassInvokers = map;
        mContext = context;
        mDefaultHandler = handler;
    }

    public void call(String classMethod, String jsonArgs) {
        String[] split = classMethod.split("\\.", 2);
        assert split.length == 2;

        String className = split[0];
        String method = split[1];

        NativeObjectHolder holder = mClassInvokers.get(className);
        if (holder == null) {
            holder = findInstance(className);

            if (holder == null) {
                return;
            }
            mClassInvokers.put(className, holder);
        }

        Object[] args = null;
        try {
            JSONArray array = new JSONArray(jsonArgs);
            args = new Object[array.length()];
            for (int i = 0, max = array.length(); i < max; i++) {
                args[i] = array.get(i);
            }
        } catch (JSONException e) {
            Log.e(C.JS_TAG, MessageFormat.format("Problem calling {0}.{1}", method, jsonArgs));
            return;
        }
        holder.doInvoke(method, args);

    }

    public NativeObjectHolder setObject(Object object, String name) {
        NativeObjectHolder holder = mClassInvokers.get(name);
        if (holder == null) {
            holder = new ActivityHolder(mContext, mDefaultHandler);
            holder.setCurrent(object);
            mClassInvokers.put(name, holder);
        } else if (!holder.getCurrent().equals(object)) {
            holder.setCurrent(object);
        }
        return holder;
    }

    public NativeObjectHolder setObject(Object object, String name, ExecutorService executorService) {
        NativeObjectHolder holder = mClassInvokers.get(name);
        if (holder == null) {
            holder = new ServiceBackendHolder(mContext, executorService);
            holder.setCurrent(object);
            mClassInvokers.put(name, holder);
        } else {
            holder.setCurrent(object);
        }
        return holder;
    }

    public Object getService(String proxyName) {
        NativeObjectHolder holder = mClassInvokers.get(proxyName);
        if (holder != null) {
            return holder.getCurrent();
        }
        return null;
    }

    private NativeObjectHolder findInstance(String jsClassName) {
        String packageName = mContext.getPackageName() + ".plugins.";

        String javaClassName = packageName + jsClassName;

        try {
            Class<?> javaClass = Class.forName(javaClassName, false, getClass().getClassLoader());
            NativeObjectHolder holder = new ActivityHolder(mContext, mDefaultHandler);
            holder.setClass(javaClass);
            return holder;
        } catch (Exception e) {
            Log.e(C.TAG, "Unable to find a class for " + javaClassName, e);
            return null;
        }
    }

}

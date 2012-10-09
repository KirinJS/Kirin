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

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.helpers.IKirinHelper;

public class ProxyGenerator {

	private final IKirinHelper mKirinHelper;

	public ProxyGenerator(IKirinHelper helper) {
		mKirinHelper = helper;
	}

	public <T> T javascriptProxyForModule(Class<T> baseInterface,
			Class<?>... otherClasses) {
		Class<?>[] allClasses;

		if (otherClasses.length == 0) {
			allClasses = new Class[] { baseInterface };
		} else {
			allClasses = new Class[otherClasses.length + 1];
			allClasses[0] = baseInterface;
			System.arraycopy(otherClasses, 0, allClasses, 1,
					otherClasses.length);
		}
		InvocationHandler h = new InvocationHandler() {
			@Override
			public Object invoke(Object proxy, Method method, Object[] args)
					throws Throwable {
				mKirinHelper.jsMethod(method.getName(), (Object[]) args);
				return null;
			}
		};

		Object proxy = Proxy.newProxyInstance(baseInterface.getClassLoader(),
				allClasses, h);
		return baseInterface.cast(proxy);
	}

	public <T> T javascriptProxyForRequest(final JSONObject obj,
			Class<T> baseInterface, Class<?>... otherClasses) {
		Class<?>[] allClasses;

		if (otherClasses.length == 0) {
			allClasses = new Class[] { baseInterface };
		} else {
			allClasses = new Class[otherClasses.length + 1];
			allClasses[0] = baseInterface;
			System.arraycopy(otherClasses, 0, allClasses, 1,
					otherClasses.length);
		}
		InvocationHandler h = new InvocationHandler() {
			@Override
			public Object invoke(Object proxy, Method method, Object[] args)
					throws Throwable {
				String methodName = method.getName();
				Class<?> returnType = method.getReturnType();
				
				if (void.class.equals(returnType) && obj.has(methodName)) {
					String id = obj.optString("__id");
					
					if (id != null) {
						// so assume it's a callback
						mKirinHelper.jsCallbackObjectMethod(id, methodName, args);
					} 
					return null;
				}
				
    			String propertyName = findGetter(methodName);
    			if (propertyName != null) {
    				return handleGetter(obj, returnType, propertyName);
    			}
    			
    			if ("toString".equals(methodName) && String.class.equals(returnType)) {
    				return obj.toString();
    			}

				return null;
			}
		};

		Object proxy = Proxy.newProxyInstance(baseInterface.getClassLoader(),
				allClasses, h);
		return baseInterface.cast(proxy);
	}

	public <T> T javascriptProxyForResponse(final JSONObject obj, Class<T> baseInterface, Class<?>... otherClasses) {
    	Class<?>[] allClasses;
    	
    	if (otherClasses.length == 0) {
    		allClasses = new Class[] {baseInterface};
    	} else {
    		allClasses = new Class[otherClasses.length + 1];
    		allClasses[0] = baseInterface;
    		System.arraycopy(otherClasses, 0, allClasses, 1, otherClasses.length);
    	}
    	InvocationHandler h = new InvocationHandler() {
    		
    		@Override
    		public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    			String methodName = method.getName();
    			Class<?> returnType = method.getReturnType();
    			if (void.class.equals(returnType) && args.length == 1) {
    				String propertyName = findSetter(methodName);
    				if (propertyName != null) {
    					handleSetter(obj, propertyName, args[0]);
    				}
    			}
    			
    			String propertyName = findGetter(methodName);
    			if (propertyName != null) {
    				return handleGetter(obj, returnType, propertyName);
    			}
    			
    			if ("toString".equals(methodName) && String.class.equals(returnType)) {
    				return obj.toString();
    			}
    			
    			return null;
    		}

    	};
    	Object proxy = Proxy.newProxyInstance(baseInterface.getClassLoader(), allClasses, h);
    	return baseInterface.cast(proxy);
    }

	
	// utility methods
	
	protected void handleSetter(JSONObject obj, String key,
			Object value) {
		if (value == null) {
			obj.remove(key);
		} else {
			try {
				obj.putOpt(key, value);
			} catch (JSONException e) {
				Log.e(C.TAG, "Problem putting " + value + " into a JSONObject with key " + key, e);
			}
		}
	}


	private Object handleGetter(final JSONObject obj, Class<?> returnType,
			String propertyName) throws Exception {
		Object retValue = obj.opt(propertyName);

		if (retValue instanceof JSONObject) {
			if (returnType.isInterface()) {
				return javascriptProxyForResponse((JSONObject) retValue,
						returnType);
			} else if (!JSONObject.class.equals(returnType)) {
				throw new Exception("Trying to cast a JSONObject to a "
						+ returnType.getName());
			}
		}
		return retValue;
	}

	private String findSetter(String methodName) {
		// we're handling a non-void return, ie. a getter
		String propertyName = null;
		int start = -1;
		if (methodName.startsWith("set")) {
			start = 3;
		}

		if (start >= 0) {
			propertyName = makePropertyName(methodName, start);
		}
		return propertyName;
	}

	private String findGetter(String methodName) {
		// we're handling a non-void return, ie. a getter
		String propertyName = null;
		int start = -1;
		if (methodName.startsWith("get")) {
			start = 3;
		} else if (methodName.startsWith("is")) {
			start = 2;
		}

		if (start >= 0) {
			propertyName = makePropertyName(methodName, start);
		}
		return propertyName;
	}

	private String makePropertyName(String methodName, int start) {
		return methodName.substring(start, start + 1).toLowerCase()
				+ methodName.substring(start + 1);
	}
}

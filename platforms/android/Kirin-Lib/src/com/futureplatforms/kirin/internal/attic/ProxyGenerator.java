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

import org.json.JSONObject;

import com.futureplatforms.kirin.helpers.IKirinHelper;

public class ProxyGenerator {

	private final IKirinHelper mKirinHelper;
	
	public ProxyGenerator(IKirinHelper helper) {
		mKirinHelper = helper;
	}
	
    public <T> T javascriptProxyForModule(Class<T> baseInterface, Class<?>... otherClasses) {
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
            	mKirinHelper.jsMethod(method.getName(), (Object[]) args);
                return null;
            }
        };
        
        Object proxy = Proxy.newProxyInstance(baseInterface.getClassLoader(), allClasses, h);
        return baseInterface.cast(proxy);
    }
    
    public <T> T javascriptProxyForRequest(final JSONObject obj, Class<T> baseInterface, Class<?>... otherClasses) {
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
				if (void.class.equals(returnType)) {
    				// so assume it's a callback
    				mKirinHelper.jsCallback(obj, methodName, args);
    				return null;
    			}
    			// we're handling a non-void return, ie. a getter
     			int start = -1;
    			if (methodName.startsWith("get")) {
    				start = 3;
    			} else if (methodName.startsWith("is")) {
    				start = 2;
    			}
    			
    			if (start >= 0) {
    				String propertyName = methodName.substring(start, start + 1).toLowerCase() + methodName.substring(start + 1);
    				Object retValue = obj.opt(propertyName);
    				
    				if (retValue instanceof JSONObject) {
    					if (returnType.isInterface()) {
    						return javascriptProxyForRequest((JSONObject) retValue, returnType); 
    					} else if (!JSONObject.class.equals(returnType)){
    						throw new Exception("Trying to cast a JSONObject to a " + returnType.getName());
    					}
    				}
    				return retValue;
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
}

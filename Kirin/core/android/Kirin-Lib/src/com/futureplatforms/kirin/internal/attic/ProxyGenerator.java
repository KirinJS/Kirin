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

import com.futureplatforms.kirin.helpers.IKirinHelper;

public class ProxyGenerator {

    public <T> T generate(final IKirinHelper kirinHelper, Class<T> baseInterface, Class<?>... otherClasses) {
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
            	kirinHelper.jsMethod(method.getName(), (Object[]) args);
                return null;
            }
        };
        
        Object proxy = Proxy.newProxyInstance(baseInterface.getClassLoader(), allClasses, h);
        return baseInterface.cast(proxy);
    }
}

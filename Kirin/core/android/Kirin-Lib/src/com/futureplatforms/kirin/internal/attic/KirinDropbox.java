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

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

import com.futureplatforms.kirin.IKirinDropbox;

public class KirinDropbox implements IKirinDropbox {

    private ConcurrentMap<String, Object> mMap = new ConcurrentHashMap<String, Object>();

    private AtomicInteger mCounter = new AtomicInteger(0);
    
    @Override
    public Object consume(String key) {
        return mMap.remove(key);
    }

    @Override
    public Object get(String key) {
        return mMap.get(key);
    }

    @Override
    public String put(String prefix, Object obj) {
        String key = prefix + mCounter.incrementAndGet();
        mMap.put(key, obj);
        return key;
    }

    @Override
    public void remove(String key) {
        mMap.remove(key);
    }

}

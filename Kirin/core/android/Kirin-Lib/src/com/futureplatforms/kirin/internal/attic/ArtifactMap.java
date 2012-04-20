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

import java.util.HashMap;
import java.util.Map;

import com.futureplatforms.kirin.attic.IArtifacts;

public class ArtifactMap implements IArtifacts {

    private final Map<Class<?>, Object> mMap = new HashMap<Class<?>, Object>();
    
    @Override
    public <K, V extends K> void put(Class<K> clazz, V value) {
        mMap.put(clazz, value);
    }

    @Override
    public <K> K get(Class<K> clazz) {
        Object obj = mMap.get(clazz);
        if (obj != null && clazz.isInstance(obj)) {
            return clazz.cast(obj);
        }
        return null;
    }
    
    @Override
    public boolean containsKey(Class<?> clazz) {
        return mMap.containsKey(clazz);
    }
    
    @Override
    public void clear() {
        mMap.clear();
    }
}

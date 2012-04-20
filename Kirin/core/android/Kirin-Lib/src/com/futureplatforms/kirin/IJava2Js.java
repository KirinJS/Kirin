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


package com.futureplatforms.kirin;


public interface IJava2Js {
    void callCallback(String callback, Object... args);
    void deleteCallback(String... callbacks);
    
    void callJS(String pattern, Object... args);
    
    IKirinDropbox getDropbox();
    
    String getPathToJavascriptDir();
    
    Object getService(String proxyName);
}

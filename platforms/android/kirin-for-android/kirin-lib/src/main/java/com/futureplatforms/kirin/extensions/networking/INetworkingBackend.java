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


package com.futureplatforms.kirin.extensions.networking;

import org.json.JSONObject;

import com.futureplatforms.kirin.extensions.IKirinExtension;

public interface INetworkingBackend extends IKirinExtension {
    void downloadJSONList_(JSONObject config);

    void downloadJSON_(JSONObject config);

    void downloadFile_(JSONObject config);

    void deleteDownloadedFile_(JSONObject config);
}

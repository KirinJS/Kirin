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


package com.futureplatforms.kirin.test;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.MessageFormat;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.test.AndroidTestCase;

import com.futureplatforms.kirin.extensions.networking.NetworkingBackend;
import com.futureplatforms.kirin.test.dummies.DummyJavascript;

public class NetworkingBackendTest extends AndroidTestCase {

    private static final String RANDOM_JSON_URL = "http://api.twitter.com/1/statuses/public_timeline.json";

    private NetworkingBackend mBackend;
    
    private String mJSONString;
    
    private DummyJavascript mJS = new DummyJavascript();
    
    @Override
    protected void setUp() throws Exception {
        mJSONString = "['foo', 'bar', 'baz']";
        String packageName = mContext.getPackageName();
        mBackend = new NetworkingBackend(getContext(), mJS, MessageFormat.format("Android/data/{0}/files", packageName)) {
            @Override
            protected String downloadString(JSONObject config) throws IOException {
                String urlString = config.optString("url"); 
                try {
                    new URL(urlString);
                } catch (MalformedURLException e) {
                    throw new IOException("URL is not a real URL: " + urlString);
                }
                
                if (mJSONString == null || mJSONString.contains("EXCEPTION")) {
                    throw new IOException();
                }
                return mJSONString;
            }
        };

    }
    
    protected void tearDown() throws Exception {
        mJS.clear();
    }

    
    public void testDownloadJSON_HappyCase() throws JSONException {
        JSONObject downloadJSONConfig = new JSONObject();
        downloadJSONConfig.put("url", RANDOM_JSON_URL);
        downloadJSONConfig.put("method", "GET");
        
        downloadJSONConfig.put("payload", "payload.0");
        downloadJSONConfig.put("onError", "error.0");
        

        mBackend.downloadJSON_(downloadJSONConfig);
        
        mJS.verifyCallback("payload.0", mJSONString);
        
        mJS.verifyCalledCallbacks("payload.0");
        mJS.verifyDeletedCallbacks("payload.0", "error.0");
    }
    
    public void testDownloadJSON_ErrorCase() throws JSONException {
        mJSONString = "EXCEPTION";
        
        JSONObject downloadJSONConfig = new JSONObject();
        downloadJSONConfig.put("url", RANDOM_JSON_URL);
        downloadJSONConfig.put("method", "GET");
        
        downloadJSONConfig.put("payload", "payload.0");
        downloadJSONConfig.put("onError", "error.0");

        mBackend.downloadJSON_(downloadJSONConfig);
        
        mJS.verifyCalledCallbacks("error.0");
        mJS.verifyDeletedCallbacks("payload.0", "error.0");
    }
    
    public void testIsolateArrayFromObject() throws JSONException {
        JSONObject obj = new JSONObject("{foo: { bar: [1,2,3]}}");
        JSONArray path = new JSONArray("['foo', 'bar']");
        
        JSONArray list = mBackend.isolateArrayFromObject(obj, path);
        assertEquals(new JSONArray("[1,2,3]").toString(), list.toString());
        assertEquals(new JSONObject("{foo:{}}").toString(), obj.toString());
        
        obj = new JSONObject("{foo: {bar: [1,2,3]}}");
        path = new JSONArray("['foo', 'baz']");
        list = mBackend.isolateArrayFromObject(obj, path);
        
        assertNull(list);
        assertEquals(new JSONObject("{foo: {bar: [1,2,3]}}").toString(), obj.toString());
        
    }
    
    public void testDownloadList_HappyCase() throws JSONException {
        JSONObject config = new JSONObject();
        config.put("url", RANDOM_JSON_URL);
        config.put("envelope", "envelope.1");
        config.put("each", "each.1");
        config.put("onError", "onError.1");
        config.put("onFinish", "onFinish.1");
        config.put("path", new JSONArray("['foo', 'bar']"));
        
        mJSONString = "{foo: {bar: [4,5,6]}}";
        
        mBackend.downloadJSONList_(config);
        
        mJS.verifyCalledCallbacks("envelope.1", "each.1", "each.1", "each.1", "onFinish.1");
        mJS.verifyDeletedCallbacks("envelope.1", "each.1", "onError.1", "onFinish.1");
        
        mJS.verifyCallback("envelope.1", new JSONObject("{foo:{}}"));
        mJS.verifyCallback("each.1", 6); // the very last element.
        mJS.verifyCallback("onFinish.1", 3); // the number of elements.
        
        mJS.clear();
        
        mJSONString = "[7,11,13,17]";
        mBackend.downloadJSONList_(config);
        mJS.verifyCalledCallbacks("each.1", "each.1", "each.1", "each.1", "onFinish.1");
        mJS.verifyDeletedCallbacks("envelope.1", "each.1", "onError.1", "onFinish.1");
        
        mJS.verifyCallback("each.1", 17); // the very last element.
        mJS.verifyCallback("onFinish.1", 4); // the number of elements.
        
        mJS.clear();
        mJSONString = "{foo:1}";
        mBackend.downloadJSONList_(config);
        mJS.verifyCalledCallbacks("envelope.1", "onFinish.1");
        mJS.verifyDeletedCallbacks("envelope.1", "each.1", "onError.1", "onFinish.1");
        
        mJS.verifyCallback("envelope.1", new JSONObject("{foo:1}"));
        mJS.verifyCallback("onFinish.1", 0); // the number of elements.
    }
    
    public void testDownloadList_ErrorCase() throws JSONException {
        JSONObject config = new JSONObject();
        config.put("url", RANDOM_JSON_URL);
        config.put("envelope", "envelope.1");
        config.put("each", "each.1");
        config.put("onError", "onError.1");
        config.put("onFinish", "onFinish.1");
        config.put("path", new JSONArray("['foo', 'bar']"));
        
        mJSONString = "<html>not valid json</html>";
        mBackend.downloadJSONList_(config);
        mJS.verifyCalledCallbacks("onError.1");
        
        mJS.clear();
        
        mJSONString = "Fake IO EXCEPTION";
        mBackend.downloadJSONList_(config);
        mJS.verifyCalledCallbacks("onError.1");
        

    }
}

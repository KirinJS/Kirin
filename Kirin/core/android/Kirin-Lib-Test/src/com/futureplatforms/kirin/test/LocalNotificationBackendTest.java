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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Intent;
import android.content.SharedPreferences;
import android.test.AndroidTestCase;

import com.futureplatforms.kirin.services.LocalNotificationsBackend;

public class LocalNotificationBackendTest extends AndroidTestCase {

    private LocalNotificationsBackend mBackend;

    private SharedPreferences mPrefs;

    protected void setUp() throws Exception {
        super.setUp();

        mPrefs = LocalNotificationsBackend.createNotificationStore(getContext());
        mPrefs.edit().clear().commit();
        mBackend = new LocalNotificationsBackend(getContext(), mPrefs);
    }

    public JSONObject obj(String s) throws JSONException {
        return new JSONObject(s);
    }

    public JSONArray arr(String s) throws JSONException {
        return new JSONArray(s);
    }

    public void testScheduleOne() throws Exception {
        JSONArray origList = arr("[{id:123, timeMillisSince1970:"+Long.toString(System.currentTimeMillis() + 2000) + "}]");
        mBackend.scheduleNotifications_(origList);
        
        assertTrue(mPrefs.contains("localNotification.123"));
        
        assertEquals(origList.opt(0).toString(), mBackend.getJSONNotificationObject(123).toString());

        
    }
    
    public void testCreatePendingIntent() throws Exception {
        Intent intent = mBackend.createIntentForSchedule("1234");
        assertNotNull(intent);
        
        assertEquals("kirin://com.futureplatforms/localNotifications/1234", intent.getDataString());



    }

}

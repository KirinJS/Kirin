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


package com.futureplatforms.kirin.platformservices;

import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.content.UriMatcher;
import android.content.pm.ApplicationInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.api.ILocalNotificationsBackend;
import com.futureplatforms.kirin.external.LocalNotificationAlarmReceiver;

public class LocalNotificationsBackend implements ILocalNotificationsBackend {

    private static final String PREFS_PREFIX = "localNotification.";
    private static final UriMatcher URI_MATCHER;
    private static final Uri BASE_URI = Uri.parse(C.URI_SCHEME + "://" + C.URI_HOST);
    private static final Uri BASE_URI_NOTIFICATION = Uri.withAppendedPath(BASE_URI, C.URI_PATH_LOCALNOTIFICATION);
    static {
        UriMatcher m = new UriMatcher(-1);

        m.addURI(C.URI_HOST, C.URI_PATH_LOCALNOTIFICATION + "/*", C.REQUEST_CODE_LOCALNOTIFICATION);

        URI_MATCHER = m;
    }

    private final Context mContext;
    private final SharedPreferences mPrefs;

    private static int NOTIFICATION_MASK = 0xDEAD0000;

    public static SharedPreferences createNotificationStore(Context context) {
        return PreferenceManager.getDefaultSharedPreferences(context.getApplicationContext());
    }

    public static LocalNotificationsBackend create(Context context) {
        return new LocalNotificationsBackend(context, createNotificationStore(context));
    }

    public LocalNotificationsBackend(Context context, SharedPreferences prefs) {
        mContext = context;
        mPrefs = prefs;
    }

    @Override
    public void onAdditionToWebView() {
        // check we're on external storage. 
        // if we are, we probably want to reschedule these alarms.
        int flags = mContext.getApplicationInfo().flags;
        if (Build.VERSION.SDK_INT >= 8 && (flags & ApplicationInfo.FLAG_EXTERNAL_STORAGE) > 0) {
            Log.i(C.TAG, "Rescheduling alarms, since we're on the SD Card");
            rescheduleAllNotifications();
        }
    }

    @Override
    public void scheduleNotifications_(JSONArray notifications) {
        AlarmManager am = (AlarmManager) mContext.getSystemService(Service.ALARM_SERVICE);

        Editor prefs = mPrefs.edit();
        for (int i = 0, max = notifications.length(); i < max; i++) {
            JSONObject obj = notifications.optJSONObject(i);
            if (scheduleSingleNotification(am, obj)) {
                prefs.putString(PREFS_PREFIX + obj.optInt("id"), obj.toString());
            }
        }
        prefs.commit();

    }

    protected boolean scheduleSingleNotification(AlarmManager am, JSONObject obj) {
        PendingIntent pendingIntent = createPendingIntentForSchedule(obj.optString("id"));
        long time = obj.optLong("timeMillisSince1970", -1);
        if (time < 0) {
            return false;
        }
        am.set(AlarmManager.RTC_WAKEUP, time, pendingIntent);
        return true;
    }

    public void rescheduleAllNotifications() {
        long now = System.currentTimeMillis();
        Map<String, ?> map = mPrefs.getAll();
        int count = 0;
        AlarmManager am = (AlarmManager) mContext.getSystemService(Service.ALARM_SERVICE);
        for (Map.Entry<String, ?> entry : map.entrySet()) {
            if (entry.getKey().startsWith(PREFS_PREFIX)) {
                JSONObject obj = null;
                String json = entry.getValue().toString();
                try {
                    obj = new JSONObject(json);
                } catch (JSONException e) {
                    Log.e(C.TAG, "Error rescheduling notification: " + json);
                    continue;
                }

                long scheduledTime = obj.optLong("timeMillisSince1970", -1);
                long epsilon = obj.optLong("epsilon", -1);
                if (epsilon >= 0 && scheduledTime >= -1) {
                    if (now - epsilon > scheduledTime) {
                        // e.g. epsilon is two hours
                        // if the scheduled event happened three hours ago, the
                        // don't bother
                        // notifying.
                        continue;
                    }
                }
                count++;
                scheduleSingleNotification(am, obj);
            }
        }
        Log.i(C.TAG, "Rescheduled " + count + " alarms for notifications");
    }

    public PendingIntent createPendingIntentForSchedule(String idString) {
        Intent intent = createIntentForSchedule(idString);
        return PendingIntent.getBroadcast(mContext, C.REQUEST_CODE_LOCALNOTIFICATION, intent,
                PendingIntent.FLAG_ONE_SHOT);
    }

    public Intent createIntentForSchedule(String idString) {
        Intent intent = new Intent(mContext, LocalNotificationAlarmReceiver.class);

        // Determine if two intents are the same for the purposes of
        // intent resolution (filtering).
        // That is, if their action, data, type, class, and categories are the
        // same.
        // This does not compare any extra data included in the intents.
        intent.setData(Uri.withAppendedPath(BASE_URI_NOTIFICATION, idString));

        intent.setAction(C.ACTION_LOCAL_NOTIFICATION);
        return intent;
    }

    public Notification createNotification(Bundle settings, JSONObject obj) {

        // notifications[i] = api.normalizeAPI({
        // 'string': {
        // mandatory: ['title', 'body'],
        // defaults: {'icon':'icon'}
        // },
        //
        // 'number': {
        // mandatory: ['id', 'timeMillisSince1970'],
        // // the number of ms after which we start prioritising more recent
        // things above you.
        // defaults: {'epsilon': 1000 * 60 * 24 * 365}
        // },
        //
        // 'boolean': {
        // defaults: {
        // 'vibrate': false,
        // 'sound': false
        // }
        // }

        int icon = settings.getInt("notification_icon", -1);
        if (icon == -1) {
            Log.e(C.TAG, "Need a notification_icon resource in the meta-data of LocalNotificationsAlarmReceiver");
            return null;
        }

        Notification n = new Notification();
        n.icon = icon;
        n.flags = Notification.FLAG_ONLY_ALERT_ONCE | Notification.FLAG_AUTO_CANCEL;
        long alarmTime = obj.optLong("timeMillisSince1970");
        long displayTime = obj.optLong("displayTimestamp", alarmTime);
        n.when = displayTime;
        n.tickerText = obj.optString("body");
        n.setLatestEventInfo(mContext, obj.optString("title"), obj.optString("body"), null);

        if (obj.optBoolean("vibrate")) {
            n.defaults |= Notification.DEFAULT_VIBRATE;
        }
        if (obj.optBoolean("sound")) {
            n.defaults |= Notification.DEFAULT_SOUND;
        }

        String uriString = settings.getString("content_uri_prefix");
        if (uriString == null) {
            Log.e(C.TAG, "Need a content_uri_prefix in the meta-data of LocalNotificationsAlarmReceiver");
            return null;
        }

        if (uriString.contains("%d")) {
            uriString = String.format(uriString, obj.optInt("id"));
        }
        Uri uri = Uri.parse(uriString);


        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_VIEW);
        intent.addCategory(Intent.CATEGORY_DEFAULT);
        intent.setData(uri);
        n.contentIntent = PendingIntent.getActivity(mContext, 23, intent, PendingIntent.FLAG_ONE_SHOT);
        return n;
    }

    public void showNotification(Bundle settings, Intent intent) {
        Uri uri = intent.getData();
        int uriCode = URI_MATCHER.match(uri);

        if (uriCode != C.REQUEST_CODE_LOCALNOTIFICATION) {
            Log.w(C.TAG, "Notification with invalid uri: " + uri);
            return;
        }

        String idString = uri.getLastPathSegment();
        if (idString == null) {
            Log.w(C.TAG, "Just got a notification with no data");
            return;
        }

        Log.i(C.TAG, "LocalNotificationsBackend.showNotification: " + settings + " keys: " + settings.keySet());

        String key = PREFS_PREFIX + idString;
        JSONObject obj = getJSONNotificationObject(key);
        if (obj == null) {

            // return;
            obj = new JSONObject();
            try {
                obj.put("vibrate", false);
                obj.put("sound", false);
                obj.put("title", "A test notification");
                obj.put("body", "New job: fix Mr. Gluck's hazy TV, PDQ!");
                obj.put("id", 42);
                obj.put("timeMillisSince1970", System.currentTimeMillis());
            } catch (JSONException e) {
                Log.e(C.TAG, "Erm not thought possible");
            }
        }

        Notification n = createNotification(settings, obj);

        if (n != null) {
            NotificationManager nm = (NotificationManager) mContext.getSystemService(Service.NOTIFICATION_SERVICE);
            nm.notify(NOTIFICATION_MASK | obj.optInt("id"), n);
        }
        mPrefs.edit().remove(key).commit();
    }

    public JSONObject getJSONNotificationObject(int id) {
        return getJSONNotificationObject(PREFS_PREFIX + id);
    }

    protected JSONObject getJSONNotificationObject(String key) {
        String json = mPrefs.getString(key, null);
        if (json == null) {
            Log.e(C.TAG, "LocalNotification string for key='" + key + "' is null");
            return null;
        }
        JSONObject obj = null;
        try {
            obj = new JSONObject(json);
        } catch (JSONException e) {
            Log.e(C.TAG, "LocalNotification object not valid: " + json);
        }
        return obj;
    }

    @Override
    public void cancelNotifications_(JSONArray notificationIds) {

        Log.d(C.TAG, "LocalNotificationsBackend.cancelNotifications_: ");
        Editor editor = mPrefs.edit();
        AlarmManager am = (AlarmManager) mContext.getSystemService(Service.ALARM_SERVICE);
        NotificationManager nm = (NotificationManager) mContext.getSystemService(Service.NOTIFICATION_SERVICE);

        for (int i = 0, max = notificationIds.length(); i < max; i++) {
            int id = notificationIds.optInt(i);
            String idString = Integer.toString(id);
            PendingIntent pendingIntent = createPendingIntentForSchedule(idString);
            am.cancel(pendingIntent);
            nm.cancel(NOTIFICATION_MASK | id);
            String key = PREFS_PREFIX + idString;
            editor.remove(key);
        }

        editor.commit();
    }

}

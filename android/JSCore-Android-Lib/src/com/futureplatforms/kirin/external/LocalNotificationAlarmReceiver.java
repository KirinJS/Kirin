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


package com.futureplatforms.kirin.external;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Bundle;
import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.platformservices.LocalNotificationsBackend;

public class LocalNotificationAlarmReceiver extends BroadcastReceiver {

    private LocalNotificationsBackend mBackend;
    
    
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        
        if (action == null) {
            Log.w(C.TAG, "LocalNotificationAlarmReceiver: No action required");
            return;
        }
        
        Bundle settings = getMetadata(context);
        
        if (settings == null) {
            Log.i(C.TAG, "An icon resource, and a class name is needed as <meta-data> elements");
            return;
        }
        
        if (action.equals(Intent.ACTION_BOOT_COMPLETED)) {
            // reschedule the alarms.
            Log.i(C.TAG, "LocalNotificationAlarmReceiver.onReceive: ACTION_BOOT_COMPLETED");
            getBackend(context).rescheduleAllNotifications();
        } else if (action.equals(C.ACTION_LOCAL_NOTIFICATION)) {
            
            
            getBackend(context).showNotification(settings, intent);
        } else {
            Log.w(C.TAG, "LocalNotificationAlarmReceiver: Unknown action required: " + action);
        }
        
      
    }

    protected Bundle getMetadata(Context context) {
        try {
            ComponentName componentName = new ComponentName(context, this.getClass());
            ActivityInfo info = context.getPackageManager().getReceiverInfo(componentName, PackageManager.GET_META_DATA);
            
            return info.metaData;
        } catch (NameNotFoundException e) {
            Log.e(C.TAG, "Component not found: ", e);
        }
        return null;
    }

    public synchronized LocalNotificationsBackend getBackend(Context context) {
        if (mBackend == null) {
            mBackend = LocalNotificationsBackend.create(context);
        }
        return mBackend;
    }

    
}

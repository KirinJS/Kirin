package com.futureplatforms.kirin.test.dummies;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;

import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.IKirinDropbox;
import com.futureplatforms.kirin.helpers.IKirinHelper;
import com.futureplatforms.kirin.internal.attic.KirinDropbox;

public class DummyKirinHelper implements IKirinHelper {

    public Map<String, Object[]> mCallbacks = new HashMap<String, Object[]>();
    
    public List<String> mDeletedCallbacks = new ArrayList<String>();
    
    public List<String> mOrderOfCallbacks = new ArrayList<String>();

    private IKirinDropbox mDropbox = new KirinDropbox();
	
    public void clear() {
        mOrderOfCallbacks.clear();
        mCallbacks.clear();
        mDeletedCallbacks.clear();
        mDropbox  = new KirinDropbox();
    }
    
	@Override
	public void jsMethod(String methodName, Object... args) {
		
	}

	@Override
	public void jsCallback(String callback, Object... args) {
        if (callback == null) {
            return;
        }
        String s = MessageFormat.format(callback, args);
        Log.i(C.TAG, "DummyKirinHelper.jsCallback: " + s);
        mCallbacks.put(callback, args);
        mOrderOfCallbacks.add(callback);
	}

	@Override
	public void jsCallback(JSONObject config, String callbackName,
			Object... args) {
		if (config == null) {
			return;
		}
		jsCallback(config.optString(callbackName), args);

	}

	@Override
	public void cleanupCallback(String... callbacks) {
        for (String cb : callbacks) {
            if (cb == null) {
                continue;
            }
            mDeletedCallbacks.add(cb);
        }
	}

	@Override
	public void cleanupCallback(JSONObject config, String... callbackNames) {
		for (int i=0, max=callbackNames.length;i<max; i++) {
			
		}
	}

	@Override
	public IKirinDropbox getDropbox() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void onLoad() {
		// TODO Auto-generated method stub

	}

	@Override
	public void onUnload() {
		// TODO Auto-generated method stub

	}

}

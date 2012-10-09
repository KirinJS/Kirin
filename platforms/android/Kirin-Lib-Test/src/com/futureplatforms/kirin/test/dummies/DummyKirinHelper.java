package com.futureplatforms.kirin.test.dummies;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import junit.framework.Assert;

import org.json.JSONObject;

import android.app.Activity;
import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.helpers.IKirinExtensionHelper;
import com.futureplatforms.kirin.helpers.IKirinHelper;
import com.futureplatforms.kirin.internal.attic.KirinDropbox;
import com.futureplatforms.kirin.internal.attic.ProxyGenerator;
import com.futureplatforms.kirin.state.IKirinDropbox;
import com.futureplatforms.kirin.state.IKirinFileSystem;

public class DummyKirinHelper implements IKirinHelper, IKirinExtensionHelper {

    public Map<String, Object[]> mCallbacks = new HashMap<String, Object[]>();
    
    public List<String> mDeletedCallbacks = new ArrayList<String>();
    
    public List<String> mOrderOfCallbacks = new ArrayList<String>();

    private IKirinDropbox mDropbox = new KirinDropbox();
	
    public String mLastCall;
    
    public void clear() {
        mOrderOfCallbacks.clear();
        mCallbacks.clear();
        mDeletedCallbacks.clear();
        mDropbox  = new KirinDropbox();
        mLastCall = null;
    }
    
	@Override
	public void jsMethod(String methodName, Object... args) {
		mLastCall = methodName + Arrays.toString(args);
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
		
		for (String callback : callbackNames) {
			String id = config.optString(callback);
			if (id != null) {
				mDeletedCallbacks.add(id);
			}
		}
	}

	@Override
	public IKirinDropbox getDropbox() {
		return mDropbox;
	}

	@Override
	public void onLoad() {
		// TODO Auto-generated method stub

	}

	@Override
	public void onUnload() {
		// TODO Auto-generated method stub

	}

	
	
	
    public void verifyCalledCallbacks(String... callbacks) {
        Assert.assertEquals(Arrays.asList(callbacks), mOrderOfCallbacks);
    }
    
    public void verifyDeletedCallbacks(String... expectedCallbacks) {
        checkCallbacks(mDeletedCallbacks, expectedCallbacks);
    }

    private void checkCallbacks(List<String> observedCallbacks, String... expectedCallbacks) {
        String message = MessageFormat.format("Expected {0} but observed {1}", Arrays.asList(expectedCallbacks), observedCallbacks);
        if (expectedCallbacks.length != observedCallbacks.size()) {
            Assert.fail(message);
        }
        
        for (int i=0; i<expectedCallbacks.length; i++) {
            Assert.assertTrue(message, observedCallbacks.contains(expectedCallbacks[i]));
        }
    }

    public void verifyCallback(String string, Object... expectedArgs) {
        Object[] actualArgs = mCallbacks.get(string);
        
        Assert.assertEquals("Number of args for " + string + " callback does not match", expectedArgs.length, actualArgs.length);
        
        for (int i=0; i<expectedArgs.length; i++) {
            
            Assert.assertEquals(expectedArgs[i].toString(), actualArgs[i].toString());
        }
    }
    
    public Object[] getCallbackArgs(String callbackName) {
        return mCallbacks.get(callbackName);
    }

	@Override
	public Activity getActivity() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void onStart() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onStop() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setActive() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public IKirinFileSystem getFileSystem() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public <T> T javascriptProxyForModule(Class<T> interfaceClass) {
		return new ProxyGenerator(this).javascriptProxyForModule(interfaceClass);
	}

	@Override
	public void jsCallbackObjectMethod(String objectId, String methodName,
			Object... args) {
		mLastCall = objectId + "." + methodName + Arrays.toString(args);
	}
	
}

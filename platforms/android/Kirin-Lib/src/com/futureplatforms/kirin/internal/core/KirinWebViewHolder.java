package com.futureplatforms.kirin.internal.core;

import java.text.MessageFormat;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Build;
import android.util.Log;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.internal.fragmentation.WebChromeClient7;
import com.futureplatforms.kirin.internal.fragmentation.WebChromeClient8;

public class KirinWebViewHolder implements IJsContext {

	private final WebView mWebView;
	
	private final Context mContext;
	
	private final INativeContext mNativeContext;
	
    private volatile boolean mIsReady = false;

    private final Queue<String> mStatementQueue = new ConcurrentLinkedQueue<String>();
	
    public KirinWebViewHolder(Context context, INativeContext nativeContext) {
    	this(context, null, nativeContext);
    }
    
	public KirinWebViewHolder(Context context, WebView webView, INativeContext nativeContext) {
		if (webView == null) {
			webView = new WebView(context);
		}
		
		mNativeContext = nativeContext;
		mWebView = webView;
		mContext = context;
		
		initWebView(mWebView);
	}
	
	@Override
	public void js(String js) {
        if (C.DEBUGGING_SHOW_NATIVE_TO_JS_CALLS) {
            Log.d(C.TAG, "Webview is " + (mIsReady ? "" : "not ") + "initialized: " + js);
        }
        execJS(js);
	}

    private void execJS(String js) {
        if (mIsReady) {
            mWebView.loadUrl("javascript:" + js);
        } else {
            mStatementQueue.offer(js);
        }
    }
	
	@SuppressLint("SetJavaScriptEnabled")
	private void initWebView(WebView webView) {
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onLoadResource(WebView view, String url) {
                if (C.DEBUGGING_SHOW_NATIVE_TO_JS_CALLS) {
                    Log.d(C.TAG, "Requested: " + url);
                }
                super.onLoadResource(view, url);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(C.TAG, MessageFormat.format("Error {0}: ''{1}'' from {2}", errorCode, description, failingUrl));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (mIsReady) {
                	return;
                }
                super.onPageFinished(view, url);
                if (C.DEBUGGING_SHOW_NATIVE_TO_JS_CALLS) {
                    Log.d(C.TAG, "Finished: " + url);
                }

                for (String stmt : mStatementQueue) {
                    if (C.DEBUGGING_SHOW_NATIVE_TO_JS_CALLS) {
                        Log.d(C.TAG, stmt);
                    }
                    mWebView.loadUrl("javascript:" + stmt);
                }
                mStatementQueue.clear();
                mIsReady = true;
            }

        });

        // Allow servers to send specific versions of images.
        C.setUserAgentString(webView.getSettings().getUserAgentString() + " / " + mContext.getPackageName());
        if (C.DEBUGGING_SHOW_CONSOLE_LOG) {
            WebChromeClient client = null;
            if (Build.VERSION.SDK_INT >= 8) {
                client = new WebChromeClient8();
            } else if (Build.VERSION.SDK_INT == 7) {
                client = new WebChromeClient7();
            } else {
                client = new WebChromeClient();
            }
    
            if (client != null) {
                webView.setWebChromeClient(client);
            }
        }
        webView.addJavascriptInterface(new InjectedObject(), "JavaProxyObject");
        // TODO make this point to something a little less hardcoded.
        webView.loadUrl("file:///android_asset/generated-javascript/index.android.html");
    }
	
	
	public class InjectedObject {
		
	    public void call(String classMethod, String jsonArgs) {
	        String[] split = classMethod.split("\\.", 2);
	        assert split.length == 2;

	        String moduleName = split[0];
	        String methodName = split[1];
	        
	        Object[] args = null;
	        try {
	            JSONArray array = new JSONArray(jsonArgs);
	            args = new Object[array.length()];
	            for (int i = 0, max = array.length(); i < max; i++) {
	                Object object = array.get(i);
	                if (object != JSONObject.NULL) {
	                	args[i] = object;
	                } else {
	                	args[i] = null;
	                }
	            }
	        } catch (JSONException e) {
	            Log.e(C.JS_TAG, MessageFormat.format("Problem calling {0}.{1}{2}", moduleName, methodName, jsonArgs));
	            return;
	        }
	        
	        mNativeContext.executeCommandFromModule(moduleName, methodName, args);
	    }
	    
	    public void returnValue(int futureId, String result) {
	    	mNativeContext.setReturnValue((long) futureId, result);
	    }
    
	}
}

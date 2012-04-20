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


package com.futureplatforms.kirin.attic;

import java.text.MessageFormat;
import java.util.Collection;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.IKirinDropbox;
import com.futureplatforms.kirin.extensions.IKirinExtension;
import com.futureplatforms.kirin.extensions.IProguardImmunity;
import com.futureplatforms.kirin.extensions.databases.DatabasesBackend;
import com.futureplatforms.kirin.extensions.localnotifications.LocalNotificationsBackend;
import com.futureplatforms.kirin.extensions.networking.NetworkingBackend;
import com.futureplatforms.kirin.extensions.settings.SettingsBackend;
import com.futureplatforms.kirin.internal.attic.JSCallJava;
import com.futureplatforms.kirin.internal.attic.KirinDropbox;
import com.futureplatforms.kirin.internal.attic.NativeObjectHolder;
import com.futureplatforms.kirin.internal.fragmentation.WebChromeClient7;
import com.futureplatforms.kirin.internal.fragmentation.WebChromeClient8;

public class OldKirin implements IProguardImmunity {

    private Context mContext;

    private final WebView mWebView;

    private JSCallJava mCommandInvoker;

    private volatile boolean mIsReady = false;

    private Queue<String> mStatementQueue = new ConcurrentLinkedQueue<String>();

    private IKirinDropbox mDropbox = new KirinDropbox();

    private Application mAppDelegate;

    private ExecutorService mDefaultExecutorService;
    private ExecutorService mSingleThreadedExecutorService;

    private String mFileAreaPath;


    public OldKirin(Context context, Application app) {
    	this(context, app, true);
    }
    
    public OldKirin(Context context, Application app, boolean initialize) {
        this(new WebView(context));
        mContext = context;
        mAppDelegate = app;
        if (initialize) {
        	initialize();
        }
    }

    public OldKirin(WebView webView) {
        this.mWebView = webView;

        mCommandInvoker = new JSCallJava(mWebView.getContext(), new Handler());
    }

    public void initialize() {
        mDefaultExecutorService = Executors.newCachedThreadPool();
        mSingleThreadedExecutorService = Executors.newSingleThreadExecutor();
        
        initWebView(mWebView);

        loadServices();
        
    }

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
                if (C.DEBUGGING_SHOW_NATIVE_TO_JS_CALLS) {
                    Log.d(C.TAG, "Finished: " + url);
                }
                super.onPageFinished(view, url);

                for (String stmt : mStatementQueue) {
                    if (C.DEBUGGING_SHOW_NATIVE_TO_JS_CALLS) {
                        Log.d(C.TAG, stmt);
                    }
                    mWebView.loadUrl(stmt);
                }

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
        Log.i(C.TAG, "About to load file into webview");
        webView.addJavascriptInterface(this, "JavaProxyObject");
        webView.loadUrl("file:///android_asset/generated-javascript/index-android.html");

    }

    /**
     * This is a view on Kirin 
     * @author james
     *
     */
    public class Java2Js implements IJava2Js {

        @Override
        public void callCallback(String callback, Object... args) {
            if (callback == null) {
                return;
            }
            if (args.length == 0) {
                fireEventIntoJS("native2js.callCallback(\"{0}\")", callback);
                return;
            }
            // native2js.callCallback(\"%@\")"
            StringBuilder sb = new StringBuilder();
            for (Object arg : args) {
                sb.append(", ").append(arg.toString());
            }
            fireEventIntoJS("native2js.callCallback(\"{0}\"{1})", callback, sb.toString());
        }

        @Override
        public void callJS(String pattern, Object... args) {
            fireEventIntoJS(pattern, args);
        }

        @Override
        public void deleteCallback(String... callbacks) {
            if (callbacks.length == 0) {
                return;
            }
            StringBuilder sb = new StringBuilder("native2js.deleteCallback(");
            boolean isFirst = true;
            for (Object callback : callbacks) {
                if (callback == null) {
                    continue;
                }
                if (isFirst) {
                    isFirst = false;
                } else {
                    sb.append(", ");
                }
                sb.append("\"").append(callback).append("\"");
            }
            sb.append(")");

            fireEventIntoJS(sb.toString());
        }

        @Override
        public IKirinDropbox getDropbox() {
            return mDropbox;
        }

        @Override
        public String getPathToJavascriptDir() {
            return "generated-javascript";
        }

    }

    public Object getService(String proxyName) {
        return mCommandInvoker.getService(proxyName);
    }

    /*
     * This sets up the platform services. 
     */
    private void loadServices() {
        IJava2Js java2Js = new Java2Js();
        String packageName = mContext.getPackageName();
        String sdCardPrefix = Environment.getExternalStorageDirectory().getPath();
        mFileAreaPath = sdCardPrefix + MessageFormat.format("/Android/data/{0}/files", packageName);
        if (!mFileAreaPath.endsWith("/")) {
            mFileAreaPath += "/";
        }

        SharedPreferences prefs = mContext.getSharedPreferences("common-settings", 0);
        //getArtifacts().put(SharedPreferences.class, prefs);

        loadService("Settings-backend", new SettingsBackend(mContext, prefs));
        // sigh. We can't use apostrophes.
        java2Js.callJS("native2js.require(\"Environment\")");

        addJavaUIObjectToJS(mAppDelegate, "NativeAppDelegate");

        // Add new services here.
        loadService("Databases-backend", new DatabasesBackend(mContext, prefs, java2Js, mDefaultExecutorService,
                Executors.newSingleThreadExecutor()), mSingleThreadedExecutorService);

        loadService("Networking-backend", new NetworkingBackend(mContext, java2Js, mFileAreaPath));

        loadService("LocalNotifications-backend", LocalNotificationsBackend.create(mContext));

        java2Js.callJS("native2js.initializeApplicationLifecycle()");
    }

    private IKirinExtension loadService(String name, IKirinExtension service) {
        return loadService(name, service, mDefaultExecutorService);
    }

    private IKirinExtension loadService(String name, IKirinExtension service, ExecutorService threads) {
        // this uses a handler, and run on the main thread.
        // addJavaUIObjectToJS(service, name);

        // this uses its own thread executor service to run in.
        addJavaObjectToJS(service, name, threads);
        service.onLoad();

        return service;
    }

    public WebView getWebView() {
        return mWebView;
    }

    private void addJavaUIObjectToJS(Object activity, String name) {
        NativeObjectHolder holder = mCommandInvoker.setObject(activity, name);
        Collection<String> methodNames = holder.getMethodNames();
        this.fireEventIntoJS("native2js.registerProxy(\"{0}\", {1});", name, jsonString(methodNames));
    }

    protected String jsonString(Collection<String> methodNames) {
        StringBuilder sb = new StringBuilder("[");
        boolean isFirst = true;
        
        for (String methodName : methodNames) {
            if (isFirst) {
                isFirst = false;
            } else {
                sb.append(",");
            }
            sb.append('"');
            sb.append(methodName);
            sb.append('"');
        }
        sb.append("]");
        
        String jsonString = sb.toString();
        return jsonString;
    }

    private void addJavaObjectToJS(Object obj, String name, ExecutorService threads) {
        NativeObjectHolder holder = mCommandInvoker.setObject(obj, name, threads);
        this.fireEventIntoJS("native2js.registerProxy(\"{0}\", {1});", name, jsonString(holder.getMethodNames()));
    }

    private void execJS(String js) {
        if (mIsReady) {
            mWebView.loadUrl(js);
        } else {
            mStatementQueue.offer(js);
        }
    }

    private void execJSAndLog(String js) {
        if (C.DEBUGGING_SHOW_NATIVE_TO_JS_CALLS) {
            Log.d(C.TAG, js);
        }
        execJS(js);
    }

    /*
     * THIS IS THE EXIT POINT FROM JAVASCRIPT. CHANGING THIS METHOD SIGNATURE
     * WILL BREAK THE APP.
     */
    public void call(String method, String jsonArgs) {
        execJS("javascript:EXPOSED_TO_NATIVE.js_java_bridge.ready=true");
        mCommandInvoker.call(method, jsonArgs);
    }

    /*************************************************************************
     * 
     * Public API
     * 
     */
    

    
    /**
     * Bind the current screen module.js to the activity.
     * 
     * Functions on that module can now be called by referencing its proxy, e.g.:
     * <tt>
     * fireEventIntoJS("native2jsScreenProxy.onResume()");
     * </tt>
     * 
     * @param name
     * @param activity
     */
    public void setCurrentScreen(final String name, final Activity activity) {
        addJavaUIObjectToJS(activity, "NativeScreenObject");
        this.fireEventIntoJS("native2js.setCurrentScreenProxy(\"{0}\");", name);
    }
    
    
    public void fireEventIntoJS(String command, Object... params) {
        String url = "javascript:EXPOSED_TO_NATIVE." + command;
        execJSAndLog(MessageFormat.format(url, params));
    }
    
    
    
    /**
     * Dropboxes should be used to pass things from native to native, via JS. 
     * The JS won't need the object itself, but needs to be able to pass a reference 
     * to it around.
     * @return
     */
    public IKirinDropbox getDropbox() {
        return mDropbox;
    }

    public String getExternalFilePath(String filename) {
        return mFileAreaPath + filename;
    }

    public String getExternalFileUrl(String filename) {
        return "file://" + mFileAreaPath + filename;
    }


    
}

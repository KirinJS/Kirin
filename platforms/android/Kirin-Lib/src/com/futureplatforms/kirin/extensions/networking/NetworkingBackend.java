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

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.MessageFormat;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.http.client.HttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.os.Environment;
import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.R;
import com.futureplatforms.kirin.extensions.KirinExtensionAdapter;
import com.futureplatforms.kirin.helpers.IKirinExtensionHelper;
import com.futureplatforms.kirin.internal.JSONUtils;
import com.futureplatforms.kirin.internal.attic.IOUtils;
import com.futureplatforms.kirin.internal.attic.SDCardFileUtils;

public class NetworkingBackend extends KirinExtensionAdapter implements INetworkingBackend {

	private final Context mContext;

	private final SDCardFileUtils mFileUtils;


	private BroadcastReceiver mReceiver;

	private AtomicInteger mDownloadingCount;

	private HttpClient mHttpClient;

	public NetworkingBackend(Context context) {
		this(context, null, null);
	}
	
	public NetworkingBackend(Context context, IKirinExtensionHelper kirinHelper,
			String saveFileLocation) {
		super(context, "Networking", kirinHelper);
		mContext = context;

		
        String packageName = mContext.getPackageName();
        String sdCardPrefix = Environment.getExternalStorageDirectory().getPath();
        String path = sdCardPrefix + MessageFormat.format("/Android/data/{0}/files", packageName);
        if (!path.endsWith("/")) {
            path += "/";
        }
		mFileUtils = new SDCardFileUtils(path);
		
		mDownloadingCount = new AtomicInteger(0);
	}

	protected String downloadString(JSONObject config) throws IOException {
		incrementDownloadCount();
		InputStream in = null;
		ByteArrayOutputStream baos = null;
		HttpClient client = null;
		try {
			client = getClient();
			in = makeConnection(config, client);
			baos = new ByteArrayOutputStream(8 * 1024);
			IOUtils.copy(in, baos);
			return baos.toString("UTF-8");
		} finally {
			IOUtils.close(in);
			IOUtils.close(baos);
			IOUtils.cleanupHttpClient(client);
			decrementDownloadCount();
		}
	}

	private synchronized HttpClient getClient() {
		if (mHttpClient == null) {
			mHttpClient = IOUtils.newHttpClient();
		}
		return mHttpClient;
	}

	private InputStream makeConnection(JSONObject config, HttpClient client)
			throws MalformedURLException, IOException {

		URL url = new URL(config.optString("url"));
		String method = config.optString("method", "GET");
		if (method.equalsIgnoreCase("GET")) {
			return IOUtils.connectTo(mContext, url, client);
		} else {
			return IOUtils.postConnection(mContext, url, method,
					config.optString("params"));
		}
	}

	protected void downloadFile(String urlString, String pathSuffix)
			throws IOException {

		InputStream in = null;
		OutputStream out = null;
		HttpClient client = getClient();
		File file = mFileUtils.readableFile(mContext, pathSuffix);
		if (file.exists()) {
			return;
		}
		try {
			incrementDownloadCount();
			URL url = new URL(urlString);
			in = IOUtils.connectTo(mContext, url, client);
			out = mFileUtils.outputStream(mContext, pathSuffix);

			IOUtils.copy(in, out);

		} finally {
			IOUtils.close(in);
			IOUtils.close(out);
			IOUtils.cleanupHttpClient(client);
			decrementDownloadCount();
		}
	}

	@Override
	public void deleteDownloadedFile_(JSONObject config) {
		String filename = JSONUtils.stringOrNull(config, "filename", null);
		try {
			mFileUtils.deleteFile(mContext, filename);
			mKirinHelper.jsCallback(config, "onFinish");
		} catch (Exception e) {
			Log.e(C.TAG, "Can't delete " + filename);
			reportExceptionToJavascript(config, e);
		} finally {
			cleanup(config, "onFinish", "onError");
		}
	}

	private void reportExceptionToJavascript(JSONObject config, Exception e) {
		Log.e(C.TAG, "Backend reported exception " + e, e);
		mKirinHelper.jsCallback(config, "onError", e.getLocalizedMessage());
	}

	@Override
	public void downloadFile_(JSONObject config) {
		try {
			downloadFile(config.optString("url"), config.optString("filename"));
			mKirinHelper.jsCallback(config, "onFinish");
		} catch (IOException e) {
			reportExceptionToJavascript(config, e);
		} finally {
			cleanup(config, "onFinish", "onError");
		}
	}

	private void incrementDownloadCount() {
		int count = mDownloadingCount.getAndIncrement();
		Log.i(C.TAG, "NetworkingBackend.incrementDownloadCount: " + count);
		if (count == 0) {
			listenForChangeInNetworkStatus();
		}
	}

	private void decrementDownloadCount() {
		int count = mDownloadingCount.decrementAndGet();
		Log.i(C.TAG, "NetworkingBackend.decrementDownloadCount: " + count);
		if (count == 0) {
			zeroCountReached();
		}
	}

	protected void zeroCountReached() {
		Log.i(C.TAG, "NetworkingBackend.zeroCountReached: ");
		if (mReceiver != null) {
			mContext.unregisterReceiver(mReceiver);
		}
		mReceiver = null;

		cleanupHttpClient();
	}

    protected void cleanupHttpClient() {
        HttpClient client = null;
		synchronized (this) {
			if (mHttpClient != null) {
				client = mHttpClient;
				mHttpClient = null;
			}
		}
		IOUtils.closeHttpClient(client);
    }

	public JSONArray isolateArrayFromObject(JSONObject object, JSONArray path) {

		JSONArray list = null;
		JSONObject parent = object;

		for (int i = 0, max = path.length(); i < max; i++) {

			String pathSegment = JSONUtils.stringOrNull(path, i, null);
			if (pathSegment == null) {
				continue;
			}

			Object obj = parent.opt(pathSegment);

			if (obj == null) {
				// not found.
				return null;
			} else if (obj instanceof JSONArray) {
				list = (JSONArray) obj;
				parent.remove(pathSegment);
				break;
			} else if (obj instanceof JSONObject) {
				parent = (JSONObject) obj;
			} else {
				// not found
				return null;
			}
		}

		return list;
	}

	@Override
	public void downloadJSONList_(JSONObject config) {
		String jsonString = null;

		try {
			jsonString = downloadString(config);

			JSONArray array = null;
			JSONObject envelope = null;
			int arraySize = 0;

			String eachCallback = JSONUtils.stringOrNull(config, "each", null);

			Object obj = new JSONTokener(jsonString).nextValue();
			if (obj instanceof JSONArray) {
				array = (JSONArray) obj;
			} else if (obj instanceof JSONObject) {
				envelope = (JSONObject) obj;
				JSONArray path = config.optJSONArray("path");
				if (path != null) {
					array = isolateArrayFromObject(envelope, path);
				}
			}

			if (envelope != null) {
				mKirinHelper.jsCallback(config, "envelope", envelope);
			}
			if (array != null && eachCallback != null) {
				for (int i = 0, max = array.length(); i < max; i++) {
					Object item = array.get(i);
					if (item != null) {
						mKirinHelper.jsCallback(eachCallback, item);
					}
				}
				arraySize = array.length();
			}

			if (array == null && envelope == null) {
				Log.e(C.TAG, "Server provided badly formatted JSON: "
						+ jsonString);
				mKirinHelper.jsCallback(config, "onError", "Invalid JSON");
			} else {
				mKirinHelper.jsCallback(config, "onFinish", arraySize);
			}
		} catch (IOException e) {
			Log.e(C.TAG, "Couldn't connect to the server", e);
			reportExceptionToJavascript(config, e);
		} catch (JSONException e) {
			Log.e(C.TAG, "Server provided badly formatted JSON: " + jsonString);
			reportExceptionToJavascript(config, e);
		} finally {
			cleanup(config, "envelope", "each", "onError", "onFinish");
		}
	}

	@Override
	public void downloadJSON_(JSONObject config) {
		try {
			String jsonString = downloadString(config);
			Log.i(C.TAG, "NetworkingBackend.downloadJSON_: downloadJSON_ : "
					+ jsonString);
			Object obj = new JSONTokener(jsonString).nextValue();
            if (!(obj instanceof JSONArray) && !(obj instanceof JSONObject)) {
            	mKirinHelper.jsCallback(config, "onError", "Invalid JSON response received");
            } else {
            	mKirinHelper.jsCallback(config, "payload", new JSONTokener(jsonString).nextValue());
            }
		} catch (IOException e) {
			reportExceptionToJavascript(config, e);
		} catch (JSONException e) {
			reportExceptionToJavascript(config, e);
		} finally {
			cleanup(config, "payload", "onError");
		}
	}

	private void cleanup(JSONObject config, String... callbacks) {
		mKirinHelper.cleanupCallback(config, callbacks);
	}

	private void listenForChangeInNetworkStatus() {
		Log.i(C.TAG, "NetworkingBackend.listenForChangeInNetworkStatus: ");
		mReceiver = new BroadcastReceiver() {

			@Override
			public void onReceive(Context context, Intent intent) {
				if (intent.getBooleanExtra(
						ConnectivityManager.EXTRA_NO_CONNECTIVITY, false)) {
					String reason = intent
							.getStringExtra(ConnectivityManager.EXTRA_REASON);
					if (reason == null || reason.trim().length() == 0) {
						reason = mContext
								.getString(R.string.networking_connection_lost);
					}
					cancelAllDownloads(reason);
				}
			}

		};
		mContext.registerReceiver(mReceiver, new IntentFilter(
				ConnectivityManager.CONNECTIVITY_ACTION));

	}

	protected void cancelAllDownloads(String reason) {
		Log.i(C.TAG,
				"NetworkingBackend.cancelAllDownloads: NETWORK CONNECTIVITY LOST, shutting down HttpClient");

		cleanupHttpClient();
	}

}

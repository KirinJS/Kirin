package com.futureplatforms.kirin.extensions.networking;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.util.Log;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.extensions.KirinExtensionAdapter;
import com.futureplatforms.kirin.generated.xhr.KirinXHRExtension;
import com.futureplatforms.kirin.generated.xhr.KirinXHRProgressEvent;
import com.futureplatforms.kirin.generated.xhr.KirinXHRResponse;
import com.futureplatforms.kirin.generated.xhr.KirinXHRequest;

public class KirinXHRExtensionImpl extends KirinExtensionAdapter implements
		KirinXHRExtension {

	public KirinXHRExtensionImpl(Context context) {
		super(context, "KirinXMLHTTPRequest");
	}

	@Override
	public void open(KirinXHRequest xhrObject, Object data) {
		String urlString = xhrObject.getUrl();

		URL url;
		URLConnection connection = null;
		try {
			url = new URL(urlString);
			connection = url.openConnection();
		} catch (MalformedURLException e) {
			Log.e(C.TAG, "Error constructing url to " + urlString, e);
			xhrObject._doOnInitialisationError(e.getLocalizedMessage());
		} catch (IOException e) {
			Log.e(C.TAG, "Error connecting to " + urlString, e);
			xhrObject._doOnInitialisationError(e.getLocalizedMessage());
		}
		if (connection == null) {
			return;
		}
		
		
		
		JSONObject headers = xhrObject.getRequestHeaders();
		for (@SuppressWarnings("unchecked")
		Iterator<String> iterator = headers.keys(); iterator.hasNext();) {
			String header = iterator.next();
			String value = headers.optString(header);
			connection.addRequestProperty(header, value);
		}
		
		connection.setReadTimeout((int) xhrObject.getTimeout());
		
		if (xhrObject.getResponseType() != null) {
			// TODO implement getResponseType() - not sure how to deal with this.
			// we can be "text", "json", "document", "arraybuffer", "blob"
		}
		
		try {
			connection.connect();
			if (data != null) {
				// TODO send the data.
				// this may include file upload data.
			}
			
			JSONObject responseHeadersJson = new JSONObject();
			if (connection instanceof HttpURLConnection) {
				HttpURLConnection httpConnection = (HttpURLConnection) connection;
				
				
				Map<String, List<String>> responseHeaders = httpConnection.getHeaderFields();
				
				for (Map.Entry<String, List<String>> entry : responseHeaders.entrySet()) {
					try {
						responseHeadersJson.putOpt(entry.getKey(), new JSONArray(entry.getValue()));
					} catch (JSONException e) {
						Log.e(C.TAG, "Problem with response header " + entry.getKey(), e);
					}
				}
			}

			xhrObject._doOnConnect(responseHeadersJson, newProgressEvent(0, 0));
			
			
			// Now we should download whatever we're given.
			
			// TODO download all the stuffs from that we need.
			
			BufferedInputStream in = new BufferedInputStream(connection.getInputStream());
			
			
			
			
			Object downloaded = connection.getContent();

			if (downloaded != null) {
				downloaded = downloaded.toString();
			} else {
				downloaded = "";
			}
			
			// Now we've downloaded, we should finish up.
			KirinXHRResponse response = newResponse();
		
			if (connection instanceof HttpURLConnection) {
				HttpURLConnection httpConnection = (HttpURLConnection) connection;
				response.setStatus(httpConnection.getResponseCode());
				response.setStatusText(httpConnection.getResponseMessage());
			} else {
				response.setStatus(HttpURLConnection.HTTP_OK);
				response.setStatusText("OK");
			}
			
			
			xhrObject._doOnRequestComplete(response.getStatus(), response, newProgressEvent(0, 0));
			
		} catch (IOException e) {
			// was this a timeout
			
			// was this a connectivity problem?
		}		
	}

	private KirinXHRResponse newResponse() {
		return this.mKirinHelper.javascriptProxyForValueObject(new JSONObject(), KirinXHRResponse.class);
	}
	
	private KirinXHRProgressEvent newProgressEvent(int loaded, int total) {
		KirinXHRProgressEvent event = this.mKirinHelper.javascriptProxyForValueObject(new JSONObject(), KirinXHRProgressEvent.class);
		event.setLoaded(loaded);
		event.setTotal(total);
		return event;
	}

	@Override
	public void abort(String xhrId) {
		
	}

}

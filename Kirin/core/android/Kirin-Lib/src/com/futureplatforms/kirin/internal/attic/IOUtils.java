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


package com.futureplatforms.kirin.internal.attic;

import java.io.BufferedReader;
import java.io.Closeable;
import java.io.FileDescriptor;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.text.MessageFormat;
import java.util.zip.GZIPInputStream;

import org.apache.http.Header;
import org.apache.http.HeaderElement;
import org.apache.http.HttpEntity;
import org.apache.http.HttpException;
import org.apache.http.HttpRequest;
import org.apache.http.HttpRequestInterceptor;
import org.apache.http.HttpResponse;
import org.apache.http.HttpResponseInterceptor;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.entity.HttpEntityWrapper;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.client.DefaultHttpRequestRetryHandler;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.HttpContext;

import android.content.Context;
import android.util.Log;

import com.futureplatforms.kirin.C;

public class IOUtils {

    public static HttpClient newHttpClient() {
        int timeout = 3 * 60 * 1000;
        DefaultHttpClient httpClient = new DefaultHttpClient();
        ClientConnectionManager mgr = httpClient.getConnectionManager();
        HttpParams params = httpClient.getParams();
        ThreadSafeClientConnManager cm = new ThreadSafeClientConnManager(params, mgr.getSchemeRegistry());
        httpClient = new DefaultHttpClient(cm, params);

        // how long are we prepared to wait to establish a connection?
        HttpConnectionParams.setConnectionTimeout(params, timeout);

        // how long should the socket wait for data?
        HttpConnectionParams.setSoTimeout(params, timeout);

        httpClient.setHttpRequestRetryHandler(new DefaultHttpRequestRetryHandler(3, false) {

            @Override
            public boolean retryRequest(IOException exception, int executionCount, HttpContext context) {
                return super.retryRequest(exception, executionCount, context);
            }

            @Override
            public boolean isRequestSentRetryEnabled() {
                return false;
            }
        });

        httpClient.addRequestInterceptor(new HttpRequestInterceptor() {

            public void process(final HttpRequest request, final HttpContext context) throws HttpException, IOException {
                if (!request.containsHeader("Accept-Encoding")) {
                    request.addHeader("Accept-Encoding", "gzip");
                }
            }

        });

        httpClient.addResponseInterceptor(new HttpResponseInterceptor() {

            public void process(final HttpResponse response, final HttpContext context) throws HttpException,
                    IOException {
                response.removeHeaders("Set-Cookie");

                HttpEntity entity = response.getEntity();
                Header contentEncodingHeader = entity.getContentEncoding();
                if (contentEncodingHeader != null) {
                    HeaderElement[] codecs = contentEncodingHeader.getElements();
                    for (int i = 0; i < codecs.length; i++) {
                        if (codecs[i].getName().equalsIgnoreCase("gzip")) {
                            response.setEntity(new GzipDecompressingEntity(response.getEntity()));
                            return;
                        }
                    }
                }

            }

        });
        return httpClient;
    }

    static class GzipDecompressingEntity extends HttpEntityWrapper {

        public GzipDecompressingEntity(final HttpEntity entity) {
            super(entity);
        }

        
        
        @Override
        public InputStream getContent() throws IOException, IllegalStateException {

            // the wrapped entity's getContent() decides about repeatability
            InputStream wrappedin = wrappedEntity.getContent();

            return new GZIPInputStream(wrappedin);
        }

        @Override
        public long getContentLength() {
            // length of ungzipped content is not known
            return -1;
        }

    }

    public static InputStream postConnection(Context context, URL url, String method, String urlParameters)
            throws IOException {
        if (!url.getProtocol().startsWith("http")) {
            return url.openStream();
        }

        URLConnection c = url.openConnection();

        HttpURLConnection connection = (HttpURLConnection) c;

        connection.setRequestMethod(method.toUpperCase());
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        connection.setRequestProperty("Content-Length", "" + Integer.toString(urlParameters.getBytes().length));
        connection.setRequestProperty("Content-Language", "en-US");

        connection.setUseCaches(false);
        connection.setDoInput(true);
        connection.setDoOutput(true);

        OutputStream output = null;
        try {
            output = connection.getOutputStream();
            output.write(urlParameters.getBytes("UTF-8"));
            output.flush();
        } finally {
            IOUtils.close(output);
        }
        return connection.getInputStream();
    }

    public static InputStream connectTo(Context context, URL url, HttpClient client) throws IOException {
        int retries = 1;
        IOException exception;
        do {
            try {
                HttpGet request = new HttpGet(url.toString());

                request.setHeader("User-Agent", C.getUserAgentString());

                HttpResponse resp = client.execute(request);
                HttpEntity entity = resp.getEntity();
                InputStream rawContent = entity.getContent();

                return rawContent;
            } catch (IOException e) {
                exception = e;
                Log.e(C.TAG, MessageFormat.format("Problem connecting to {0}. Have {1} retries left", url, retries), e);
            } catch (IllegalStateException e) {
                exception = new IOException(e.getLocalizedMessage());
                Log.e(C.TAG, MessageFormat.format("Problem connecting to {0}. Aborting", url, retries), e);
                break;
            }
        } while (retries-- > 0);
        assert exception != null;
        throw exception;
    }

    public static void closeHttpClient(HttpClient client) {
        if (client != null) {
            client.getConnectionManager().shutdown();
        }
    }

    public static void close(Closeable stream) {
        if (stream != null) {
            try {
                stream.close();
            } catch (IOException e) {
                Log.v(C.TAG, "An extremely rare IOException while closing problem was reported", e);
            }
        }
    }

    public static long copy(InputStream in, OutputStream out) throws IOException {

        byte[] b = new byte[1024];
        int count;
        long total = 0l;
        while ((count = in.read(b)) >= 0) {
            out.write(b, 0, count);
            total += count;
        }
        out.flush();
        return total;
    }

    public static String loadTextAsset(Context activity, String filename) throws IOException {
        BufferedReader in = null;
        try {
        	
            in = new BufferedReader(new InputStreamReader(activity.getAssets().open(filename)));
            String line;
            StringBuilder buffer = new StringBuilder();
            while ((line = in.readLine()) != null) {
                buffer.append(line).append('\n');
            }
            return buffer.toString();
        } finally {
            close(in);
        }
    }

    public static void cleanupHttpClient(HttpClient client) {
        client.getConnectionManager().closeExpiredConnections();
    }

}

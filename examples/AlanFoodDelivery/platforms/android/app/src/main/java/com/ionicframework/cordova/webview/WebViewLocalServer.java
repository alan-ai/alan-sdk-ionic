/*
Copyright 2015 Google Inc. All rights reserved.

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
package com.ionicframework.cordova.webview;

import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import org.apache.cordova.ConfigXmlParser;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Helper class meant to be used with the android.webkit.WebView class to enable hosting assets,
 * resources and other data on 'virtual' http(s):// URL.
 * Hosting assets and resources on http(s):// URLs is desirable as it is compatible with the
 * Same-Origin policy.
 * <p>
 * This class is intended to be used from within the
 * {@link android.webkit.WebViewClient#shouldInterceptRequest(android.webkit.WebView, String)} and
 * {@link android.webkit.WebViewClient#shouldInterceptRequest(android.webkit.WebView,
 * android.webkit.WebResourceRequest)}
 * methods.
 */
public class WebViewLocalServer {
  private static String TAG = "WebViewAssetServer";
  private String basePath;
  public final static String httpScheme = "http";
  public final static String httpsScheme = "https";
  public final static String fileStart = "/_app_file_";
  public final static String contentStart = "/_app_content_";

  private final UriMatcher uriMatcher;
  private final AndroidProtocolHandler protocolHandler;
  private final String authority;
  private final String customScheme;
  // Whether we're serving local files or proxying (for example, when doing livereload on a
  // non-local endpoint (will be false in that case)
  private boolean isAsset;
  // Whether to route all requests to paths without extensions back to `index.html`
  private final boolean html5mode;
  private ConfigXmlParser parser;

  public String getAuthority() { return authority; }

  /**
   * A handler that produces responses for paths on the virtual asset server.
   * <p>
   * Methods of this handler will be invoked on a background thread and care must be taken to
   * correctly synchronize access to any shared state.
   * <p>
   * On Android KitKat and above these methods may be called on more than one thread. This thread
   * may be different than the thread on which the shouldInterceptRequest method was invoke.
   * This means that on Android KitKat and above it is possible to block in this method without
   * blocking other resources from loading. The number of threads used to parallelize loading
   * is an internal implementation detail of the WebView and may change between updates which
   * means that the amount of time spend blocking in this method should be kept to an absolute
   * minimum.
   */
  public abstract static class PathHandler {
    protected String mimeType;
    private String encoding;
    private String charset;
    private int statusCode;
    private String reasonPhrase;
    private Map<String, String> responseHeaders;

    public PathHandler() {
      this(null, null, 200, "OK", null);
    }

    public PathHandler(String encoding, String charset, int statusCode,
                       String reasonPhrase, Map<String, String> responseHeaders) {
      this.encoding = encoding;
      this.charset = charset;
      this.statusCode = statusCode;
      this.reasonPhrase = reasonPhrase;
      Map<String, String> tempResponseHeaders;
      if (responseHeaders == null) {
        tempResponseHeaders = new HashMap<String, String>();
      } else {
        tempResponseHeaders = responseHeaders;
      }
      tempResponseHeaders.put("Cache-Control", "no-cache");
      this.responseHeaders = tempResponseHeaders;
    }

    abstract public InputStream handle(Uri url);

    public String getEncoding() {
      return encoding;
    }

    public String getCharset() {
      return charset;
    }

    public int getStatusCode() {
      return statusCode;
    }

    public String getReasonPhrase() {
      return reasonPhrase;
    }

    public Map<String, String> getResponseHeaders() {
      return responseHeaders;
    }
  }

  /**
   * Information about the URLs used to host the assets in the WebView.
   */
  public static class AssetHostingDetails {
    private Uri httpPrefix;
    private Uri httpsPrefix;

    /*package*/ AssetHostingDetails(Uri httpPrefix, Uri httpsPrefix) {
      this.httpPrefix = httpPrefix;
      this.httpsPrefix = httpsPrefix;
    }

    /**
     * Gets the http: scheme prefix at which assets are hosted.
     *
     * @return the http: scheme prefix at which assets are hosted. Can return null.
     */
    public Uri getHttpPrefix() {
      return httpPrefix;
    }

    /**
     * Gets the https: scheme prefix at which assets are hosted.
     *
     * @return the https: scheme prefix at which assets are hosted. Can return null.
     */
    public Uri getHttpsPrefix() {
      return httpsPrefix;
    }
  }

  WebViewLocalServer(Context context, String authority, boolean html5mode, ConfigXmlParser parser, String customScheme) {
    uriMatcher = new UriMatcher(null);
    this.html5mode = html5mode;
    this.parser = parser;
    this.protocolHandler = new AndroidProtocolHandler(context.getApplicationContext());
    this.authority = authority;
    this.customScheme = customScheme;
  }

  private static Uri parseAndVerifyUrl(String url) {
    if (url == null) {
      return null;
    }
    Uri uri = Uri.parse(url);
    if (uri == null) {
      Log.e(TAG, "Malformed URL: " + url);
      return null;
    }
    String path = uri.getPath();
    if (path == null || path.length() == 0) {
      Log.e(TAG, "URL does not have a path: " + url);
      return null;
    }
    return uri;
  }
  
  private static WebResourceResponse createWebResourceResponse(String mimeType, String encoding, int statusCode, String reasonPhrase, Map<String, String> responseHeaders, InputStream data) {
    if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      int finalStatusCode = statusCode;
      try {
        if (data.available() == 0) {
          finalStatusCode = 404;
        }
      } catch (IOException e) {
        finalStatusCode = 500;
      }
      return new WebResourceResponse(mimeType, encoding, finalStatusCode, reasonPhrase, responseHeaders, data);
    } else {
      return new WebResourceResponse(mimeType, encoding, data);
    }
  }

  /**
   * Attempt to retrieve the WebResourceResponse associated with the given <code>request</code>.
   * This method should be invoked from within
   * {@link android.webkit.WebViewClient#shouldInterceptRequest(android.webkit.WebView,
   * android.webkit.WebResourceRequest)}.
   *
   * @param uri the request Uri to process.
   * @return a response if the request URL had a matching handler, null if no handler was found.
   */
  public WebResourceResponse shouldInterceptRequest(Uri uri, WebResourceRequest request) {
    PathHandler handler;
    synchronized (uriMatcher) {
      handler = (PathHandler) uriMatcher.match(uri);
    }
    if (handler == null) {
      return null;
    }

    if (isLocalFile(uri) || uri.getAuthority().equals(this.authority)) {
      Log.d("SERVER", "Handling local request: " + uri.toString());
      return handleLocalRequest(uri, handler, request);
    } else {
      return handleProxyRequest(uri, handler);
    }
  }

  private boolean isLocalFile(Uri uri) {
    String path = uri.getPath();
    if (path.startsWith(contentStart) || path.startsWith(fileStart)) {
      return true;
    }
    return false;
  }


  private WebResourceResponse handleLocalRequest(Uri uri, PathHandler handler, WebResourceRequest request) {
    String path = uri.getPath();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && request != null && request.getRequestHeaders().get("Range") != null) {
      InputStream responseStream = new LollipopLazyInputStream(handler, uri);
      String mimeType = getMimeType(path, responseStream);
      Map<String, String> tempResponseHeaders = handler.getResponseHeaders();
      int statusCode = 206;
      try {
        int totalRange = responseStream.available();
        String rangeString = request.getRequestHeaders().get("Range");
        String[] parts = rangeString.split("=");
        String[] streamParts = parts[1].split("-");
        String fromRange = streamParts[0];
        int range = totalRange-1;
        if (streamParts.length > 1) {
          range = Integer.parseInt(streamParts[1]);
        }
        tempResponseHeaders.put("Accept-Ranges", "bytes");
        tempResponseHeaders.put("Content-Range", "bytes " + fromRange + "-" + range + "/" + totalRange);
      } catch (IOException e) {
        statusCode = 404;
      }
      return createWebResourceResponse(mimeType, handler.getEncoding(),
              statusCode, handler.getReasonPhrase(), tempResponseHeaders, responseStream);
    }
    if (isLocalFile(uri)) {
      InputStream responseStream = new LollipopLazyInputStream(handler, uri);
      String mimeType = getMimeType(path, responseStream);
      return createWebResourceResponse(mimeType, handler.getEncoding(),
              handler.getStatusCode(), handler.getReasonPhrase(), handler.getResponseHeaders(), responseStream);
    }

    if (path.equals("") || path.equals("/") || (!uri.getLastPathSegment().contains(".") && html5mode)) {
      InputStream stream;
      String launchURL = parser.getLaunchUrl();
      String launchFile = launchURL.substring(launchURL.lastIndexOf("/") + 1, launchURL.length());
      try {
        String startPath = this.basePath + "/" + launchFile;
        if (isAsset) {
          stream = protocolHandler.openAsset(startPath);
        } else {
          stream = protocolHandler.openFile(startPath);
        }

      } catch (IOException e) {
        Log.e(TAG, "Unable to open " + launchFile, e);
        return null;
      }

      return createWebResourceResponse("text/html", handler.getEncoding(),
                handler.getStatusCode(), handler.getReasonPhrase(), handler.getResponseHeaders(), stream);
    }

    int periodIndex = path.lastIndexOf(".");
    if (periodIndex >= 0) {
      InputStream responseStream = new LollipopLazyInputStream(handler, uri);
      String mimeType = getMimeType(path, responseStream);
      return createWebResourceResponse(mimeType, handler.getEncoding(),
              handler.getStatusCode(), handler.getReasonPhrase(), handler.getResponseHeaders(), responseStream);
    }

    return null;
  }

  /**
   * Instead of reading files from the filesystem/assets, proxy through to the URL
   * and let an external server handle it.
   * @param uri
   * @param handler
   * @return
   */
  private WebResourceResponse handleProxyRequest(Uri uri, PathHandler handler) {
    try {
      String path = uri.getPath();
      URL url = new URL(uri.toString());
      HttpURLConnection conn = (HttpURLConnection) url.openConnection();
      conn.setRequestMethod("GET");
      conn.setReadTimeout(30 * 1000);
      conn.setConnectTimeout(30 * 1000);

      InputStream stream = conn.getInputStream();

      if (path.equals("/") || (!uri.getLastPathSegment().contains(".") && html5mode)) {
        return createWebResourceResponse("text/html", handler.getEncoding(),
                  handler.getStatusCode(), handler.getReasonPhrase(), handler.getResponseHeaders(), stream);
      }

      int periodIndex = path.lastIndexOf(".");
      if (periodIndex >= 0) {
        String ext = path.substring(path.lastIndexOf("."), path.length());

        // TODO: Conjure up a bit more subtlety than this
        if (ext.equals(".html")) {
        }

        String mimeType = getMimeType(path, stream);

        return createWebResourceResponse(mimeType, handler.getEncoding(),
              handler.getStatusCode(), handler.getReasonPhrase(), handler.getResponseHeaders(), stream);
      }

      return createWebResourceResponse("", handler.getEncoding(),
                handler.getStatusCode(), handler.getReasonPhrase(), handler.getResponseHeaders(), stream);

    } catch (SocketTimeoutException ex) {
      // bridge.handleAppUrlLoadError(ex);
    } catch (Exception ex) {
      // bridge.handleAppUrlLoadError(ex);
    }
    return null;
  }

  private String getMimeType(String path, InputStream stream) {
    String mimeType = null;
    try {
      mimeType = URLConnection.guessContentTypeFromName(path); // Does not recognize *.js
      if (mimeType != null && path.endsWith(".js") && mimeType.equals("image/x-icon")) {
        Log.d(IonicWebViewEngine.TAG, "We shouldn't be here");
      }
      if (mimeType == null) {
        if (path.endsWith(".js") || path.endsWith(".mjs")) {
          // Make sure JS files get the proper mimetype to support ES modules
          mimeType = "application/javascript";
        } else if (path.endsWith(".wasm")) {
          mimeType = "application/wasm";
        } else {
          mimeType = URLConnection.guessContentTypeFromStream(stream);
        }
      }
    } catch (Exception ex) {
      Log.e(TAG, "Unable to get mime type" + path, ex);
    }
    return mimeType;
  }

  /**
   * Registers a handler for the given <code>uri</code>. The <code>handler</code> will be invoked
   * every time the <code>shouldInterceptRequest</code> method of the instance is called with
   * a matching <code>uri</code>.
   *
   * @param uri     the uri to use the handler for. The scheme and authority (domain) will be matched
   *                exactly. The path may contain a '*' element which will match a single element of
   *                a path (so a handler registered for /a/* will be invoked for /a/b and /a/c.html
   *                but not for /a/b/b) or the '**' element which will match any number of path
   *                elements.
   * @param handler the handler to use for the uri.
   */
  void register(Uri uri, PathHandler handler) {
    synchronized (uriMatcher) {
      uriMatcher.addURI(uri.getScheme(), uri.getAuthority(), uri.getPath(), handler);
    }
  }

  /**
   * Hosts the application's assets on an http(s):// URL. Assets from the local path
   * <code>assetPath/...</code> will be available under
   * <code>http(s)://{uuid}.androidplatform.net/assets/...</code>.
   *
   * @param assetPath the local path in the application's asset folder which will be made
   *                  available by the server (for example "/www").
   */
  public void hostAssets(String assetPath) {
    hostAssets(authority, assetPath);
  }


  /**
   * Hosts the application's assets on an http(s):// URL. Assets from the local path
   * <code>assetPath/...</code> will be available under
   * <code>http(s)://{domain}/{virtualAssetPath}/...</code>.
   *
   * @param domain           custom domain on which the assets should be hosted (for example "example.com").
   * @param assetPath        the local path in the application's asset folder which will be made
   *                         available by the server (for example "/www").
   * @return prefixes under which the assets are hosted.
   */
  public void hostAssets(final String domain,
                                        final String assetPath) {
    this.isAsset = true;
    this.basePath = assetPath;

    createHostingDetails();
  }

  private void createHostingDetails() {
    final String assetPath = this.basePath;

    if (assetPath.indexOf('*') != -1) {
      throw new IllegalArgumentException("assetPath cannot contain the '*' character.");
    }

    PathHandler handler = new PathHandler() {
      @Override
      public InputStream handle(Uri url) {
        InputStream stream = null;
        String path = url.getPath();
        try {
          if (path.startsWith(contentStart)) {
            stream = protocolHandler.openContentUrl(url);
          } else if (path.startsWith(fileStart) || !isAsset) {
            if (!path.startsWith(fileStart)) {
              path = basePath + url.getPath();
            }
            stream = protocolHandler.openFile(path);
          } else {
            stream = protocolHandler.openAsset(assetPath + path);
          }
        } catch (IOException e) {
          Log.e(TAG, "Unable to open asset URL: " + url);
          return null;
        }

        return stream;
      }
    };

    registerUriForScheme(httpScheme, handler, authority);
    registerUriForScheme(httpsScheme, handler, authority);
    if (!customScheme.equals(httpScheme) && !customScheme.equals(httpsScheme)) {
      registerUriForScheme(customScheme, handler, authority);
    }

  }

  private void registerUriForScheme(String scheme, PathHandler handler, String authority) {
    Uri.Builder uriBuilder = new Uri.Builder();
    uriBuilder.scheme(scheme);
    uriBuilder.authority(authority);
    uriBuilder.path("");
    Uri uriPrefix = uriBuilder.build();

    register(Uri.withAppendedPath(uriPrefix, "/"), handler);
    register(Uri.withAppendedPath(uriPrefix, "**"), handler);
  }

  /**
   * Hosts the application's resources on an http(s):// URL. Resources
   * <code>http(s)://{uuid}.androidplatform.net/res/{resource_type}/{resource_name}</code>.
   *
   * @return prefixes under which the resources are hosted.
   */
  public AssetHostingDetails hostResources() {
    return hostResources(authority, "/res", true, true);
  }

  /**
   * Hosts the application's resources on an http(s):// URL. Resources
   * <code>http(s)://{uuid}.androidplatform.net/{virtualResourcesPath}/{resource_type}/{resource_name}</code>.
   *
   * @param virtualResourcesPath the path on the local server under which the resources
   *                             should be hosted.
   * @param enableHttp           whether to enable hosting using the http scheme.
   * @param enableHttps          whether to enable hosting using the https scheme.
   * @return prefixes under which the resources are hosted.
   */
  public AssetHostingDetails hostResources(final String virtualResourcesPath, boolean enableHttp,
                                           boolean enableHttps) {
    return hostResources(authority, virtualResourcesPath, enableHttp, enableHttps);
  }

  /**
   * Hosts the application's resources on an http(s):// URL. Resources
   * <code>http(s)://{domain}/{virtualResourcesPath}/{resource_type}/{resource_name}</code>.
   *
   * @param domain               custom domain on which the assets should be hosted (for example "example.com").
   *                             If untrusted content is to be loaded into the WebView it is advised to make
   *                             this random.
   * @param virtualResourcesPath the path on the local server under which the resources
   *                             should be hosted.
   * @param enableHttp           whether to enable hosting using the http scheme.
   * @param enableHttps          whether to enable hosting using the https scheme.
   * @return prefixes under which the resources are hosted.
   */
  public AssetHostingDetails hostResources(final String domain,
                                           final String virtualResourcesPath, boolean enableHttp,
                                           boolean enableHttps) {
    if (virtualResourcesPath.indexOf('*') != -1) {
      throw new IllegalArgumentException(
              "virtualResourcesPath cannot contain the '*' character.");
    }

    Uri.Builder uriBuilder = new Uri.Builder();
    uriBuilder.scheme(httpScheme);
    uriBuilder.authority(domain);
    uriBuilder.path(virtualResourcesPath);

    Uri httpPrefix = null;
    Uri httpsPrefix = null;

    PathHandler handler = new PathHandler() {
      @Override
      public InputStream handle(Uri url) {
        InputStream stream = protocolHandler.openResource(url);
        String mimeType = null;
        try {
          mimeType = URLConnection.guessContentTypeFromStream(stream);
        } catch (Exception ex) {
          Log.e(TAG, "Unable to get mime type" + url);
        }

        return stream;
      }
    };

    if (enableHttp) {
      httpPrefix = uriBuilder.build();
      register(Uri.withAppendedPath(httpPrefix, "**"), handler);
    }
    if (enableHttps) {
      uriBuilder.scheme(httpsScheme);
      httpsPrefix = uriBuilder.build();
      register(Uri.withAppendedPath(httpsPrefix, "**"), handler);
    }
    return new AssetHostingDetails(httpPrefix, httpsPrefix);
  }


  /**
   * Hosts the application's files on an http(s):// URL. Files from the basePath
   * <code>basePath/...</code> will be available under
   * <code>http(s)://{uuid}.androidplatform.net/...</code>.
   *
   * @param basePath the local path in the application's data folder which will be made
   *                  available by the server (for example "/www").
   */
  public void hostFiles(final String basePath) {
    this.isAsset = false;
    this.basePath = basePath;
    createHostingDetails();
  }

  /**
   * The KitKat WebView reads the InputStream on a separate threadpool. We can use that to
   * parallelize loading.
   */
  private static abstract class LazyInputStream extends InputStream {
    protected final PathHandler handler;
    private InputStream is = null;

    public LazyInputStream(PathHandler handler) {
      this.handler = handler;
    }

    private InputStream getInputStream() {
      if (is == null) {
        is = handle();
      }
      return is;
    }

    protected abstract InputStream handle();

    @Override
    public int available() throws IOException {
      InputStream is = getInputStream();
      return (is != null) ? is.available() : 0;
    }

    @Override
    public int read() throws IOException {
      InputStream is = getInputStream();
      return (is != null) ? is.read() : -1;
    }

    @Override
    public int read(byte b[]) throws IOException {
      InputStream is = getInputStream();
      return (is != null) ? is.read(b) : -1;
    }

    @Override
    public int read(byte b[], int off, int len) throws IOException {
      InputStream is = getInputStream();
      return (is != null) ? is.read(b, off, len) : -1;
    }

    @Override
    public long skip(long n) throws IOException {
      InputStream is = getInputStream();
      return (is != null) ? is.skip(n) : 0;
    }
  }

  // For L and above.
  private static class LollipopLazyInputStream extends LazyInputStream {
    private Uri uri;
    private InputStream is;

    public LollipopLazyInputStream(PathHandler handler, Uri uri) {
      super(handler);
      this.uri = uri;
    }

    @Override
    protected InputStream handle() {
      return handler.handle(uri);
    }
  }

  public String getBasePath(){
    return this.basePath;
  }
}

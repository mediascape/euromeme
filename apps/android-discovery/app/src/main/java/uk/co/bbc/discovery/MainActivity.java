package uk.co.bbc.discovery;

import android.app.ActionBar;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.nsd.NsdManager;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.GestureDetector;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

/**
 * Main application Activity, which contains an embedded WebView.
 */

public class MainActivity extends Activity
    implements GestureDetector.OnDoubleTapListener {

    private static final String TAG = "MainActivity";

    private static final String SERVICE_TYPE = "_mediascape._tcp.";

    private WebSocketServer mWebSocketService;
    private DiscoveryHandler mDiscoveryHandler;
    private GestureDetector mGestureDetector;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "onCreate");

        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        setupPreferences();
        setupGestureDetector();
        setupWebView();
        setupWebSocket();
        setupDiscovery();

        enterFullScreen(getWindow());
        openUrl();
    }

    /**
     * Initialises default settings the first time the application is run.
     */

    private void setupPreferences() {
        PreferenceManager.setDefaultValues(this, R.xml.settings, false);
    }

    /**
     * Create a GestureDetector, so we can show/hide the action bar on
     * double-tap.
     */

    private void setupGestureDetector() {
        mGestureDetector = new GestureDetector(
            this,
            new GestureDetector.SimpleOnGestureListener()
        );

        mGestureDetector.setOnDoubleTapListener(this);
    }

    /**
     * Creates and initialises the WebView.
     */

    private void setupWebView() {
        WebView webView = (WebView)findViewById(R.id.webview);

        // Enable remote debugging using desktop Chrome browser.
        WebView.setWebContentsDebuggingEnabled(true);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setDomStorageEnabled(true); // Enable local storage.

        webView.setWebChromeClient(new WebChromeClient() {
            public boolean onConsoleMessage(@NonNull ConsoleMessage message) {
                Log.d("WebView", message.message() + " -- "
                    + message.sourceId() + " (line "
                    + message.lineNumber() + ")");
                return true;
            }
        });
    }

    /**
     * Starts or restarts the WebSocket server using the user's preference
     * settings.
     */

    private void setupWebSocket() {
        if (mWebSocketService == null) {
            mWebSocketService = new WebSocketServer();
        }

        SharedPreferences sharedPreferences = getSharedPreferences();

        String portString = sharedPreferences.getString("preference_websocket_port", "");

        int port;

        try {
            port = Integer.parseInt(portString);
        }
        catch (NumberFormatException e) {
            mWebSocketService.stop();

            showAlertDialog(R.string.invalid_port);
            return;
        }

        boolean enabled = sharedPreferences.getBoolean("preference_enable_websocket", false);

        if (!enabled) {
            showToast(R.string.websockets_disabled);

            mWebSocketService.stop();
            return;
        }

        if (port != mWebSocketService.getPort()) {
            mWebSocketService.stop();
        }

        mWebSocketService.start(port);
    }

    /**
     * Starts network service discovery using mDNS and DNS-SD.
     */

    private void setupDiscovery() {
        Log.d(TAG, "setupDiscovery");

        NsdManager nsdManager = (NsdManager)getSystemService(Context.NSD_SERVICE);

        if (nsdManager == null) {
            showAlertDialog(R.string.nsd_manager_failed);
            return;
        }

        mDiscoveryHandler = new DiscoveryHandler(nsdManager, mWebSocketService);
        mDiscoveryHandler.start(SERVICE_TYPE);
    }

    /**
     * Opens the URL set in user preferences in the WebView.
     */

    private void openUrl() {
        SharedPreferences sharedPreferences = getSharedPreferences();

        String url = sharedPreferences.getString("preference_webview_url", "");

        if (!isValidUrl(url)) {
            showAlertDialog(R.string.invalid_url);
            return;
        }

        WebView webView = (WebView)findViewById(R.id.webview);
        webView.clearCache(true);
        webView.loadUrl(url);
    }

    /**
     * @return A flag indicating whether the given string contains a valid URL.
     */

    private boolean isValidUrl(String url) {
        return url.startsWith("http://") || url.startsWith("https://");
    }

    /**
     * Handle touch events (e.g., double-tap) via the GestureDetector, and also
     * send them to the WebView.
     */

    @Override
    public boolean dispatchTouchEvent(@NonNull MotionEvent event) {
        mGestureDetector.onTouchEvent(event);
        return super.dispatchTouchEvent(event);
    }

    /**
     * Shows the options menu.
     */

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu_main, menu);
        return true;
    }

    /**
     * Handles item selection from the options menu.
     */

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.settings:
                Log.d(TAG, "Menu item selected: Settings");
                Intent intent = new Intent(this, SettingsActivity.class);
                startActivity(intent);
                return true;

            case R.id.refresh:
                Log.d(TAG, "Menu item selected: Refresh");
                openUrl();
                return true;

            default:
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    public void onBackPressed() {
        Log.d(TAG, "onBackPressed");
        WebView webView = (WebView)findViewById(R.id.webview);
        webView.goBack();
    }

    @Override
    protected void onPause() {
        Log.d(TAG, "onPause");
        super.onPause();
    }

    /**
     * Restarts the WebSocket server if the preference settings have changed.
     */

    @Override
    protected void onResume() {
        Log.d(TAG, "onResume");
        super.onResume();

        setupWebSocket();
    }

    /**
     * Stops the WebSocket server and network service discovery.
     */

    @Override
    protected void onDestroy() {
        Log.d(TAG, "onDestroy");

        if (mWebSocketService != null) {
            mWebSocketService.stop();
        }

        if (mDiscoveryHandler != null) {
            mDiscoveryHandler.stop();
        }

        super.onDestroy();
    }

    /**
     * Shows a pop-up dialog with an 'OK' button.
     *
     * @param messageId String id of the message to show in the dialog.
     */

    private void showAlertDialog(int messageId) {
        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);

        alertDialogBuilder
            .setTitle(getString(R.string.app_name))
            .setMessage(getString(messageId))
            .setCancelable(false)
            .setPositiveButton(R.string.ok, new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface dialog, int id) {
                    dialog.cancel();
                }
            });

        AlertDialog alertDialog = alertDialogBuilder.create();
        alertDialog.show();
    }

    /**
     * Shows a pop-up message.
     *
     * @param messageId String id of the message to show.
     */

    private void showToast(int messageId) {
        Toast.makeText(this, getString(messageId), Toast.LENGTH_LONG).show();
    }

    // GestureDetector.OnDoubleTapListener methods

    @Override
    public boolean onSingleTapConfirmed(MotionEvent e) {
        return false;
    }

    /**
     * Double-tap event handler. Shows or hides the ActionBar.
     */

    @Override
    public boolean onDoubleTap(MotionEvent e) {
        Log.d(TAG, "onDoubleTap");

        toggleFullScreen();
        return true;

    }

    @Override
    public boolean onDoubleTapEvent(MotionEvent e) {
        return false;
    }

    /**
     * Toggles the application between full-screen and normal mode.
     */

    private void toggleFullScreen() {
        Window window = getWindow();

        if (isFullScreen(window)) {
            exitFullScreen(window);
        }
        else {
            enterFullScreen(window);
        }
    }

    /**
     * @return A flag indicating whether the given window is open full-screen.
     */

    boolean isFullScreen(Window window) {
        int flags = window.getAttributes().flags;

        return (flags & WindowManager.LayoutParams.FLAG_FULLSCREEN) != 0;
    }

    /**
     * Makes the given window full-screen and hides the ActionBar.
     */

    void enterFullScreen(Window window) {
        window.setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        showActionBar(false);
    }

    /**
     * Makes the given window not full-screen and shows the ActionBar.
     */

    void exitFullScreen(Window window) {
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);

        showActionBar(true);
    }

    /**
     * Shows or hides the ActionBar.
     *
     * @param show If <code>true</code>, shows the ActionBar, otherwise hides
     *   it.
     */

    private void showActionBar(boolean show) {
        ActionBar actionBar = getActionBar();

        if (actionBar == null) {
            return;
        }

        if (show) {
            actionBar.show();
        }
        else {
            actionBar.hide();
        }
    }

    /**
     * Returns the user's preference settings for this application.
     */

    private SharedPreferences getSharedPreferences() {
        return PreferenceManager.getDefaultSharedPreferences(this);
    }
}

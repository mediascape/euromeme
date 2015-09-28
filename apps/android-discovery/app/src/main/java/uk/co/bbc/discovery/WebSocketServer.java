package uk.co.bbc.discovery;

import android.util.Log;

import com.koushikdutta.async.callback.CompletedCallback;
import com.koushikdutta.async.http.WebSocket;
import com.koushikdutta.async.http.server.AsyncHttpServer;
import com.koushikdutta.async.http.server.AsyncHttpServerRequest;

import java.util.ArrayList;

/**
 * WebSocket server, to which messages announcing services found and lost are
 * sent.
 */

public class WebSocketServer {

    /**
     * Allows client code to be notified when events occur at the WebSocket
     * server.
     */

    public interface WebSocketListener {

        /**
         * Called when a new WebSocket client connection is established.
         *
         * @param webSocket The WebSocket client.
         */

        void onWebSocketConnected(WebSocket webSocket);
    }

    public static final String TAG = "WebSocketServer";

    private ArrayList<WebSocket> mSockets = new ArrayList<>();
    private AsyncHttpServer mServer;
    private WebSocketListener mListener;

    int mPort = -1;

    /**
     * Starts the WebSocket server.
     *
     * @param port The port to listen on for WebSocket connections.
     */

    public void start(int port) {
        Log.i(TAG, "start, port: " + port);

        if (mServer != null) {
            Log.e(TAG, "WebSocketServer already started");
            return;
        }

        mServer = new AsyncHttpServer();

        mServer.websocket("/discovery", new AsyncHttpServer.WebSocketRequestCallback() {

            /**
             * Notifies the listener when a new WebSocket connection is
             * established.
             */

            @Override
            public void onConnected(
                final WebSocket webSocket, AsyncHttpServerRequest request) {

                mSockets.add(webSocket);

                Log.i(TAG, "onConnected: " + webSocket.toString());

                if (mListener != null) {
                    mListener.onWebSocketConnected(webSocket);
                }

                webSocket.setClosedCallback(new CompletedCallback() {
                    @Override
                    public void onCompleted(Exception ex) {
                        mSockets.remove(webSocket);
                    }
                });
            }
        });

        mPort = port;

        Log.i(TAG, "Listening for WebSocket connections on port " + port);
        mServer.listen(port);
    }

    /**
     * Sends a message to all connected WebSocket clients.
     *
     * @param message The message data to send.
     */

    public void sendMessage(String message) {
        if (isStarted()) {
            Log.d(TAG, "Sending to " + mSockets.size() + " WebSocket clients: "
                + message);

            for (WebSocket socket : mSockets) {
                socket.send(message);
            }
        }
    }

    /**
     * Attaches a listener object, to be notified each time a new WebSocket
     * client connection is made.
     */

    public void setListener(WebSocketListener listener) {
        mListener = listener;
    }

    /**
     * Stops the WebSocket server.
     */

    public void stop() {
        Log.d(TAG, "stop");

        if (mServer != null) {
            mServer.stop();
            mSockets.clear();

            mServer = null;
            mPort = -1;
        }
    }

    /**
     * @return The port that the WebSocket server is listening on, or -1 if the
     *   server has not been started.
     */

    public int getPort() {
        return mServer != null ? mPort : -1;
    }

    /**
     * @return A flag indicating whether the WebSocket server is started.
     */

    public boolean isStarted() {
        return mServer != null;
    }
}

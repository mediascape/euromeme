package uk.co.bbc.discovery;

import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import com.koushikdutta.async.http.WebSocket;

import java.util.HashMap;
import java.util.ArrayDeque;

/**
 * Manages mDNS/DNS-SD network service discovery, sending a message to all
 * connected WebSocket clients each time a service is found or lost.
 */

public class DiscoveryHandler extends Handler {

    public static final int SERVICE_FOUND       = 0;
    public static final int SERVICE_LOST        = 1;
    public static final int SERVICE_RESOLVED    = 2;
    public static final int RESOLVE_FAILED      = 3;
    public static final int WEBSOCKET_CONNECTED = 4;

    private static final String TAG = "DiscoveryHandler";

    private HashMap<String, NsdServiceInfo> mServicesFound = new HashMap<>();
    private ArrayDeque<NsdServiceInfo> mServicesToResolve = new ArrayDeque<>();
    private boolean mResolveInProgress;
    private NsdManager mNsdManager;
    private NsdManager.DiscoveryListener mDiscoveryListener;
    private WebSocketServer mWebSocketService;

    public DiscoveryHandler(NsdManager nsdManager, WebSocketServer webSocketService) {
        super();

        mNsdManager = nsdManager;
        mWebSocketService = webSocketService;

        // Attach listener, to be notified when a new WebSocket connection is
        // established. Note that the listener is invoked on a thread managed
        // by the WebSocketServer, so we use SendMessage to pass information
        // to the handler's thread.

        mWebSocketService.setListener(new WebSocketServer.WebSocketListener() {
            @Override
            public void onWebSocketConnected(WebSocket webSocket) {
                Log.d(TAG, "onWebSocketConnected: " + webSocket);
                Message message = obtainMessage(WEBSOCKET_CONNECTED, webSocket);
                sendMessage(message);
            }
        });
    }

    /**
     * Starts network service discovery.
     *
     * Note: The listener methods are called on a worker thread managed by the
     * <code>NsdManager</code>, so we use <code>sendMessage</code> to pass
     * information to the handler's thread.
     *
     * @param serviceType The service type to discover, e.g.,
     *     "._mediascape._tcp".
     */

    public void start(String serviceType) {
        Log.d(TAG, "startServiceDiscovery");

        mDiscoveryListener = new NsdManager.DiscoveryListener() {
            @Override
            public void onDiscoveryStarted(String serviceType) {
                Log.d(TAG, "onDiscoveryStarted: " + serviceType);
            }

            @Override
            public void onServiceFound(NsdServiceInfo serviceInfo) {
                Log.d(TAG, "onServiceFound: " + serviceInfo);

                Message message = obtainMessage(SERVICE_FOUND, serviceInfo);
                sendMessage(message);
            }

            @Override
            public void onServiceLost(NsdServiceInfo serviceInfo) {
                Log.e(TAG, "onServiceLost: " + serviceInfo);

                Message message = obtainMessage(SERVICE_LOST, serviceInfo);
                sendMessage(message);
            }

            @Override
            public void onDiscoveryStopped(String serviceType) {
                Log.i(TAG, "onDiscoveryStopped: " + serviceType);
            }

            @Override
            public void onStartDiscoveryFailed(String serviceType, int errorCode) {
                Log.e(TAG, "onStartDiscoveryFailed, errorCode: " + errorCode);
            }

            @Override
            public void onStopDiscoveryFailed(String serviceType, int errorCode) {
                Log.e(TAG, "onStopDiscoveryFailed, errorCode: " + errorCode);
            }
        };

        mNsdManager.discoverServices(
            serviceType,
            NsdManager.PROTOCOL_DNS_SD,
            mDiscoveryListener
        );
    }

    /**
     * Stops network service discovery.
     */

    public void stop() {
        Log.d(TAG, "stopServiceDiscovery, mDiscoveryListener: " + mDiscoveryListener);

        if (mDiscoveryListener != null) {
            mNsdManager.stopServiceDiscovery(mDiscoveryListener);
            mDiscoveryListener = null;
        }
    }

    /**
     * Message handler function.
     */

    @Override
    public void handleMessage(Message message) {
        switch (message.what) {
            case SERVICE_FOUND:
                Log.d(TAG, "handleMessage SERVICE_FOUND, serviceInfo: " + message.obj);

                mServicesToResolve.add((NsdServiceInfo)message.obj);

                if (!mResolveInProgress) {
                    resolveNextQueuedService();
                }
                break;

            case SERVICE_RESOLVED:
                Log.d(TAG, "handleMessage SERVICE_RESOLVED");
                mResolveInProgress = false;

                addService((NsdServiceInfo)message.obj);
                notifyServiceFound((NsdServiceInfo)message.obj);

                resolveNextQueuedService();
                break;

            case RESOLVE_FAILED:
                Log.d(TAG, "handleMessage RESOLVE_FAILED");
                mResolveInProgress = false;
                break;

            case SERVICE_LOST:
                Log.d(TAG, "handleMessage SERVICE_LOST");

                removeService((NsdServiceInfo)message.obj);
                notifyServiceLost((NsdServiceInfo)message.obj);
                break;

            case WEBSOCKET_CONNECTED:
                // Send a message for each service found to each new WebSocket
                // connection
                notifyAllServicesFound((WebSocket)message.obj);
                break;

            default:
                Log.d(TAG, "Unknown message type: " + message.what);
                break;
        }
    }

    /**
     * Adds an entry to the list of discovered services.
     *
     * @param serviceInfo The service to add.
     */

    private void addService(NsdServiceInfo serviceInfo) {
        mServicesFound.put(serviceInfo.getServiceName(), serviceInfo);
    }

    /**
     * Removes an entry from the list of discovered services.
     *
     * @param serviceInfo The service to remove.
     */

    private void removeService(NsdServiceInfo serviceInfo) {
        mServicesFound.remove(serviceInfo.getServiceName());
    }

    /**
     * Sends a message to all WebSocket clients when a service is found.
     *
     * @param serviceInfo The service that has been found.
     */

    private void notifyServiceFound(NsdServiceInfo serviceInfo) {
        Log.d(TAG, "notifyServiceFound, threadId: " + android.os.Process.myTid());

        String json = DiscoveryMessage.serviceInfoToJson(serviceInfo, true);
        mWebSocketService.sendMessage(json);
    }

    /**
     * Sends a message to all WebSocket clients when a service is lost.
     *
     * @param serviceInfo The service that has been lost.
     */

    private void notifyServiceLost(NsdServiceInfo serviceInfo) {
        Log.d(TAG, "notifyServiceLost: " + android.os.Process.myTid());

        String json = DiscoveryMessage.serviceInfoToJson(serviceInfo, false);
        mWebSocketService.sendMessage(json);
    }

    /**
     * Sends a message to a WebSocket client for each service found.
     *
     * @param webSocket The WebSocket client to send messages to.
     */

    private void notifyAllServicesFound(WebSocket webSocket) {
        for (NsdServiceInfo serviceInfo : mServicesFound.values()) {
            String json = DiscoveryMessage.serviceInfoToJson(serviceInfo, true);

            Log.d(TAG, "notifyServiceFound: " + json);

            webSocket.send(json);
        }
    }

    /**
     * Resolves the next service in the queue.
     */

    private void resolveNextQueuedService() {
        Log.d(TAG, "resolveService, size: " + mServicesToResolve.size());

        NsdServiceInfo serviceInfo = mServicesToResolve.poll();

        if (serviceInfo != null) {
            mResolveInProgress = true;
            resolveService(serviceInfo);
        }
    }

    /**
     * Resolves a given service, to obtain its host and port.
     *
     * Note: The listener methods are called on a worker thread managed by the
     * <code>NsdManager</code>, so we use <code>sendMessage</code> to pass
     * information to the handler's thread.
     *
     * @param serviceInfo The service to resolve.
     */

    private void resolveService(NsdServiceInfo serviceInfo) {
        Log.d(TAG, "Resolving service: " + serviceInfo);

        mNsdManager.resolveService(serviceInfo, new NsdManager.ResolveListener() {
            @Override
            public void onResolveFailed(NsdServiceInfo serviceInfo, int errorCode) {
                Log.e(TAG, "Resolve failed:" + serviceInfo + " error: " + errorCode);

                sendEmptyMessage(RESOLVE_FAILED);
            }

            @Override
            public void onServiceResolved(NsdServiceInfo serviceInfo) {
                Log.d(TAG, "Service resolved: " + serviceInfo);

                Message message = obtainMessage(SERVICE_RESOLVED, serviceInfo);
                sendMessage(message);
            }
        });
    }
}

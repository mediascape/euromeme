package uk.co.bbc.discovery;

import android.net.nsd.NsdServiceInfo;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.InetAddress;

public class DiscoveryMessage {

    private static final String TAG = "DiscoveryMessage";

    /**
     * Translates a NsdServiceInfo object to a JSON string, for sending to
     * WebSocket clients.
     *
     * @param serviceInfo Contains information about the service.
     * @param found If <code>true</code>, the service has been found, otherwise
     *     it has been lost.
     * @return A String containing a JSON object.
     */

    public static String serviceInfoToJson(NsdServiceInfo serviceInfo, boolean found) {
        JSONObject json = new JSONObject();

        try {
            json.put("topic", "discovery");
            json.put("status", found ? "found" : "lost");
            json.put("name", serviceInfo.getServiceName());
            json.put("type", serviceInfo.getServiceType());

            InetAddress host = serviceInfo.getHost();

            if (host != null) {
                json.put("host", host.getHostAddress());
                json.put("port", serviceInfo.getPort());
            }
        }
        catch (JSONException e) {
            // Ignore
            Log.e(TAG, e.getMessage());
        }

        return json.toString();
    }
}

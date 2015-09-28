package uk.co.bbc.discovery;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.Preference;
import android.preference.PreferenceFragment;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.MenuItem;

/**
 * Activity for managing application settings.
 */

public class SettingsActivity extends Activity {

    private static final String TAG = "SettingsActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Display the fragment as the main content.
        getFragmentManager()
            .beginTransaction()
            .replace(android.R.id.content, new SettingsFragment())
            .commit();
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                // Return to MainActivity.
                onBackPressed();
                return true;

            default:
                return super.onOptionsItemSelected(item);
        }
    }

    public static class SettingsFragment extends PreferenceFragment
        implements SharedPreferences.OnSharedPreferenceChangeListener {

        @Override
        public void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);

            // Load the preferences from an XML resource.
            addPreferencesFromResource(R.xml.settings);

            SharedPreferences sharedPreferences = getSharedPreferences();
            sharedPreferences.registerOnSharedPreferenceChangeListener(this);

            // Show the current values in the settings screen.
            setPreferenceSummary(
                "preference_webview_url",
                R.string.pref_description_webview_url
            );

            setPreferenceSummary(
                "preference_websocket_port",
                R.string.pref_description_websocket_port
            );
        }

        @Override
        public void onSharedPreferenceChanged(
            SharedPreferences sharedPreferences, String key) {

            Log.d(TAG, "onSharedPreferenceChanged: " + key);

            if (key.equals("preference_webview_url")) {
                setPreferenceSummary(
                    key,
                    R.string.pref_description_webview_url
                );
            }
            else if (key.equals("preference_websocket_port")) {
                setPreferenceSummary(
                    key,
                    R.string.pref_description_websocket_port
                );
            }
        }

        @Override
        public void onPause() {
            super.onPause();

            Log.d(TAG, "onPause");

            SharedPreferences preferences = getSharedPreferences();
            preferences.unregisterOnSharedPreferenceChangeListener(this);
        }

        /**
         * Show the current preference value in the Settings screen, or a
         * default message if the preference value has not been set.
         *
         * @param key Identifies the preference value.
         * @param defaultStringId String id of a message to be shown if the
         *     preference value has not been set.
         */

        private void setPreferenceSummary(String key, int defaultStringId) {
            SharedPreferences sharedPreferences = getSharedPreferences();

            Preference preference = findPreference(key);

            if (preference == null) {
                return;
            }

            String value = sharedPreferences.getString(key, "");

            Log.d(TAG, "key: " + key + ", value: \"" + value + "\"");

            if (value.isEmpty()) {
                value = getString(defaultStringId);
            }

            preference.setSummary(value);
        }

        /**
         * Returns the user's preference settings for this application.
         */

        private SharedPreferences getSharedPreferences() {
            return PreferenceManager.getDefaultSharedPreferences(getActivity());
        }
    }
}

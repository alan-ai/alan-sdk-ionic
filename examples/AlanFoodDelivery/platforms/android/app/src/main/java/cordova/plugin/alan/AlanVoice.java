package cordova.plugin.alan;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.Activity;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;

import com.alan.alansdk.Alan;
import com.alan.alansdk.AlanState;
import com.alan.alansdk.AlanCallback;
import com.alan.alansdk.AlanConfig;
import com.alan.alansdk.alanbase.ConnectionState;
import com.alan.alansdk.button.AlanButton;
import com.alan.alansdk.events.EventCommand;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PermissionHelper;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class AlanVoice extends CordovaPlugin {

    private AlanButton alanButton;
    private CallbackContext callbackContext;

    private final static int REQUEST_PERMISSIONS = 1001;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        if (this.callbackContext == null) {
            this.callbackContext = callbackContext;
        }

        switch (action) {
            case "addButton":
                addButton(args);
                return true;
            case "removeButton":
                this.callbackContext = null;
                removeButton();
                return true;
            case "showButton":
                showAlanButton();
                return true;
            case "hideButton":
                hideAlanButton();
                return true;
            case "callProjectApi":
                callProjectApi(args);
                return true;
            case "setVisualState":
                setVisualState(args);
                return true;
            case "playText":
                playText(args);
                return true;
            case "playCommand":
                playData(args);
                return true;
            case "activate":
                turnOn(callbackContext);
                return true;
            case "deactivate":
                turnOff();
                return true;
        }
        return false;
    }


    /**
     * Checks for needed permissions for API =< 23.
     */
    @TargetApi(23)
    private boolean checkPermissions() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            boolean recordAudioPermission = PermissionHelper.hasPermission(this, Manifest.permission.RECORD_AUDIO);

            if (!recordAudioPermission) {
                PermissionHelper.requestPermissions(this, REQUEST_PERMISSIONS, new String[]{Manifest.permission.RECORD_AUDIO});
                return false;
            } else {
                return true;
            }
        } else {
            // Call Smart Capture if version is less that API 23.
            return true;
        }
    }

    private void callProjectApi(JSONArray args) {
        if (alanButton == null) {
            return;
        }
        if (args.length() < 2) {
            return;
        }

        String command = null;
        JSONObject jsonArgs = null;
        try {
            jsonArgs = args.getJSONObject(1);
            command = args.getString(0);
        } catch (JSONException e) {
            Log.e("AlanResponse", e.getMessage());
            return;
        }

        alanButton.callProjectApi(command, jsonArgs.toString(), (methodName, response, error) -> {
            if (error != null && !error.isEmpty()) {
                Log.i("AlanResponse", methodName + " failed with: " + error);
                sendPluginResult(new PluginResult(PluginResult.Status.ERROR, error));
            } else {
                Log.i("AlanResponse", methodName + " response is: " + response);
                sendPluginResult(new PluginResult(PluginResult.Status.OK, response));
            }
        });
    }

    private void setVisualState(JSONArray args) {
        if (alanButton == null) {
            return;
        }
        if (args.length() < 1) {
            return;
        }

        JSONObject jsonArgs = null;
        try {
            jsonArgs = args.getJSONObject(0);
        } catch (JSONException e) {
            Log.e("AlanResponse", e.getMessage());
            return;
        }

        alanButton.setVisualState(jsonArgs.toString());
        sendPluginResult(new PluginResult(PluginResult.Status.OK));
    }

    private void playText(JSONArray args) {
        if (alanButton == null) {
            return;
        }
        if (args.length() < 1) {
            return;
        }

        String text = null;
        try {
            text = args.getString(0);
        } catch (JSONException e) {
            Log.e("AlanResponse", e.getMessage());
            return;
        }

        alanButton.playText(text, (methodName, response, error) -> {
            if (error != null && !error.isEmpty()) {
                Log.i("AlanResponse", methodName + " failed with: " + error);
                sendPluginResult(new PluginResult(PluginResult.Status.ERROR, error));
            } else {
                Log.i("AlanResponse", methodName + " response is: " + response);
                sendPluginResult(new PluginResult(PluginResult.Status.OK, response));
            }
        });
    }

    private void playData(JSONArray args) {
        if (alanButton == null) {
            return;
        }
        if (args.length() < 1) {
            return;
        }


        JSONObject data = null;
        try {
            data = args.getJSONObject(0);
        } catch (JSONException e) {
            Log.e("AlanResponse", e.getMessage());
            return;
        }

        alanButton.playCommand(data.toString(), (methodName, response, error) -> {
            if (error != null && !error.isEmpty()) {
                Log.i("AlanResponse", methodName + " failed with: " + error);
                sendPluginResult(new PluginResult(PluginResult.Status.ERROR, error));
            } else {
                Log.i("AlanResponse", methodName + " response is: " + response);
                sendPluginResult(new PluginResult(PluginResult.Status.OK, response));
            }
        });
    }

    private void turnOn(CallbackContext turnOnCallback) {
        if (alanButton == null) {
            return;
        }
        cordova.getThreadPool().submit(
                () -> {
                    alanButton.activate();
                    try {
                        Thread.sleep(300);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    sendPluginResult(turnOnCallback, new PluginResult(PluginResult.Status.OK));
                }
        );
    }

    private void turnOff() {
        if (alanButton == null) {
            return;
        }


        alanButton.deactivate();
        sendPluginResult(new PluginResult(PluginResult.Status.OK));
    }

    private void addButton(JSONArray args) {
        Alan.PLATFORM_SUFFIX = "ionic";
        Alan.PLATFORM_VERSION_SUFFIX = Version.NUMBER;

        if (alanButton == null) {
            createButton();
        }

        String projectId = "";
        int left = -1;
        int right = -1;
        int bottom = -1;
        int zindex = -1;
        int top = -1;

        try {
            projectId = args.getString(0);

            if (args.length() > 1) {
                left = extractValue(args.getString(1), false);
            }

            if (args.length() > 2) {
                right = extractValue(args.getString(2), false);
            }

            if (args.length() > 3) {
                bottom = extractValue(args.getString(3), true);
            }

            if (args.length() > 4) {
                zindex = extractValue(args.getString(4), true);
            }

            if (args.length() > 5) {
                top = extractValue(args.getString(5), true);
            }

        } catch (JSONException e) {
            Log.e("AlanResponse", e.getMessage());
            return;
        }

        AlanConfig config = AlanConfig.builder()
                .setProjectId(projectId)
                .build();
        alanButton.initWithConfig(config);
        alanButton.getSDK().registerCallback(new IonicListener());

        if (zindex != -1) {
            alanButton.setElevation(zindex);
        }

        cordova.getActivity().runOnUiThread(new InitRunnable(
            this.cordova.getActivity().getResources().getDisplayMetrics().widthPixels,
                left,
                right,
                bottom,
                top
        ));

    }

    private class InitRunnable implements Runnable {


        private int screenWidth;
        private int left;
        private int right;
        private int bottom;
        private int top;

        public InitRunnable(int screenWidth,
                            int left,
                            int right,
                            int bottom,
                            int top) {
            this.screenWidth = screenWidth;
            this.left = left;
            this.right = right;
            this.bottom = bottom;
            this.top = top;
        }

        @Override
        public void run() {

            if (left != -1) {

                alanButton.stopStick = true;
                alanButton.button.setX(left);
            }

            if (right != -1) {

                int buttonWidth = cordova.getContext().getResources().getDimensionPixelOffset(com.alan.alansdk.R.dimen.alan_button_size);
                alanButton.stopStick = true;
                alanButton.button.setX(screenWidth - right - buttonWidth);
            }

            if (left == -1 && right == -1) {
                alanButton.setButtonAlign(AlanButton.BUTTON_RIGHT);
            }

            if (bottom != -1) {
                alanButton.setTranslationY(-bottom);
            }

            if (top != -1) {
                alanButton.setY(top);
            }

            alanButton.showButton();
            alanButton.invalidate();
            alanButton.requestLayout();
        }
    }

    private int extractValue(String arg, boolean height) {
        if (arg == null || arg.isEmpty() || arg.equals("null")) {
            return -1;
        }

        int result;
        if (arg.contains("px")) {
            result = Integer.valueOf(arg.replaceAll("[^\\d.]", ""));
        } else if (arg.contains("%")) {
            int screenSize;
            if (height) {
                screenSize = this.cordova.getActivity().getResources().getDisplayMetrics().heightPixels;
            } else {
                screenSize = this.cordova.getActivity().getResources().getDisplayMetrics().widthPixels;
            }
            double q = Double.valueOf(arg.replaceAll("[^\\d.]", "")) / 100;
            result = (int) Math.round(Math.floor(q * screenSize));
        } else {
            result = Integer.valueOf(arg.replaceAll("[^\\d.]", ""));
        }
        return result;
    }

    private AlanButton createButton() {
        Activity cordovaActivity = this.cordova.getActivity();

        FrameLayout rootView = cordovaActivity.findViewById(android.R.id.content);

        alanButton = new AlanButton(cordovaActivity, null);
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.WRAP_CONTENT);
        params.gravity = Gravity.BOTTOM | Gravity.END;
        alanButton.setLayoutParams(params);
        alanButton.setVisibility(View.GONE);
        alanButton.setHintPanelVisibility(true);

        cordova.getActivity().runOnUiThread(() -> {
            rootView.addView(alanButton);
        });

        return alanButton;
    }

    private boolean removeButton() {
        Activity cordovaActivity = this.cordova.getActivity();

        FrameLayout rootView = cordovaActivity.findViewById(android.R.id.content);

        alanButton.getSDK().clearCallbacks();
        alanButton.getSDK().stop();
        cordova.getActivity().runOnUiThread(() -> {
            alanButton.disableButton();
            rootView.removeView(alanButton);
            alanButton = null;
        });

        return true;
    }

    private void showAlanButton() {
        if (alanButton != null) {
            cordova.getActivity().runOnUiThread(() -> alanButton.showButton());
        }
    }

    private void hideAlanButton() {
        if (alanButton != null) {
            cordova.getActivity().runOnUiThread(() -> alanButton.hideButton());
        }
    }

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);

        createButton();
    }

    class IonicListener extends AlanCallback {

        @Override
        public void onCommandReceived(EventCommand eventCommand) {
            super.onCommandReceived(eventCommand);
            AlanCallbackWrapper<JSONObject> command = null;
            if (eventCommand.getData().has("data")) {
                try {
                    command = new AlanCallbackWrapper<>(AlanCallbackWrapper.TYPE_COMMAND,
                            eventCommand.getData().getJSONObject("data"));
                } catch (JSONException e) {
                    Log.e("AlanVoice", e.getMessage());
                }
            } else {
                command = new AlanCallbackWrapper<>(AlanCallbackWrapper.TYPE_COMMAND,
                        eventCommand.getData());
            }
            if (command != null) {
                sendPluginResult(new PluginResult(PluginResult.Status.OK, command.toJSON()));
            }
        }

        @Override
        public void onAlanStateChanged(@NonNull AlanState alanState) {
            super.onAlanStateChanged(alanState);
            switch (alanState) {
                case ONLINE:
                    sendConnectionStateCallback("connected");
                    break;
                case OFFLINE:
                case UNKNOWN:
                        sendConnectionStateCallback("disconnected");
                        break;
                    default:
                        ;
            }

        }
    }

    private void sendConnectionStateCallback(String state) {
        AlanCallbackWrapper<String> connectionStateArg =
                new AlanCallbackWrapper<>(AlanCallbackWrapper.TYPE_CONNECTION_STATE, state);
        sendPluginResult(new PluginResult(PluginResult.Status.OK, connectionStateArg.toJSON()));
    }

    private void sendPluginResult(PluginResult result) {
        sendPluginResult(callbackContext, result);
    }

    private void sendPluginResult(CallbackContext callback, PluginResult result) {
        if (callback != null && !callback.isFinished()) {
            result.setKeepCallback(true);
            callback.sendPluginResult(result);
        }
    }
}

package cordova.plugin.alan;

import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;

public class AlanCallbackWrapper<T> implements Serializable {

  public static final String TYPE_CONNECTION_STATE = "connectionState";
  public static final String TYPE_COMMAND = "command";

  public AlanCallbackWrapper(String type, T data) {
      this.type = type;
      this.data = data;
  }

  @SerializedName("type")
  private String type;
  @SerializedName("data")
  private T data;

  public JSONObject toJSON() {
    JSONObject json = new JSONObject();

    try {
      json.put("type", type);
      json.put("data", data);
    } catch (Exception e) {
        Log.e("AlanCallback", e.getMessage());
    }

    return json;
  }

  public String toRawJson() {
    Gson gson = new Gson();
    return gson.toJson(this);
  }
}

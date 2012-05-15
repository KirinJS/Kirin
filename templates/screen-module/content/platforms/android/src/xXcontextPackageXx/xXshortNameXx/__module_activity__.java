package xXcontextPackageXx.xXshortNameXx;

import org.json.JSONObject;

import xXcontextPackageXx.xXshortNameXx.android.__screen_interface__;
import xXcontextPackageXx.xXshortNameXx.shared.__module_interface__;
import android.os.Bundle;
import android.widget.TextView;

import com.futureplatforms.kirin.activities.KirinActivity;

/**
 * This class is the presentation layer driven by the module __module_name__.js.
 * 
 * @author __USER__
 * @author __CompanyName__
 */
public class __module_activity__ extends KirinActivity implements __screen_interface__ {
    
	/**
	 * __module_interface__ represents the __module_name__.js module.
	 */
	private __module_interface__ mKirinModule;

	/** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
         // This loads at the XML file in res/layout/activity___short_activity_name__.xml
        setContentView(R.layout.acitivity___screen_layout__);
        // This constructs an object with which you can call methods on Javascript.
        mKirinModule = bindScreen("__module_name__", __module_interface__.class);
        
        // set up some UI shizzle.
        ((TextView) findViewById(R.id.text_view)).setText("__module_activity__ and __module_name__");
    }

	@Override
	public void setDataForScreen(JSONObject data) {
		// Dummy method for illustration
	}
}

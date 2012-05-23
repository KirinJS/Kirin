package xXcontextPackageXx.xXshortNameXx;

import xXcontextPackageXx.xXshortNameXx.android.__ScreenProtocol__;
import xXcontextPackageXx.xXshortNameXx.shared.__ModuleProtocol__;
import xXcontextPackageXx.xXshortNameXx.shared.requests.__RequestProtocol__;

import android.os.Bundle;
import android.widget.TextView;

import com.futureplatforms.kirin.activities.KirinActivity;

/**
 * This class is the presentation layer driven by the module __module_name__.js.
 * 
 * @author __USER__
 * @author __CompanyName__
 */
public class __module_activity__ extends KirinActivity implements __ScreenProtocol__ {
    
	/**
	 * __ModuleProtocol__ represents the __module_name__.js module.
	 */
	private __ModuleProtocol__ mScreenModule;

	/** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
         // This loads at the XML file in res/layout/activity___screen_layout__.xml
        setContentView(R.layout.activity___screen_layout__);
        // This constructs an object with which you can call methods on Javascript.
        mScreenModule = bindScreen("__module_name__", __ModuleProtocol__.class);
        
        // set up some UI shizzle.
        ((TextView) findViewById(R.id.text_view)).setText("__module_activity__ and __module_name__");
    }
    
    @Override
    public void setDataForScreen(__RequestProtocol__ data) {
        // TODO Auto-generated method stub		
    }

}

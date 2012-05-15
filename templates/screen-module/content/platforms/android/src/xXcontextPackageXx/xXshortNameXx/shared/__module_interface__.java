package xXcontextPackageXx.xXshortNameXx.shared;


/**
 * This interface is for calling into Javascript from Android.
 * 
 * You construct it with 
 * __module_interface__ mModule = <code>bindScreen("__module_name__", __module_interface__.class);</code>,
 * and then use the methods you declare in here.
 * 
 * @author __USER__
 * @author __CompanyName__
 */
public interface __module_interface__ {

	void setItemName(int id, String name);
	
	void onItemTapped(int id);

}

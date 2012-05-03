package xXcontextPackageXx.xXshortNameXx.android;

import org.json.JSONArray;


public interface I__class_prefix__MasterScreen {
	
	void setTableContents(JSONArray tableRows);
	
	void insertRowWithContents(int rowNumber, String rowContents);

	void displayDetailScreenForRowAndContents(int row, String contents);

}

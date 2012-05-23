package xXcontextPackageXx.xXshortNameXx;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;

import xXcontextPackageXx.xXshortNameXx.android.__native_screen__;
import xXcontextPackageXx.xXshortNameXx.shared.__native_screen_module__;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Toast;

import com.futureplatforms.kirin.activities.KirinActivity;

public class __project_name__Activity extends KirinActivity implements __native_screen__ {
    
	private __native_screen_module__ mScreenModule;
	private ListView mListView;
	private List<String> mTableRows;

	/** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_master_list);
        setTitle(R.string.app_name);
        mScreenModule = bindScreen("xXjavascript_screen_moduleXx", __native_screen_module__.class);
        
        mListView = (ListView) findViewById(R.id.list_view);
        
        mListView.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> adapter, View row, int index, long id) {
				mScreenModule.itemSelected(index);
			}
		});
        
        findViewById(R.id.button).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				mScreenModule.addNewItem();
			}
		});
    }

	@Override
	@SuppressWarnings("unchecked")
	public void insertRowWithContents(int rowNumber, String rowContents) {
		mTableRows.add(rowNumber, rowContents);
		((ArrayAdapter<String>)mListView.getAdapter()).notifyDataSetChanged();
	}

	@Override
	public void displayDetailScreenForRowAndContents(int row, String contents) {
		Toast.makeText(getApplicationContext(), contents, Toast.LENGTH_LONG).show();
	}

	@Override
	public void setTableContents(JSONArray tableRows) {
		mTableRows = new ArrayList<String>();
		for (int i=0, max=tableRows.length(); i<max; i++) {
			mTableRows.add(tableRows.optString(i));
		}
		
		mListView.setAdapter(new ArrayAdapter<String>(getApplicationContext(), R.layout.item_master_list, R.id.text_view, mTableRows));
	}
}
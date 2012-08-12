/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


package com.futureplatforms.kirin.demo.hellokirin.activity;

import org.json.JSONArray;
import org.json.JSONObject;

import android.os.Bundle;
import android.view.View;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.futureplatforms.kirin.activities.KirinListActivity;
import com.futureplatforms.kirin.demo.hellokirin.R;
import com.futureplatforms.kirin.generated.demo.hellokirin.IDumbListScreen;
import com.futureplatforms.kirin.generated.demo.hellokirin.IDumbListScreenModule;
import com.futureplatforms.kirin.ui.JSListAdapter;
import com.futureplatforms.kirin.ui.KirinRowRenderer;

public class DumbListActivity extends KirinListActivity implements IDumbListScreen {

	private IDumbListScreenModule mKirinModule;
	
    protected KirinRowRenderer<JSONObject> mItemRenderer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        mKirinModule = bindScreen("DumbListScreenModule", IDumbListScreenModule.class);
        // we won't worry about arguments to this activity, though we know
        // how to do it.
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dumb_list_activity);

        mItemRenderer = new ObjectItemRenderer("key");
        setTitle("Alphabet");
    }

    public void populateList(JSONArray jsonArray) {
        setListAdapter(new JSListAdapter(this, jsonArray, R.layout.dumb_row, mItemRenderer));
    }

    public void showToast(String key) {
        Toast.makeText(this, "You clicked on: " + key, Toast.LENGTH_SHORT).show();
    }

    /************************************************
     * Stuff that could easily be genericized.
     ***********************************************/

    @Override
    protected void onListItemClick(ListView l, View v, int position, long id) {
        super.onListItemClick(l, v, position, id);
        mItemRenderer.onItemClicked(v, position, (JSONObject) getListAdapter().getItem(position));
    }

    public class ObjectItemRenderer implements KirinRowRenderer<JSONObject> {

        public class ViewHolder {
            TextView mText;
        }

        private final String mPropertyName;
        
        public ObjectItemRenderer(String propertyName) {
        	mPropertyName = propertyName;
        }
        
        @Override
        public void configureView(View view) {
            ViewHolder vh = new ViewHolder();
            vh.mText = (TextView) view.findViewById(R.id.text);
            view.setTag(vh);
        }

        @Override
        public void onItemClicked(View view, int index, JSONObject item) {
        	mKirinModule.onListItemClick(index, item.optString(mPropertyName));
        }

        @Override
        public void renderItem(View view, JSONObject item) {
            ((ViewHolder) view.getTag()).mText.setText(item.optString(mPropertyName));
        }

    }

}

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


/**
 * 
 */
package com.futureplatforms.kirin.ui;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;

public class JSListAdapter extends BaseAdapter {

    private final JSONArray mArray;
    private final KirinRowRenderer<JSONObject> mItemRenderer;

    private final int mRowLayout;
    
    private final LayoutInflater mLayoutInflater;
    
    public JSListAdapter(Context context, JSONArray array, int rowLayout, KirinRowRenderer<JSONObject> renderer) {
        mItemRenderer = renderer;
        mArray = array;
        mRowLayout = rowLayout;
        mLayoutInflater = LayoutInflater.from(context);
    }

    @Override
    public int getCount() {
        return mArray.length();
    }

    @Override
    public Object getItem(int position) {
        try {
            return mArray.get(position);
        } catch (JSONException e) {
            throw new IllegalStateException(e);
        }
//        throw new IllegalArgumentException("position " + position + " in a list of size " + mArray.length());
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View view, ViewGroup parent) {
        JSONObject item = (JSONObject) getItem(position);
        if (view == null) {
            view = mLayoutInflater.inflate(mRowLayout, parent, false);
            mItemRenderer.configureView(view);
        }
        mItemRenderer.renderItem(view, item);
        return view;
    }

}
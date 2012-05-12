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

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.TypedValue;
import android.widget.Button;
import android.widget.TextView;

import com.futureplatforms.kirin.application.IKirinApplication;
import com.futureplatforms.kirin.demo.hellokirin.R;
import com.futureplatforms.kirin.helpers.KirinScreenHelper;
import com.futureplatforms.kirin.ui.JSOnClickListener;

public class DumbButtonActivity extends Activity {

    private Button mButton;
    private TextView mLabel;

    private KirinScreenHelper mKirinHelper;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dumb_button_activity);

        mKirinHelper = ((IKirinApplication) getApplication()).getKirin().bindScreen("DumbButtonScreen", this);
        mKirinHelper.onLoad();
        mButton = (Button) findViewById(R.id.dumb_button);
        mButton.setOnClickListener(new JSOnClickListener(mKirinHelper, "onDumbButtonClick"));

        findViewById(R.id.fp_logo_imageview).setOnClickListener(new JSOnClickListener(mKirinHelper, "onNextScreenButtonClick"));

        mLabel = (TextView) findViewById(R.id.dumb_label);
        setTitle("How big?");
    }

    @Override
    protected void onResume() {
        super.onResume();
        mKirinHelper.jsMethod("onResume");
    }
    
    public void updateLabelSizeAndText(int size, String text) {
        mLabel.setTextSize(TypedValue.COMPLEX_UNIT_SP, size);
        mLabel.setText(text);
        mLabel.invalidate();
    }

    public void changeScreen(String arg) {
        Intent intent = new Intent(this, DumbListActivity.class);
        intent.putExtra("string", arg);
        startActivity(intent);
    }
}
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


package com.futureplatforms.kirin.ui;

import android.content.DialogInterface;
import android.view.View;
import android.view.View.OnClickListener;

import com.futureplatforms.kirin.helpers.IKirinHelper;

public class JSOnClickListener implements OnClickListener, android.content.DialogInterface.OnClickListener {

    private final IKirinHelper mKirinHelper;
    private final Object[] mArgs;
    private String mMethod;
    
    public JSOnClickListener(IKirinHelper js, String method, Object... args) {
        this.mKirinHelper = js;
        this.mArgs = args;
        this.mMethod = method;
    }
    
    @Override
    public void onClick(View v) {
        mKirinHelper.jsMethod(mMethod, mArgs);
    }

    @Override
    public void onClick(DialogInterface dialog, int which) {
    	mKirinHelper.jsMethod(mMethod, mArgs);
    }

}

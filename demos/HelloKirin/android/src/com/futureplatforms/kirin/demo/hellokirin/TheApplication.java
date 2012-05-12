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


package com.futureplatforms.kirin.demo.hellokirin;

import android.app.Application;

import com.futureplatforms.kirin.Kirin;
import com.futureplatforms.kirin.application.IKirinApplication;

public class TheApplication extends Application implements IKirinApplication {

	private Kirin mKirin;

	@Override
	public void onCreate() {
		super.onCreate();

		mKirin = Kirin.create(this.getApplicationContext());
	}

	@Override
	public Kirin getKirin() {
		return mKirin;
	}

}

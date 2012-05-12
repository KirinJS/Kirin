package com.futureplatforms.kirin.test.dummies;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.futureplatforms.kirin.internal.core.IJsContext;

public class DummyJsContext implements IJsContext{

	public Map<String, List<String>> mMethodNames = new HashMap<String, List<String>>();
	
	public List<String> mJsCalls = new ArrayList<String>();
	
	public String mLastCall;

	@Override
	public void js(String string) {
		mLastCall = string;
		mJsCalls.add(string);
	}
	
	public void reset() {
		mLastCall = null;
		mJsCalls.clear();
		mMethodNames.clear();
	}

}

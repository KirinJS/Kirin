package com.futureplatforms.kirin.helpers;

import java.io.IOException;
import java.io.StringWriter;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

import android.text.TextUtils;

import com.futureplatforms.kirin.internal.attic.ProxyGenerator;
import com.futureplatforms.kirin.internal.core.IJsContext;
import com.futureplatforms.kirin.internal.core.IKirinState;
import com.futureplatforms.kirin.internal.core.INativeContext;
import com.futureplatforms.kirin.internal.core.JsCommands;
import com.futureplatforms.kirin.state.IKirinDropbox;
import com.futureplatforms.kirin.state.IKirinFileSystem;

public class KirinHelper implements IKirinHelper {

	private final String mModuleName;
	private final Object mNativeObject;
	private final INativeContext mNativeContext;
	private final IJsContext mJsContext;
	private final IKirinState mAppState;
	private final ProxyGenerator mProxyGenerator;
	
	public KirinHelper(Object nativeObject, String moduleName, IJsContext jsContext, INativeContext nativeContext, IKirinState appState) {
		super();
		mNativeObject = nativeObject;
		mModuleName = moduleName;
		
		mNativeContext = nativeContext;
		mJsContext = jsContext;
		
		mAppState = appState;
		
		mProxyGenerator = new ProxyGenerator(this);
	}
	
	@Override
	public void jsMethod(String methodName, Object... args) {
		if (args == null || args.length == 0) {			
			mJsContext.js(MessageFormat.format(JsCommands.EXECUTE_METHOD_JS, getModuleName(), methodName));
		} else {
			String argsList = prepareArgs(args);
			mJsContext.js(MessageFormat.format(JsCommands.EXECUTE_METHOD_JS_WITH_ARGS, getModuleName(), 
					methodName, argsList));
		}
	}

	private String prepareArgs(Object... args) {
		for (int i=0, length=args.length; i<length; i++) {
			Object arg = args[i];
			if (arg instanceof String) {
				arg = "'" + escapeJavaScript((String)arg) + "'";
			} else if (arg instanceof Integer) {
				arg = Integer.toString((Integer) arg);
			} else if (arg instanceof Long) {
				arg = Long.toString((Long) arg);
			} else if (arg instanceof Map<?,?>) {
				arg = new JSONObject((Map<?,?>) arg);
			} else if (arg instanceof Collection) {
				arg = new JSONArray((Collection<?>) arg);
			}
			args[i] = arg;
		}
		
		return TextUtils.join(",", args);
	}

	
	@Override
	public void jsCallback(String callbackId, Object... args) {
		if (args == null || args.length == 0) {			
			mJsContext.js(MessageFormat.format(JsCommands.EXECUTE_CALLBACK_JS, callbackId));
		} else {
			String argsList = prepareArgs(args);
			mJsContext.js(MessageFormat.format(JsCommands.EXECUTE_CALLBACK_WITH_ARGS_JS, callbackId, argsList));
		}
	}

	@Override
	public void jsCallback(JSONObject config, String callbackName,
			Object... args) {
		String callbackId = config.optString(callbackName);
		if (callbackId != null) {
			this.jsCallback(callbackId, (Object[]) args);
		}
	}

	@Override
	public void cleanupCallback(String... callbackIds) {
		if (callbackIds != null && callbackIds.length > 0) {
			cleanupCallbacks(TextUtils.join("','", callbackIds));
		}
	}

	@Override
	public void cleanupCallback(JSONObject config, String... callbackNames) {
		List<String> callbackIds = new ArrayList<String>();
		for (String callbackName : callbackNames) {
			Object callbackId = config.opt(callbackName);
			if (callbackId != null && callbackId instanceof String) {
				callbackIds.add((String) callbackId);
			}
		}
		if (!callbackIds.isEmpty()) {
			cleanupCallbacks(TextUtils.join("','",callbackIds));
		}
	}
	
	private void cleanupCallbacks(String argsList) {
		mJsContext.js(MessageFormat.format(JsCommands.DELETE_CALLBACK_JS, argsList));
	}

	@Override
	public IKirinDropbox getDropbox() {
		return getAppState().getDropbox();
	}

	@Override
	public void onLoad() {
		// let the object be available for calling from Javascript.
		mNativeContext.registerNativeObject(getModuleName(), getNativeObject(), mProxyGenerator);
		
		// and now tell Javascript the method names so it can construct a proxy for us.
		Collection<String> methods = mNativeContext.getMethodNamesForObject(getModuleName());
		mJsContext.js(MessageFormat.format(JsCommands.REGISTER_MODULE_WITH_METHODS, getModuleName(), TextUtils.join("','", methods)));
	}

	@Override
	public void onUnload() {
		// this will call the onUnload method in the module.
		mJsContext.js(MessageFormat.format(JsCommands.UNREGISTER_MODULE, getModuleName()));
		mNativeContext.unregisterNativeObject(getModuleName());
	}

	protected IKirinState getAppState() {
		return mAppState;
	}

	public String getModuleName() {
		return mModuleName;
	}

	protected Object getNativeObject() {
		return mNativeObject;
	}

	@Override
	public IKirinFileSystem getFileSystem() {
		return mAppState.getPaths();
	}

	@Override
	public <T> T javascriptProxyForModule(Class<T> interfaceClass) {
		return mProxyGenerator.javascriptProxyForModule(interfaceClass);
	}

	/**
	 * Based on Apache Common Lang 2.6 implementation of StringEscapeUtls.escapeJavaScript.
	 * 
	 * Future: Use JSONStringer?
	 * 
	 * @param str The string to escape
	 * @return Escaped string
	 * @throws IOException
	 */
    private static String escapeJavaScript(String str) {
    	if (str == null) {
            return null;
        }
        
    	int size = str.length();
        StringWriter out = new StringWriter(size * 2);
        
        for (int i = 0; i < size; i++) {
            char ch = str.charAt(i);

            // handle unicode
            if (ch > 0xfff) {
                out.write("\\u" + hex(ch));
            } else if (ch > 0xff) {
                out.write("\\u0" + hex(ch));
            } else if (ch > 0x7f) {
                out.write("\\u00" + hex(ch));
            } else if (ch < 32) {
                switch (ch) {
                    case '\b' :
                        out.write('\\');
                        out.write('b');
                        break;
                    case '\n' :
                        out.write('\\');
                        out.write('n');
                        break;
                    case '\t' :
                        out.write('\\');
                        out.write('t');
                        break;
                    case '\f' :
                        out.write('\\');
                        out.write('f');
                        break;
                    case '\r' :
                        out.write('\\');
                        out.write('r');
                        break;
                    default :
                        if (ch > 0xf) {
                            out.write("\\u00" + hex(ch));
                        } else {
                            out.write("\\u000" + hex(ch));
                        }
                        break;
                }
            } else {
                switch (ch) {
                    case '\'' :
                    	out.write('\\');
                        out.write('\'');
                        break;
                    case '"' :
                        out.write('\\');
                        out.write('"');
                        break;
                    case '\\' :
                        out.write('\\');
                        out.write('\\');
                        break;
                    case '/' :
                    	out.write('\\');
                        out.write('/');
                        break;
                    default :
                        out.write(ch);
                        break;
                }
            }
        }

        return out.toString();
    }

    private static String hex(char ch) {
        return Integer.toHexString(ch).toUpperCase(Locale.ENGLISH);
    }
}

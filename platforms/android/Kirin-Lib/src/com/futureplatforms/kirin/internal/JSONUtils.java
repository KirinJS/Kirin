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


package com.futureplatforms.kirin.internal;

import java.io.IOException;
import java.io.StringWriter;
import java.util.Locale;

import org.json.JSONArray;
import org.json.JSONObject;

public class JSONUtils {

    public static String stringOrNull(JSONObject config, String string, String nullObj) {
        return config.isNull(string) ? nullObj : config.optString(string, nullObj);
    }

    public static String stringOrNull(JSONArray array, int index, String nullObj) {
        return array.isNull(index) ? nullObj : array.optString(index);
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
	public static String escapeJavaScript(String str) {
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

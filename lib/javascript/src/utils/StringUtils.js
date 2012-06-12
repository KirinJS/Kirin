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

var _ = require("underscore");
var regexp = /\{(.+?)\}/g;
exports.messageFormat = function (pattern, args, optionalMappingFn) {
	var argsList = arguments;
	var argsListLen = argsList.length - 1;
	return pattern.replace(regexp, function (match) {
		var key = match.substring(1, match.length - 1);

		var index = parseInt(key, 10);
		var replacement;
		if (!_.isNaN(index)) {
			if (index >= 0 && index <= argsListLen) {
				replacement = argsList[index + 1];
			}
		} else {
			replacement = args[key];
		}
		

		if (_.isUndefined(replacement)) {
			return match;
		}

		if (_.isFunction(replacement)) {
			replacement = replacement(key);
		}
		
		if (_.isFunction(optionalMappingFn)) {
			replacement = optionalMappingFn(replacement);
			if (_.isUndefined(replacement)) {
				return match;
			}
		}
		
		if (_.isNumber(replacement) || _.isString(replacement) || _.isBoolean(replacement)) {
			return replacement;
		}

		return JSON.stringify(replacement);
	});

};


exports.trim = function (str) {
	if (!_.isString(str)) {
		return str;
	}
	str = str.replace(/^\s\s*/, '');
	var ws = /\s/, i = str.length;
	while (ws.test(str.charAt(--i))) {}
	return str.slice(0, i + 1);
};

exports.jsCleanse = (function () {
	var re = /(['"])/g;
	return function (str) {
		return str.replace(re, "\\$1");
	};
})();

exports.padded = function (str, padding, len) {
	if (typeof str !== 'string') {
		str += "";
	}
	var strLen = str.length;
	var padLen = padding.length;
	if (!padLen || !len) {
		return str;
	}
	while (strLen < len) {
		str = padding + str;
		strLen += padLen;
	}
	
	if (strLen === len) {
		return str;
	}
	
	return str.slice(-len);
};

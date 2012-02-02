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

defineModule("JSONUtils", function (require, exports) {
	
	var isMap = function (obj) {
		return (typeof obj === 'object' && !_.isArray(obj));
	};
	
    var findThingInObject = function (isThingTest, errorReturn, obj, path) {
        if (!isMap(obj) && isThingTest(obj)) {
            // we found the list straight away, 
            // return it as a list, but nothing for the "envelope"
            return obj;
        }
        
        var orig = obj, 
            parent, key;
        
        for (var i=0, max=path.length; i<max; i++) {
            key = path[i];
            parent = obj;
            obj = parent[key];
            if (obj) {
                if (!isMap(obj) && isThingTest(obj)) {
                    return obj;
                }
            } else {
                // we can't find the object. 
                return errorReturn;
            }
        }
        
        // we couldn't find the list according to the path, 
        // so return the original and no list.
        return isThingTest(obj) ? obj : errorReturn;
    };
	
	exports.findList = _.bind(findThingInObject, this, _.isArray, []);
	
	exports.findArray = exports.findList;
	
	exports.findObject = _.bind(findThingInObject, this, isMap, {});
	
	exports.findFunction = _.bind(findThingInObject, this, _.isFunction, function () {});
	
	exports.findString = _.bind(findThingInObject, this, _.isString, null);
	
	exports.copyOnly = function (src, dest, keys) {
		for (var i=0, max=keys.length; i<max; i++) {
			var key = keys[i];
			var value = src[key];
			
			if (typeof value !== 'undefined') {
				dest[key] = value;
			}
		}
	};
    

	exports.deepClone = (function () {
		var deepClone;
		
		var INCLUSION_FILTER = function (item) {
			return true;
		};
		function deepCloneObject (src, fn) {
			var dest = {};
			
			_.each(src, function (i, key) {
				var value, clone;
				if (key) {
					value = src[key];
					if (value) {
						clone = deepClone(value, fn);
						if (clone) {
							dest[key] = clone;
						}
					}
				}
			});
			return dest;
		}
		
		function deepCloneArray (src, fn) {
			var dest = [];
			_.each(src, function (orig) {
				var clone = deepClone(orig, fn);
				if (clone) {
					dest.push(clone);
				}
			});
			return dest;
		}
		
		deepClone = function (src, fn) {
			if (!fn) {
				fn = INCLUSION_FILTER;
			}
			if (!fn(src)) {
				return null;
			}
			if (_.isArray(src, fn)) {
				return deepCloneArray(src, fn);
			} else if (src && typeof src === 'object') {
				return deepCloneObject(src, fn);
			} else {
				return src;
			}
		};
		
		return deepClone;
		
		
	})();
	
});
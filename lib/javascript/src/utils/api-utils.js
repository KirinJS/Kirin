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


var EMPTY_FUNCTION = function () {};

var empties = {
        // TODO: remove this, to reduce the amount of traffic through the keyhole.
        'function': function () {}
        
};

var _ = require("underscore");


var typeTester = (function () {

    var genericTest = function (type, obj) {
        return typeof obj === type || !_.isArray(obj);
    };
    
    var typeFunctions = {
        "array": _.isArray,
        "function": _.isFunction,
        "string": _.isString,
        "number": _.isNumber,
        "boolean": _.isBoolean,
        "date": _.isDate,
        "regexp": _.isRegExp,
        "object": _.bind(genericTest, null, "object")
    };
    
    
    return function (type) {
        var typeTest = typeFunctions[type];
        if (typeTest) {
            return typeTest;
        } else {
            return _.bind(genericTest, null, type);
        }    
    };
    
}());

var normalizeForType = function (obj, mandatory, optional, oneof, defaultValues, defaultProperty, type) {
    var i, name, value, def;
    if (typeof obj !== 'object' && _.isString(defaultProperty)) {
        value = obj;
        obj = {};
        obj[defaultProperty] = value;
    }

    var typeTest = typeTester(type);
    
    for (i=0; i<mandatory.length; i++) {
        name = mandatory[i];
        if (!typeTest(obj[name])) {
            throw new Error("API Object must have a " + type + " called '" + name + "'");
        }
    }
    
    // Check defaults are present. Set the defaults where they're not..
    _.each(_.keys(defaultValues), function(defKey) {
        if (typeof obj[defKey] === 'undefined') {
            // There is no value for this key, give it the default
            obj[defKey] = defaultValues[defKey];
        }
    });

    // Now that any missing defaults are there.. go through and ensure that 
    // all missing optional key/values have their empties set (if they have empties).
    // If there is no empties for the type, then the absent optional key is left absent. 
    _.each(optional, function(optionalKey) {
        if(typeof obj[optionalKey] === 'undefined') {
            if(typeof empties[type] !== 'undefined') {
                obj[optionalKey] = empties[type];
            }
        }
    });

    var count = mandatory.length;
    for (i=0; i<oneof.length; i++) {
        name = oneof[i];
        value = obj[name];
        if (typeof value === 'undefined') {
            def = empties[type];
            if (typeof def !== 'undefined') {
                obj[name] = def;
            }
        } else if (typeTest(obj[name])){
            count ++;
        } else {
            throw new Error("If an API Object should have " + name + " property, it should be a " + type);
        }
    }
    if (count === 0 && oneof.length > 0) {
        throw new Error("API Object must have at least one " + type + " from " + oneof);
    }
    
    return obj;
};

exports.normalizeAPI = function (config, obj) {
    for (var type in config) {
        if (config.hasOwnProperty(type)) {
            var c = config[type];
            
            if (typeof c !== 'object') {
                continue;
            }
            
            var mandatory = c.mandatory || [];
            var defaultValues = c.defaults || {};
            var optional = c.optional || [];
            var oneof = c.oneOf || [];
            var defaultProperty = c.defaultProperty;
            obj = normalizeForType(obj, mandatory, optional, oneof, defaultValues, defaultProperty, type);
        }
    }
    
    return obj;
};

exports.__normalizeForType = normalizeForType;

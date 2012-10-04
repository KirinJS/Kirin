var _ = require("underscore");

// TODO schema lives with some BridgeUtil(schema) object not object._schema
// there may be a Object.prototype._bridgeUtil; 
// BridgeUtil.validate(object);
// BridgeUtil.createExportable(object);
// BridgeUtil.hasCallbacks(object);

function BridgeUtils (schema) {
	this.schema = schema;
}
exports.BridgeUtils = BridgeUtils;
var instance = BridgeUtils.prototype;

instance.validate = (function () {
    var typeValidators = {
            "boolean": _.isBoolean,
            "string": _.isString,
            "number": _.isNumber,
            "int": _.isNumber,
            "array": _.isArray,
            "object": function (obj) {
                return _.isObject(obj) && !_.isArray(obj);
            }
    };
 
    return function (object) {
    // schema is:
    /*
     * { 
     *  properties: { name: type },
     *  methods: { name: arity },
     *  dependencies: { property: [other properties] }
     *  allowable: [ [ property0, property1 ] ]
     * }
     * 
     * Object is an object that is going to be tested.
     * 
     */
        if (!_.isObject(object)) {
            throw new Error("Expected to validate an object but found " + object);
        }
        
        // first check the types. 
        // if the property exists and it's the right type
        // if the property is supposed to be a method, then that's okay too.
        var schema = this.schema,
            properties = schema.properties || {},
            methods = schema.methods || {};
        _.each(object, function (i, k) {
            var propertyType = properties[k],
                value = object[k],
                methodArity = methods[k],
                validator = typeValidators[propertyType];
            if (validator && !validator(value)) {
                throw new Error("Expected a property " + k + " to be of type " + propertyType + " but found value '" + value + "'");
            } else if (_.isNumber(methodArity)) {
                if (!_.isFunction(value)) {                    
                    throw new Error("Expected a method or funtion " + k + " to be a function but found value '" + value + "'");                
                }
                
                if (methodArity >= 0 && methodArity !== value.length) {
                    throw new Error("Expected a function " + k + " to have " + methodArity + " args, but it uses " + value.length);                                    
                }
            } else if (_.isObject(value._schema)) {
                // unsure about this.
                exports.validate(value._schema, value);
            }
        });
        
        // TODO we should fill in defaults.
    
        
        
        // next check for allowability
        var allowedCombinations = schema.allowable || [], 
            combination, propertyName, 
            isValid = true, 
            i=0, j=0, maxI, maxJ;
        
        
        for (maxI=allowedCombinations.length; i<maxI; i++) {
            combination = allowedCombinations[i];
            isValid = true;
            j = 0;
            for (maxJ=combination.length; j<maxJ; j++) {
                propertyName = combination[j];
                if (_.isUndefined(object[propertyName])) {
                    isValid = false;
                    break;
                }
            }
            
            if (isValid) {
                break;
            }
        }
        
        if (!isValid) {
            throw new Error("No valid combination of arguments was found in " + JSON.stringify(object));
        }
    };
})();

instance.createExportableObject = function (object) {
    var exportable = {};
    _.each(this.schema.properties, function (i, k) {
        var v = object[k];
        if (v || typeof v !== 'undefined') {
            exportable[k] = v;
        }
    });
    
    _.each(this.schema.methods, function (i, k) {
        var v = object[k];
        if (v) {
            // TODO is this the right method substitution?
            exportable[k] = true;
        }
    });
    
    return exportable;
};

instance.hasCallbacks = function (object) {
	var schema = this.schema;
    if (!schema.methods || schema.methods.length === 0) {
        return false;
    }
    
    var methods = schema.methods, 
        i=0, 
        max = methods.length;
    
    for (; i < max; i++) {
        if (object[methods[i]]) {
            return true;
        }
    }
    return false;
};


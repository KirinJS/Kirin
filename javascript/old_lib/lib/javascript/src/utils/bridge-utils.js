var kirin = require("kirin"),
    _ = require("underscore");

var wrapCallbacks = kirin.wrapCallbacks;

exports.makeTransportable = function (object, validator) {
    if (validator && _.isFunction(validator)) {
        validator(object);
    }
    
    return wrapCallbacks(object);
};

exports.registerWithNative = function (object) {
    
};

exports.checkConsistency = function (obj, validMembership, dependencies) {
    _.each(validMembership, function (configuration) {
        _.each(configuration, function (member) {
            
        });
    });
};

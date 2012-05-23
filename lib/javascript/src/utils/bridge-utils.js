var kirin = require("kirin"),
    _ = require("underscore");

var wrapCallbacks = kirin.wrapCallbacks;

exports.makeTransportable = function (object, validator) {
    if (validator && _.isFunction(validator)) {
        validator(object);
    }
    
    return wrapCallbacks(object);
};

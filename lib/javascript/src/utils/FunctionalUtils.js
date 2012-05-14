
 exports.makeContinuation = function (functions) {
     var counter = 0;
     if (_.isFunction(functions)) {
        functions = _.toArray(arguments);
     }
     var continuation = function () {
    	
        var args = _.toArray(arguments);
        var nextFunction = null;
        while (!_.isFunction(nextFunction) && counter < functions.length) {
        	nextFunction = counter < functions.length ? functions[counter] : null;
        	counter ++;
        }
    
        if (_.isFunction(nextFunction)) {
            nextFunction.apply(null, args);
        }
     
     };
     
     continuation.reset = function () {
        counter = 0;
     };
     return continuation;
 };
 
 exports.makeBackgroundContinuation = function (functions) {
	 var timers = require("Timers");
	 // check if we're using the arguments form, or a list of functions form.
     if (_.isFunction(functions)) {
         functions = _.toArray(arguments);
      }
	 functions = _.map(functions, function (f) {
		 if (!_.isFunction(f)) {
			 return f;
		 }
		 return function () {
			 var args = _.toArray(arguments);
			 timers.setTimeout(function () {
				 f.apply(null, args);
			 }, 10);
		 };
		 
	 });
	 
	 return exports.makeContinuation(functions);
	 
 };

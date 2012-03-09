defineModule("FunctionalUtils", function (require, exports) {

     exports.makeContinuation = function (functions) {
         var counter = 0;
         if (_.isFunction(functions)) {
            functions = _.toArray(arguments);
         }
         var continuation = function () {
            var args = _.toArray(arguments);
            
            var nextFunction = counter < functions.length ? functions[counter] : null;
            counter ++;
        
            if (_.isFunction(nextFunction)) {
                nextFunction.apply(null, args);
            }
         
         };
         
         continuation.reset = function () {
            counter = 0;
         };
         return continuation;
     };

});
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

// Here lies the test environment's version of defineModule.
//
// This creates test friendly proxy objects for every module that gets defined. 
// These proxy objects can act either as the real module would, or act as a dummy object with 
// which any of the modules' exports may be manipulated as unit tests see fit.  
//
// We use a fake "exports" variable here to get around the fact that there is a real 
// implementation of "exports" and "require" in node.
var defineModuleStack = 0;
global.defineModule = function (key, block, definingModuleArgs) {
    // arguments.callee.caller.arguments are (exports, require, module, __filename, __dirname)
    if(undefined === definingModuleArgs) {        
        definingModuleArgs = arguments.callee.caller.arguments;
    }
    
    var fakeModule = definingModuleArgs[2];
    var fakeExports = {};
        
    block(require, fakeExports);
    
    fakeModule.exports = fakeExports;
};

/**
 * Some of the test environment's modules really just require a real module to do 
 * it's work. e.g. the test environment's kirin.js just uses the kirin-webkit module. 
 * i.e. these modules masquerade as real modules. 
 * This function helps define one of these modules.
 * 
 * Implementation: All of the exports from the real module are copied into the 
 * alias module's exports.
 * Any functions in those exports are converted into a proxy function that call the real 
 * module's function. The proxy functions will then re-mirror/re-copy all of the real modules
 * exports (except the functions) into the alias module.
 */
global.defineModuleAlias = function(proxyModuleName, targetModuleName) {
    defineModule(proxyModuleName, function (require, exports) {
        var realKirinObject = require(targetModuleName);
        
        var proxify = function(fakeExports, realExports) {
            _.each(_.keys(realExports), function(key) {
                var value = realExports[key];
                
                if(_.isFunction(value)) {
                    // Create a proxy to call the real function
                    if(!fakeExports[key].__isAProxy) {                
                        fakeExports[key] = function(){
                            var realFunc = value;
                            var result = realFunc.apply(this, arguments);
                            
                            // Make sure all of the properties of the real exports are mirrored in the fake exports.
                            proxify(exports, realKirinObject);
                            
                            return result;
                        };
                        fakeExports[key].__isAProxy = true; // Guard against proxying way too much (--> stack overflow)
                    }
                } else if("object" === typeof value && !_.isNull(value)) {
                    // Recurse into the object
                    fakeExports[key] = realExports[key];
                    proxify(fakeExports[key], realExports[key]);
                } else {
                    // It's some kind of primitive, property, or array. 
                    // Make the fakeExports mirror the real exports.
                    fakeExports[key] = realExports[key];
                }
            });
        }
        
        _.extend(exports, realKirinObject);
        
        proxify(exports, realKirinObject);
    }, arguments.callee.caller.arguments);
}
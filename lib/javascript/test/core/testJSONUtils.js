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

defineModule("testJSONUtils", function (require, exports) {
    var json = require("JSONUtils"),
        assert = require("assert");
    
    
    var testObject = { deeply: {nested: {list: ['list', 'of', 'strings'], object: {empty: false}}}};
    var cloneOfTestObject = _.clone(testObject);
    
    exports.testFindList = function () {
        assert.deepEqual(cloneOfTestObject, testObject);
        
        var list = json.findList(testObject, ['deeply', 'nested', 'list']);
        assert.deepEqual(['list', 'of', 'strings'], list);

        var notList = json.findList(testObject, ['deeply', 'nested', 'object']); // wrong type.
        assert.deepEqual([], notList);
        
        assert.deepEqual(cloneOfTestObject, testObject);
    };
    
    exports.testFindObject = function () {
        assert.deepEqual(cloneOfTestObject, testObject);
        var obj = json.findObject(testObject, ['deeply', 'nested', 'object']);
        assert.deepEqual(testObject.deeply.nested.object, obj);
        assert.deepEqual({empty: false}, obj);
        
        var notObject = json.findObject(testObject, ['deeply', 'nested', 'list']); // wrong type.
        assert.deepEqual({}, notObject);
        
        assert.deepEqual(cloneOfTestObject, testObject);
    };
    
    exports.testDeepClone = function () {
        
        var INCLUSION_FILTER = function (item) {
            return item;
        }
        
        var obj = {a:1, b:2, c:null};
        var clone = json.deepClone(obj, INCLUSION_FILTER);
        
        console.log(clone);
        assert.ok(clone);
        assert.ok(clone.a);
        assert.ok(clone.b);
        assert.ok(!clone.c);
        assert.ok(clone.a && clone.b && !clone.c);
        
        
        var array = [1, 2, null, 3];
        var clone = json.deepClone(array, INCLUSION_FILTER);
        assert.deepEqual([1,2,3], clone);
        
        obj = {a:1, b: true, c:{q:null, w: 1}, d: "a", e: null};
        clone = json.deepClone(obj, INCLUSION_FILTER);
        
        assert.deepEqual({a:1, b:true, c: {w:1}, d: "a"}, clone);
    };
    
});
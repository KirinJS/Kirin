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

defineModule("dates", function (require, exports) {
  var currentTime = new Date(1299500023000) ; // Mon, 07 Mar 2011 12:13:43 GMT
  
  exports.setCurrentTime = function(timeInMillisSinceEpoch) {
    currentTime = new Date(timeInMillisSinceEpoch);
  } 
  
  exports.getCurrentTime = function() {
    return currentTime;
  }
});
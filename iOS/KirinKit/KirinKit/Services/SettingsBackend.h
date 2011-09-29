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



#import <Foundation/Foundation.h>


@interface SettingsBackend : NSObject {
    
    NSString* settingsFileName;
    
    NSMutableDictionary* settings;
}

/*
 * Updates settings, by running a javascript method against
 * the settings (as a javascript object with properties keyed by setting name).
 */
- (void) requestPopulateJSWithCallback:(NSString *)updateCallback;

/*
 * Deletes settings, also removing those that are no longer needed.
 * 
 * Arguments:
 * (NSDictionary *)keyValuePairs
 * (NSArray *)deletedKeys
 */
- (void) updateContents:(NSDictionary *)adds withDeletes:(NSArray *)deletes;

- (void) populateJSWithInitialValues;

@end

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

/**
 *  Settings on iOS are implemented using NSUserDefaults and sent to the
 *  rest of kirin using its JSONRepresentation.
 *
 *  This can cause problems if another part of the app sticks something in 
 *  NSUserDefaults that the JSON library can't deal with.  So we only deal
 *  with keys beginning with "kirin-".
 */

#import "SettingsBackend.h"
#import "Kirin.h"
#import "JSON.h"

@interface SettingsBackend ()

- (NSDictionary*) settingsAsDictionary;

@end

@implementation SettingsBackend

- (id) init {
    return [super initWithModuleName:@"Settings"];
}

- (void) onLoad {
    [super onLoad];
    
    [self.kirinHelper jsMethod:@"mergeOrOverwrite" withArgsList:[[self settingsAsDictionary] JSONRepresentation]];
    [self.kirinHelper jsMethod:@"resetEnvironment"];
}

#pragma mark -
#pragma mark Interal Methods

- (NSDictionary*) settingsAsDictionary {
    // Returns a dictionary of all the pairs in NSUserDefaults
    // whose keys begin with "kirin-"
    NSDictionary* settings = [[NSUserDefaults standardUserDefaults] dictionaryRepresentation];
    NSMutableDictionary* kirinSettings = [[NSMutableDictionary alloc] init];
    
    for (id key in settings) {
        if ([key hasPrefix:@"kirin-"]) {
            [kirinSettings setValue:[settings objectForKey:key] forKey:[key substringFromIndex:6]];
        }
    }
    return kirinSettings;
}

#pragma mark -
#pragma mark External Interface Methods

- (void)requestPopulateJSWithCallback:(NSString *)updateCallback {
    [self.kirinHelper jsCallback:updateCallback withArgsList:[[self settingsAsDictionary] JSONRepresentation]];
    [self.kirinHelper cleanupCallback:updateCallback, nil];
}

- (void)updateContents:(NSDictionary *)adds withDeletes:(NSArray *)deletes
{
    NSUserDefaults* userSettings = [NSUserDefaults standardUserDefaults];
    
    if([adds isKindOfClass:[NSDictionary class]]) {
        // Make a separate dictionary of all the keys with "kirin-"
        // stuck on the front.
        NSMutableDictionary* kirinAdds = [[NSMutableDictionary alloc] init];
        for (id key in adds) {
            id value = [adds objectForKey:key];
            [kirinAdds setValue:value forKey:[NSString stringWithFormat:@"kirin-%@", key]];
        }
        
        [userSettings setValuesForKeysWithDictionary:kirinAdds];
    } else {
        NSLog(@"[SettingsBackend] didn't expect a %@", [adds class]);
    }
    
    if([deletes isKindOfClass:[NSArray class]]) {
        for (id key in deletes) {
            // Ensure we stick "kirin-" on the front before removing keys
            [userSettings removeObjectForKey:[NSString stringWithFormat:@"kirin-%@", key]];
        }        
    } else {
        NSLog(@"[SettingsBackend] didn't expect a %@", [deletes class]);
    }
    
    [userSettings synchronize];
}

#pragma mark -
#pragma mark lifecycle

- (void)dealloc {
    [super dealloc];
}

@end

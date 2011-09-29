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



#import "SettingsBackend.h"
#import "Kirin.h"
#import "JSON.h"

@implementation SettingsBackend

#pragma mark -
#pragma mark Interal Methods

-(void) initSettingsFileLocationIfNeeded{
    
    NSLog(@"        <SETTINGS> init settings files");
    
    if(settingsFileName) return;
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,
                                                         NSUserDomainMask, YES); 
    NSString *documentsDirectory = [paths objectAtIndex:0];
    
    settingsFileName = [documentsDirectory 
                        stringByAppendingPathComponent:@"settingsFile.plist"];
    
    [settingsFileName retain];
    
    NSLog(@"        <SETTINGS> settings file: %@", settingsFileName);

}

-(void) openSettingsFileIfNeeded{
    
    NSLog(@"    <SETTINGS> open files");
    
    if(settings != nil) return;
        
    [self initSettingsFileLocationIfNeeded];
    
    if([[NSFileManager defaultManager] fileExistsAtPath:settingsFileName]){
        
        settings = [[NSMutableDictionary alloc] initWithContentsOfFile: settingsFileName];
        
    } else {
        
        settings = [[NSMutableDictionary alloc] initWithCapacity: 5];
        
    }

}

-(void) writeToSettingsFile{
    
    NSLog(@"    <SETTINGS> write files READY");
    [self initSettingsFileLocationIfNeeded];
    [settings writeToFile:settingsFileName atomically:YES];
    NSLog(@"    <SETTINGS> write files DONE");
    
}

- (void) populateJSWithInitialValues {
    [self openSettingsFileIfNeeded];
	[KIRIN fireEventIntoJS:[NSString stringWithFormat:@"initializeSettings(%@)", [settings JSONRepresentation]]];
}

#pragma mark -
#pragma mark External Interface Methods

- (void)requestPopulateJSWithCallback:(NSString *)updateCallback
{
    NSLog(@"<SETTINGS> Request made for settings with callback: %@", updateCallback);
    
    [self openSettingsFileIfNeeded];
    
    NSLog(@"<SETTINGS> have a settigns file called: %@", settings);

//    [KIRIN runCallback:updateCallback withArgument:
//    
//                    [settings JSONRepresentation]
//     
//    ];
	[KIRIN fireEventIntoJS:[NSString stringWithFormat:@"initializeSettings(%@)", [settings JSONRepresentation]]];
    NSLog(@"<SETTINGS> callback made with %d arguments.", [settings count]);     
}

- (void)updateContents:(NSDictionary *)adds withDeletes:(NSArray *)deletes
{
    NSLog(@"<SETTINGS> Request made for settings update: %@, %@", adds, deletes);
    
    [self openSettingsFileIfNeeded];
    
    if([adds isKindOfClass:[NSString class]]) {
        
        NSLog(@"<SETTINGS> Was a string and shouldn't be");
        
    } else if([adds isKindOfClass:[NSDictionary class]]) {
        
        NSLog(@"<SETTINGS> adding, was %d and about to add %d adds", [settings count], [adds count]);
        [settings addEntriesFromDictionary: adds];
        NSLog(@"<SETTINGS> added, now %d", [settings count]);
        
    } else {
        
        NSLog(@"<SETTINGS> didn't expect a %@", [adds class]);
        
    }
    
    NSLog(@"<SETTINGS> deletes ready");
    //modify settings object
    [settings removeObjectsForKeys: deletes];
    
    //write them out to the file
    [self writeToSettingsFile];
    NSLog(@"<SETTINGS> written");
}

#pragma mark -
#pragma mark lifecycle

- (void)dealloc {
    
    [settingsFileName release];
    [settings release];
    
    [super dealloc];
}

@end

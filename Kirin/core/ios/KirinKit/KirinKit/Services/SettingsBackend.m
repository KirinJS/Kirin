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

@interface SettingsBackend ()

- (void) initSettingsFileLocationIfNeeded;
- (void) openSettingsFileIfNeeded;

@end

@implementation SettingsBackend

- (id) init {
    return [super initWithModuleName:@"Settings"];
}

- (void) onLoad {
    [super onLoad];
    [self openSettingsFileIfNeeded];
    [self.kirinHelper jsMethod:@"mergeOrOverwrite" withArgsList:[settings JSONRepresentation]];
    [self.kirinHelper jsMethod:@"resetEnvironment"];
}

#pragma mark -
#pragma mark Interal Methods

-(void) initSettingsFileLocationIfNeeded{
    
    NSLog(@"[SettingsBackend] init settings files");
    
    if(settingsFileName) return;
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,
                                                         NSUserDomainMask, YES); 
    NSString *documentsDirectory = [paths objectAtIndex:0];
    
    settingsFileName = [documentsDirectory 
                        stringByAppendingPathComponent:@"settingsFile.plist"];
    
    [settingsFileName retain];

}

- (void) openSettingsFileIfNeeded {
    
    NSLog(@"[SettingsBackend] open files");
    
    if(settings != nil) return;
        
    [self initSettingsFileLocationIfNeeded];
    
    if([[NSFileManager defaultManager] fileExistsAtPath:settingsFileName]){
        
        settings = [[NSMutableDictionary alloc] initWithContentsOfFile: settingsFileName];
        
    } else {
        
        settings = [[NSMutableDictionary alloc] initWithCapacity: 5];
        
    }

}

- (void) writeToSettingsFile {
    NSLog(@"[SettingsBackend] Writing settings file");
    [self initSettingsFileLocationIfNeeded];
    [settings writeToFile:settingsFileName atomically:YES];
}


#pragma mark -
#pragma mark External Interface Methods

- (void)requestPopulateJSWithCallback:(NSString *)updateCallback
{
    [self openSettingsFileIfNeeded];
    [self.kirinHelper jsCallback:updateCallback withArgsList:[settings JSONRepresentation]];
}

- (void)updateContents:(NSDictionary *)adds withDeletes:(NSArray *)deletes
{
    NSLog(@"[SettingsBackend] Request to commit settings: %@, %@", adds, deletes);
    
    [self openSettingsFileIfNeeded];
    
    if([adds isKindOfClass:[NSString class]]) {
        
        NSLog(@"[SettingsBackend] Was a string and shouldn't be");
        
    } else if([adds isKindOfClass:[NSDictionary class]]) {
        
        [settings addEntriesFromDictionary: adds];
        
    } else {
        
        NSLog(@"[SettingsBackend] didn't expect a %@", [adds class]);
    
    }
    
    
    //modify settings object
    [settings removeObjectsForKeys: deletes];
    
    //write them out to the file
    [self writeToSettingsFile];
}

#pragma mark -
#pragma mark lifecycle

- (void)dealloc {
    
    [settingsFileName release];
    [settings release];
    [super dealloc];
}

@end

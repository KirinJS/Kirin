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



#import "SQLiteDatabase.h"
#import "sqlite3.h"
#import "SQLiteConnection.h"

@implementation SQLiteDatabase

- (NSObject <Connection> *)open:(NSString *)name backedByFile:(NSString *)filename
{
    sqlite3 *db;
    
    NSString* homePath = NSHomeDirectory();
    NSString* documentsPath = [homePath stringByAppendingPathComponent:@"Documents"];
    NSString* filePath = [documentsPath stringByAppendingPathComponent:filename];
    
    if ([connectionsByName objectForKey:name] != nil) {
        
        // TODO: Raise an exception - already have an open connection.
        
    }
    
    // TODO: Check if the database file exists.
    // - if it does not, create a connection with a nil version - it needs initialising.
    // - if it does, go with the existing version number. This may be nil - for example, if we opened an empty database but failed to initialise it previously.
    
    int resultCode = sqlite3_open_v2([filePath UTF8String], &db, SQLITE_OPEN_CREATE | SQLITE_OPEN_READWRITE | SQLITE_OPEN_FULLMUTEX, NULL);
    
    if (resultCode != SQLITE_OK) {
        
        NSException *e = [NSException exceptionWithName:@"" reason:[NSString stringWithFormat:@"Couldn't create a SQLite database named %@ backed by file %@. SQLite error code: %d", name, filename, resultCode] 
                                               userInfo:nil];
        
        [e raise];
        
    }
    
    NSLog(@"Opened or created a SQLite database with name %@ backed by file %@.", name, filePath);
    
    SQLiteConnection *c = [[SQLiteConnection alloc] initWithName:name backedByFile:filePath atVersion:nil withConnection:db];
    
    [connectionsByName setObject:c forKey:name];
    
    [c release];
    
    return c;

}

- (id)init {
    self = [super init];
    if (self) {
        connectionsByName = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (void)dealloc {
    
    // Close any open connections, with warnings.
    SQLiteConnection *c;
    NSEnumerator *e = [connectionsByName objectEnumerator];
    
    while ((c = [e nextObject])) {
        
        NSLog(@"Closing a database connection that was left open when the database was deallocated: %@", c);
        
        @try {
            
            [c close];
            
        }
        @catch (NSException *exception) {
            
            NSLog(@"Couldn't close a database connection to %@", [c name]);
            
        }
        
    }
    
    [connectionsByName release];
    [super dealloc];
}

@end

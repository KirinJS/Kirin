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



#import "SQLiteConnection.h"
#import "Transaction.h"
#import "sqlite3.h"
#import "JSON.h"

@implementation SQLiteConnection

@synthesize name;
@synthesize filename;
@synthesize version;

- (id) initWithName:(NSString *)_name backedByFile:(NSString *)_filename atVersion:(NSNumber *)_version withConnection:(sqlite3 *)_db
{
    self = [super init];
    
    if (self) {
    
        self.name = _name;
        self.filename = _filename;
        self.version = _version;
        db = _db;
        
    }
    
    return self;
}

- (NSNumber *)currentSchemaVersion
{
    return self.version;
}


- (void) finaliseStatement:(sqlite3_stmt *)s
{
    
    sqlite3_finalize(s);
    //NSLog(@"<SQLITE STATEMENT> finalise statement OK");
    
}

- (sqlite3_stmt *) prepareStatement:(NSString *)sql
{
    
    // A pointer to the statment struct if prepare succeeds, otherwise NULL.
    sqlite3_stmt *pst;
    
    int resultCode = sqlite3_prepare_v2(db, [sql UTF8String], -1, &pst, NULL);
    
    if (resultCode != SQLITE_OK) {
        
        NSString *reason = [NSString stringWithFormat:@"Couldn't create a SQLite prepared statement in database %@. SQL \"%@\", sqlite3 error code %d.", name, sql, resultCode];
        
        [self raiseException:@"SQLException" withReason:reason];
        
    }
    
    return pst;
    
}

- (void) bindParameters:(NSArray *)_parameters toStatement:(sqlite3_stmt *)pst
{
    if(!_parameters || [_parameters isKindOfClass: [NSNull class]]) return;
    
    int i;
    
    id object;
    
    int resultCode = SQLITE_OK;
    
    for (i=0; i<[_parameters count]; ++i) {
        
        object = [_parameters objectAtIndex:i];
        
        if ([object isKindOfClass: [NSNumber class]]) {
            NSNumber* number = object;
            resultCode = sqlite3_bind_int(pst, i+1, [number intValue]);
            // TODO unsure how to put floating point numbers in. 

        }
        else if ([object isKindOfClass: [NSString class]]) {
            
            NSString* teh = object;
            resultCode = sqlite3_bind_text(pst, i+1, [teh UTF8String], -1, NULL);
            
        }
        else if ([object isKindOfClass: [NSNull class]]) {
            resultCode = sqlite3_bind_null(pst, i+1);

        } else {

            NSLog(@"[DatabasesBackend] Can't deal with this type: %@", [object class]);
            
        }
        
        if (resultCode != SQLITE_OK) {
        
            [self raiseException:@"SQLException" withReason:[NSString stringWithFormat: @"Failed to bind with error code: %d", sqlite3_errcode(db)]];
            
        }
        
    }
    
}

- (void)raiseException:(NSString *)_name withReason:(NSString *)_reason
{
    NSException *e = [NSException exceptionWithName:_name reason:_reason userInfo:nil];
    
    [e raise];
}


- (NSArray*) readAllDataFrom:(sqlite3_stmt*) s {
    
    NSMutableArray* allData = [[[NSMutableArray alloc] init] autorelease];
    
    int value;
    
    while((value = sqlite3_step(s))==SQLITE_ROW || value == SQLITE_OK){
        
        int cols = sqlite3_column_count(s);
        
        int b;
        
        NSMutableDictionary* data = [[NSMutableDictionary alloc] init];
        
        for (b = 0; b < cols; b++) {
            
            
            NSString* n = [[[NSString alloc] initWithUTF8String: (char*) sqlite3_column_name(s, b)] autorelease];
            
            int type;
            
            switch(type = sqlite3_column_type(s, b)) {
                    
                case SQLITE_TEXT:{
                    
                    NSString* text = [[NSString alloc] initWithUTF8String: (char*) sqlite3_column_text(s, b)];
                    
                    [data setObject:text forKey:n];
                    
                    [text release];
                    
                    break;
                    
                }
                case SQLITE_INTEGER:{
                    
                    NSNumber* number = [[NSNumber alloc] initWithInt: sqlite3_column_int(s, b)];
                    
                    [data setObject:number forKey:n];
                    
                    [number release];
                    
                    break;
                    
                } default: {
                    NSLog(@"<SQLITE CONNECTION> skipped data of type %d", type);
                }
                    
            }
            
        }
        
        [allData addObject: data];
        
        [data release];
        
    }
    
    if(SQLITE_ERROR == value){
        
        [allData removeAllObjects];
        allData = nil;
        
        [self raiseException:@"SQLException" withReason:[NSString stringWithFormat: @"Failed with error code: %d", sqlite3_errcode(db)]];
        
    }
    
    //NSLog(@"<SQLITE CONNETION> DONE: %d", value);
    
    return allData;
    
}

- (void) executeBlock:(NSString *)sql
{
    
    sqlite3_exec(db, [sql UTF8String], NULL, NULL, NULL);
    
    NSLog(@"<SQLITE CONNECTION> executed: %@", sql);
    
}

- (NSArray*) execute:(NSString *)sql withParameters:(NSArray *)parameters
{
    
    NSArray* allData;
    
    sqlite3_stmt* s;
    
    s = [self prepareStatement: sql];
    
    @try{
        
        [self bindParameters:parameters toStatement: s];
    
        allData = [self readAllDataFrom:s];
        
    } @finally {
        
        [self finaliseStatement: s];
        
    }
    
    return allData;
       
}

- (void)close
{
    // TODO: Finalise all prepared statements, do weird final stuff to BLOBs.
    int resultCode = sqlite3_close(db);
    
    if (resultCode != SQLITE_OK) {
        
        NSLog(@"<SQLITE CONNECTION> failed to close");
        
    }
    
}

- (void)dealloc {
    
    [self close];
    
    [name release];
    [filename release];
    [version release];
    [super dealloc];
}

@end

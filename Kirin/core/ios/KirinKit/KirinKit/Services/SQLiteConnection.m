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

        NSString* errorMessage = [NSString stringWithCString:sqlite3_errmsg(db) encoding:NSUTF8StringEncoding];
        NSString *reason = [NSString stringWithFormat:@"Couldn't create a SQLite prepared statement in database %@. SQL \"%@\". Error: %@.", name, sql, errorMessage];
        

        
        [self raiseException:@"SQLException" withReason:reason];
        
    }
    
    return pst;
    
}

- (void) bindParameters:(NSArray *)_parameters toStatement:(sqlite3_stmt *)statement
{
    if(!_parameters || [_parameters isKindOfClass: [NSNull class]]) return;
    
    int i;
    
    id o;
    // consider replacing with code from https://billweinman.wordpress.com/2010/09/27/10/
    // if we really haven't got time to replace with FMDB.
    int resultCode = SQLITE_OK;
    
    for (i=0; i<[_parameters count]; ++i) {
        
        o = [_parameters objectAtIndex:i];
        
        
        // code derived from https://billweinman.wordpress.com/2010/09/27/10/
        // TODO code review. I think this works, and is better than before: 
        // it handles ints and doubles differently, which is a good thing
        // but I don't know how numbers are dealt with by JSON.h

        // determine the type of the argument
        if ([o respondsToSelector:@selector(objCType)]) {
            if (strchr("islISLB", *[o objCType])) { // integer
                // TODO unsure what comes out of JSON -> NSNumber
                resultCode = sqlite3_bind_int(statement, i + 1, [o intValue]);
            } else if (strchr("fd", *[o objCType])) {   // double
                // TODO unsure what comes out of JSON -> NSNumber
                resultCode = sqlite3_bind_double(statement, i + 1, [o doubleValue]);
            } else {    // unhandled types
                NSLog(@"[DatabasesBackend] Unhandled objCType: %s", [o objCType]);
                resultCode = SQLITE_ERROR;
            }
        } else if ([o respondsToSelector:@selector(UTF8String)]) {
            // string
            resultCode = sqlite3_bind_text(statement, i + 1, [o UTF8String], -1, SQLITE_TRANSIENT);
        } else if ([o isKindOfClass: [NSNull class]]) {
            // null
            resultCode = sqlite3_bind_null(statement, i+1);
        } else {
            NSLog(@"[DatabasesBackend] Unhandled parameter type: %@", [o class]);
            resultCode = SQLITE_ERROR;
        }
        
        
        
        if (resultCode != SQLITE_OK) {
            NSString* errorMessage = [NSString stringWithCString:sqlite3_errmsg(db) encoding:NSUTF8StringEncoding];
            [self raiseException:@"SQLException" withReason:[NSString stringWithFormat: @"Failed to bind with error: %@", errorMessage]];
            
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

                case SQLITE_TEXT: {
                    NSString* text = [NSString stringWithUTF8String:(char*) sqlite3_column_text(s, b)];
                    [data setObject:text forKey:n];
                    break;
                }
                case SQLITE_INTEGER: {                    
                    NSNumber* number = [NSNumber numberWithInt: sqlite3_column_int(s, b)];
                    [data setObject:number forKey:n];
                    break;
                }
                case SQLITE_FLOAT: {
                    NSNumber* number = [NSNumber numberWithDouble: sqlite3_column_double(s, b)];
                    [data setObject:number forKey:n];
                    break;
                }
                case SQLITE_NULL: {
                    [data setObject:[NSNull null] forKey: n];
                    break;
                }
                default: {
                    NSLog(@"[SQLConnection] skipped data of type %d", type);
                }
                    
            }
            
        }
        
        [allData addObject: data];
        
        [data release];
        
    }
    
    if(SQLITE_ERROR == value){
        
        [allData removeAllObjects];
        allData = nil;
        NSString* errorMessage = [NSString stringWithCString:sqlite3_errmsg(db) encoding:NSUTF8StringEncoding];
        [self raiseException:@"SQLException" withReason:[NSString stringWithFormat: @"Failed with error: %@", errorMessage]];
        
    }
    
    return allData;
    
}

- (void) executeBlock:(NSString *)sql
{
    sqlite3_exec(db, [sql UTF8String], NULL, NULL, NULL);
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
        
        NSLog(@"[DatabasesBackend] failed to close");
        
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

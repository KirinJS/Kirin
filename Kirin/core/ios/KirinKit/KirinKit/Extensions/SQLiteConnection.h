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
#import "sqlite3.h"
#import "Connection.h"

@interface SQLiteConnection : NSObject <Connection> {
    
    NSString *name;
    NSNumber *version;
    NSString *filename;
    sqlite3 *db;
    
}

@property (nonatomic, retain) NSString *name;
@property (nonatomic, retain) NSString *filename;
@property (nonatomic, retain) NSNumber *version;

- (id) initWithName:(NSString *)_name backedByFile:(NSString *)_filename atVersion:(NSNumber *)_version withConnection:(sqlite3 *)db;

- (NSArray*) execute:(NSString *)sql withParameters:(NSArray *)parameters;

- (void) executeBlock:(NSString *)sql;

#pragma mark -
#pragma mark SQL operations

- (void)raiseException:(NSString *)_name withReason:(NSString *)_reason;

/*
 * Prepares a statement, raising a SQLException if anything fails.
 */
- (sqlite3_stmt *) prepareStatement:(NSString *)sql;
- (void) finaliseStatement:(sqlite3_stmt *)s;


@end

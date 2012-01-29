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



#import <KirinKit/KirinKit.h>
#import "DatabasesBackendProtocol.h"
#import "Database.h"


@interface DatabasesBackend : KirinServiceStub <DatabasesBackendProtocol> {
    
    id<Database> db;
    NSMutableDictionary *connectionsByName;
    NSMutableDictionary *transactionsById;
    
}

#pragma mark -
#pragma mark Database Management Methods

/*
 * Gets the version of the current schema for a given database.
 * If there is no database with the given name, this returns nil;
 */
- (NSNumber *)currentSchemaVersion:(NSString *)name;

#pragma mark -
#pragma mark Transaction Methods

/*
 * Begins recording database operations that will be executed as a transaction in the future.
 *
 * Details (NSDictionary *):
 * databaseName (NSString *) - name of the database. // TODO: is this the name or the filename from openDatabase?
 * transactionId (NSString *) - txId from openDatabase.
 * transaction_onSuccess_token (NSString *) - a token. Used when calling back on success.
 * errbackToken (NSString *) - a token. Used when calling back on error.
 * readOnly (NSNumber *) - tells the database if this transaction is going to change the database or not - which may
 * help it to optimise the query better.
 */
- (void)beginTransaction:(NSDictionary *)details;

- (void)raiseException:(NSString *)_name withReason:(NSString *)_reason;

- (dispatch_queue_t) dispatchQueue;

@end

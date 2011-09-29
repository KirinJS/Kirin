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


@protocol DatabasesBackendProtocol <NSObject>

/*
 * Adds a database operation to the list of pending operations that will be executed later as part of opening a database.
 *
 * (NSString *)txId - the id of the transaction that the log should be appended to.
 * (NSArray *)log - the database operations, in order, to be appended to the end of the transaction's log.
 */
- (void)tx:(NSString *)txId appendToOpenerScript:(NSArray *)log;

/*
 * Opens or creates a database.
 * (NSString *)name
 * (NSDictionary *)args
 *
 * Arguments:
 * filename: (NSString *) - a name for this database. Used only for information/debugging.
 * version: (int) - schema version. If this doesn't match the current one we need to migrate the schema.
 * txId: (NSString *) - a transaction identifier. Unique ?
 * onCreate: (NSString *) - call this if a database was created.
 * onOpened: (NSString *) - call this if a database was opened.
 * onUpdate: (NSString *) - call this if the database schema needs migrating.
 * onError: (NSString *) - call this if there was an error.
 *
 * An example of the sequence of operations:
 *
 * new database - so we call onCreate, creating a new tx.
 * KIRIN calls addToOpenerScript many times, then endTransaction.
 * we run the SQL in the opener script, within an SQL transaction.
 * we call onOpened, to indicate that the db is ready for use.
 *
 * Note that we support downgrading the schema - if the requested version is lower than the
 * current one, we don't raise an exception. We call onUpdate instead.
 *
 * We only call onCreate for a new database.
 */
-(void)db:(NSString *)name openOrCreate:(NSDictionary *)args;

/*
 * Adds a database operation to the list of pending operations that will be executed later as part of a
 * transaction.
 *
 * (NSString *)txId - the id of the transaction that the log should be appended to.
 * (NSArray *)log - the database operations, in order, to be appended to the end of the transaction's log.
 *
 * Log entry (NSArray *):
 * (NSString *)type - 'rowset', 'row', 'array', 'file'
 * (NSString *)statement - SQL statement.
 * (NSArray *)parameters - to the statement.
 * (NSString *)successToken - a token, used when calling back on success.
 * (NSString *)errorToken - a token, used when calling back on failure.
 *
 * Types:
 * rowset - returns an implementation-dependent value allowing the backend to identify a result set, in some arbitrary format.
 * row, array - returns the result set as JSON objects. Row is a convenience method for returning a single row for appropriate queries.
 * file - statement is a file path, parameters are null. The backend loads the file, and treats the contents as a block of opaque SQL
 * to add to the list of operations.
 */
- (void)tx:(NSString *)txId appendToTransactionScript:(NSArray *)log;

/*
 * Stops recording database operations for a transaction, executes them, and calls appropriate callbacks.
 */
- (void)endTransaction:(NSString *)txId;

/**
 * The tokens are produced if the Javascript asked for resultsets. Occassionally, this is unused. This is a method to let Javascript tell us 
 * that we can clean them up.
 */
- (void)disposeToken:(NSString*) token;


@end

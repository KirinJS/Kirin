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



#import "DatabasesBackend.h"
#import <sqlite3.h>
#import "Kirin.h"
#import "SQLiteDatabase.h"
#import "Connection.h"
#import "Transaction.h"
#import "SQLOperation.h"
#import "JSON.h"


#define KEY_TRANSACTION_ID @"txId"

@interface DatabasesBackend ()

@property(nonatomic) dispatch_queue_t readOnlyDispatchQueue;
@property(nonatomic) dispatch_queue_t readWriteDispatchQueue;

- (void) doEndTransaction: (Transaction*) tx;

@end

@implementation DatabasesBackend

@synthesize readOnlyDispatchQueue = readOnlyDispatchQueue_;
@synthesize readWriteDispatchQueue = readWriteDispatchQueue_;

#pragma mark -
#pragma mark Database Management Methods

- (void)tx:(NSString *)txId appendToScript:(NSArray *)log 
{
    Transaction *tx = [transactionsById objectForKey:txId];
    
    if (tx == nil) {
        
        NSLog(@"Asked to append SQL operations %@ to an 'on open' transaction with id %@ when there was none.", log, txId);
        return;
    }
    
    NSArray* logEntry;
    
    NSEnumerator* e = [log objectEnumerator];
    
    while((logEntry = [e nextObject])){
        
        SQLOperation *op = [[[SQLOperation alloc] initWithType:[logEntry objectAtIndex:0] andStatement:[logEntry objectAtIndex:1] andParameters:[logEntry objectAtIndex:2] onSuccessCall:[logEntry objectAtIndex:3] onErrorCall:[logEntry objectAtIndex:4]] autorelease];
        
        [tx add: op];
        
    }
    
}

- (void)tx:(NSString *)id appendToOpenerScript:(NSArray *)log
{
	//NSLog(@"DatabasesBackend.tx:%@ appendToOpenerScript:%@", id, log);
    
    [self tx:id appendToScript:log];
    
    ///NSLog(@"Added SQL operations %@ to 'on open' transaction %@.", log, id);
    
}

-(void)db:(NSString *)name openOrCreate:(NSDictionary *)args
{
    NSLog(@"DatabasesBackend.db:%@ openOrCreate:%@", name, args);
    
    NSString *filename = [args objectForKey:@"filename"];
    NSNumber *schemaVersionToOpenWith = [args objectForKey:@"version"];
    NSString *txId = [args objectForKey:@"txId"];

    NSString *onOpened = [args objectForKey:@"onOpenedToken"];

    NSString *onError = [args objectForKey:@"onErrorToken"];
    
    @try {
        
        NSNumber *schemaVersion = [self currentSchemaVersion:name];
        
        NSObject <Connection> *connection = [db open:name backedByFile:filename];
        NSLog(@"Opened a connection to %@: %@ current version: %@ requested version: %@", name, connection, schemaVersion, schemaVersionToOpenWith);
        
        [connectionsByName setObject:connection forKey:name];
        
        Transaction *openTx = [[Transaction alloc] initWithTxId:txId onConnection:connection forWriting:YES onSuccessCall:onOpened onErrorCall:onError];
        
        [transactionsById setObject:openTx forKey:txId];
        
        if (schemaVersion == nil) {
            
            // The schema needs initialising - the database was just created.
            
            openTx.schemaVersionOnCommit = schemaVersionToOpenWith;
            
            NSLog(@"CREATING NEW SCHEMA tx %@ has version on commit %@ (from store %@)", [openTx txId], [openTx schemaVersionOnCommit],
                  [[transactionsById objectForKey:txId] schemaVersionOnCommit]);
            [self.kirinHelper jsCallback:@"onCreateToken" fromConfig:args];
//            [KIRIN runCallback:onCreate withArgument:nil];
            
        }
        else {
            
            int comparison = [schemaVersion compare:schemaVersionToOpenWith];
            
            if (comparison == NSOrderedSame) {
                [self.kirinHelper jsCallback:@"onOpenedToken" fromConfig:args];                
//                [KIRIN runCallback:onOpened withArgument:nil];
                
            }
            else {
                
                // The schema needs updating.
                
                openTx.schemaVersionOnCommit = schemaVersionToOpenWith;                
                
                
                NSLog(@"UPDATING NEW SCHEMA tx %@ has version on commit %@ (from store %@)", [openTx txId], [openTx schemaVersionOnCommit],
                      [[transactionsById objectForKey:txId] schemaVersionOnCommit]);
                
                [self.kirinHelper jsCallback:@"onUpdateToken" 
                                  fromConfig:args 
                                withArgsList:[NSString stringWithFormat: @"%d, %d", 
                                              schemaVersion,   
                                              schemaVersionToOpenWith]];

                
//                [KIRIN runCallback:onUpdate withArgument:nil];
                
            }
            
        }
        
    }
    @catch (NSException *exception) {
        [self.kirinHelper jsCallback:onError 
                        withArgsList:[NSString stringWithFormat: @"'%@'", [exception description]]];
//        [KIRIN runCallback:onError withArgument:[exception description]];
        [self.kirinHelper cleanupCallback:args withNames:@"onErrorToken", @"onOpenedToken", @"onUpdateToken", @"onCreateToken", nil];
    }
    
}

- (void) saveCurrentSchemaVersion:(NSString *)name andVersion: (NSNumber*) version
{
    
    NSString* documents = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents"];
    
    NSString* file = [documents stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.ver",name]];
    
    NSMutableDictionary* dic = [[NSMutableDictionary alloc] init];

    if(version == nil){
        [dic setObject:[NSNull null] forKey:@"version"];
    } else {
        [dic setObject:version forKey:@"version"];
    }
    [dic writeToFile:file atomically:YES];
    
    [dic release];
    
}

- (NSNumber *) currentSchemaVersion:(NSString *)name
{
    
    NSString* documents = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents"];
    
    NSString* file = [documents stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.ver",name]];
    
    if([[NSFileManager defaultManager] fileExistsAtPath:file])
    {
        NSDictionary* dic = [NSDictionary dictionaryWithContentsOfFile:file];
        
        NSObject* guy = [dic objectForKey:@"version"];
        
        if([guy isKindOfClass:[NSNull class]]) return nil;
        
        return (NSNumber*)guy;
    }
    
    return nil;
}

#pragma mark -
#pragma mark Transaction Methods

- (void)beginTransaction:(NSDictionary *)details
{
	NSLog(@"DatabasesBackend.beginTransaction:%@", details);
    
    NSString *txId = [details objectForKey:@"txId"];
    
    if ([transactionsById objectForKey:txId] != nil) return;
    
    NSString *onSuccess = [details objectForKey:@"onSuccessToken"];
    NSString *onError = [details objectForKey:@"onErrorToken"];
    bool readOnly = [details objectForKey:@"readOnly"];
    NSString *databaseName = [details objectForKey:@"dbName"];
    
    NSLog(@"onSuccess=%@, onError=%@, readOnly=%d, databaseName=%@, txId=%@", onSuccess, onError, readOnly, databaseName, txId);
    
    if (txId == nil) {
        
        NSLog(@"Asked to begin a transaction with no \"id\" parameter: %@", details);
        
        return;
        
    }
    
    id <Connection> connection = [connectionsByName objectForKey:databaseName];
    
    NSLog(@"connection for %@ = %@", databaseName, connection);
    
    Transaction *tx = [[[Transaction alloc] initWithTxId:txId onConnection:connection forWriting:!readOnly onSuccessCall:onSuccess onErrorCall:onError] autorelease];
    
    [transactionsById setObject:tx forKey:txId];
    
    NSLog(@"Put tx %@ into the dictionary under key %@", tx, txId);
    
}

- (void)tx:(NSString *)txId appendToTransactionScript:(NSArray *)log
{
	//NSLog(@"DatabasesBackend.tx:%@ appendToTransactionScript:%@", txId, log);
    
    
    
    [self tx:txId appendToScript:log];
    
    //NSLog(@"Added SQL operations %@ to transaction %@.", log, txId);
    
}


- (void) cleanupAfterEndTransaction:(Transaction*) tx 
{    
    NSEnumerator* enumerator = [[tx operations] objectEnumerator];
 
    NSMutableArray* callbacks = [[[NSMutableArray alloc] init] autorelease];

    SQLOperation* op;
    
    while((op = [enumerator nextObject])){
        // check if we have an onSuccess callback to cleanup
        if (![op.onSuccess isKindOfClass:[NSNull class]]) {
            [callbacks addObject:op.onSuccess];
        }
        
        // check if we have an onError callback to cleanup.
        if (![op.onError isKindOfClass:[NSNull class]]) {
            [callbacks addObject:op.onError];
        }
    }

    // check if we have an onSuccess callback to cleanup
    if (![tx.onSuccess isKindOfClass:[NSNull class]]) {
        [callbacks addObject:tx.onSuccess];
    }
    
    // check if we have an onError callback to cleanup.
    if (![tx.onError isKindOfClass:[NSNull class]]) {
        [callbacks addObject:tx.onError];        
    }
    
    // call deleteCallback once with all callbacks that need to be deleted.
    [self.kirinHelper cleanupCallbacks:callbacks];
//    [KIRIN fireEventIntoJS:[NSString stringWithFormat:@"native2js.deleteCallback('%@')", [callbacks componentsJoinedByString:@"', '"]]];
    
    [transactionsById removeObjectForKey:tx.txId];

}

- (void)endTransaction:(NSString *)txId
{

    
	NSLog(@"DatabasesBackend.endTransaction:%@", txId);

    Transaction *tx = [transactionsById objectForKey:txId];
    void (^block)(void) = ^{
        [self doEndTransaction: tx];
    };
    
    dispatch_async(tx.readOnly ? self.readOnlyDispatchQueue : self.readWriteDispatchQueue, block);    
}

- (void) doEndTransaction: (Transaction*) tx {
    

    NSMutableArray* data = [[NSMutableArray alloc] init];
    
    NSEnumerator* enumerator = [[tx operations] objectEnumerator];
    
    bool successful = false;
    
    SQLOperation* op;
    
    @try {
        
        [tx.connection executeBlock: @"BEGIN TRANSACTION;"];
        
        while((op = [enumerator nextObject])){       
            //NSLog(@"[DatabasesBackend] exe: READY");
            
            NSString* sql =  [op sql];
            
            NSLog(@"[DatabasesBackend] exe: %@", sql);
            
            if(op.type == file) {
            
                [tx.connection executeBlock: sql];
                
                // we need to keep the data array the 
                // same size as the operations array.
                [data addObject: [NSNull null]];
                
            } else {
            
                // actually run the SQL in the database.
                [data addObject: [tx.connection execute: sql withParameters: op.parameters]];     
                
            }
            
            //NSLog(@"[DatabasesBackend] exe: DONE");
            
        }

        [tx.connection executeBlock:@"COMMIT;"];
        
        NSNumber *newSchemaVersion = tx.schemaVersionOnCommit;
        
        if (newSchemaVersion != nil) {
            // we should only have a schema version on an create or update.
            
            NSLog(@"Updating current schema version from %@ to %@", [self currentSchemaVersion:[tx.connection name]], newSchemaVersion);
            
            [self saveCurrentSchemaVersion:[tx.connection name] andVersion:newSchemaVersion];
            
            NSLog(@"Saved current schema version as %@", newSchemaVersion);
        }
        
        successful = true;
        
    }
    @catch (NSException *exception) {
        
        NSLog(@"[DatabasesBackend] Couldn't execute a transaction: %@", exception);
        
        @try {
            [tx.connection executeBlock:@"ROLLBACK TRANSACTION;"];
        }
        @catch (NSException *exception) {
            NSLog(@"[DatabasesBackend] Couldn't roll back a transaction: %@", exception);
        }
        
        if (![op.onError isKindOfClass:[NSNull class]]) {
            [self.kirinHelper jsCallback:op.onError withArgsList:@"'SQL problem'"];
//            [KIRIN runCallbackWithoutDelete:op.onError withArgument:@"'SQL problem'"];

        }

        if (![tx.onError isKindOfClass:[NSNull class]]) {
            [self.kirinHelper jsCallback:op.onError withArgsList:@"'SQL problem'"];            
//            [KIRIN runCallbackWithoutDelete:tx.onError withArgument:@"'SQL problem'"];
            
        }
        
        [data removeAllObjects];
        [data release];
        data = nil;
        
        [self cleanupAfterEndTransaction: tx];

        return;
        
    }
    
    enumerator = [[tx operations] objectEnumerator];
    
    int i = 0;
    
    while((op = [enumerator nextObject])){
        
        NSArray *arg = [data objectAtIndex:i++];
        
        if ([op.onSuccess isKindOfClass:[NSNull class]]) {
            
            // if we don't have any onSuccess to tell, we don't need to do any further work.
            continue;
            
        }
        
        if (![arg isKindOfClass:[NSArray class]]) {
            
            arg = nil;
            
        }
        
        // Try to call back as many success callbacks as possible - log and skip any that fail.
        @try {
            
            // Only return a unique result if there actually was one - raise an exception otherwise.
            if (op.type == row) {
                
                if ([arg count] != 1) {

                    NSLog(@"Ask for a unique result, but found %d rows. ", [arg count]);
                    NSLog(@"Statement: %@", [op sql]);
                    
                }
                
                [self.kirinHelper jsCallback:op.onSuccess withArgsList:[[arg objectAtIndex:0] JSONRepresentation]];
//                [KIRIN runCallbackWithoutDelete:op.onSuccess withArgument: [[arg objectAtIndex:0] JSONRepresentation]];
                    
                
                
            }
            else if (op.type == array) {
                [self.kirinHelper jsCallback:op.onSuccess withArgsList:[arg JSONRepresentation]];                
//                [KIRIN runCallbackWithoutDelete:op.onSuccess withArgument: [arg JSONRepresentation]];
                
            } else if (op.type == rowset) {
                
                // put into a drop box for retrieval later on by the ui.

                NSString* token = [[self.kirinHelper dropbox]
                                   putObject:arg 
                                                      withTokenPrefix:@"resultset"];

                [self.kirinHelper jsCallback:op.onSuccess withArgsList:[NSString stringWithFormat:@"'%@'", token]];
                
                // NSString* token = [KIRIN dropboxPut:arg withTokenPrefix:@"resultset"];
//                [KIRIN runCallbackWithoutDelete:op.onSuccess withArgument: [NSString stringWithFormat:@"'%@'", token]];
                
//                [KIRIN runCallbackWithoutDelete:op.onSuccess withArgument: [arg JSONRepresentation]];
                
            }
            
        }
        @catch (NSException *exception) {
            
            NSLog(@"[DatabasesBackend] Couldn't run a success callback for %@: %@", op, exception);
            
        } 
        @finally {
            
        }
        
    }
    
    [data removeAllObjects];
    [data release];
    data = nil;
    
    if (![tx.onSuccess isKindOfClass:[NSNull class]]) {
        [self.kirinHelper jsCallback:tx.onSuccess];
//        [KIRIN runCallback:tx.onSuccess withArgument:nil];
    }
    [self cleanupAfterEndTransaction: tx];
    
}


                     
 - (void)raiseException:(NSString *)_name withReason:(NSString *)_reason
{
    NSException *e = [NSException exceptionWithName:_name reason:_reason userInfo:nil];
    
    [e raise];
}

- (void)disposeToken:(NSString*) token {
    [self.kirinHelper.dropbox disposeObjectWithToken:token];
}

#pragma mark -
#pragma mark Lifecycle

- (id)init {
    self = [super initWithModuleName:@"Databases"];
    if (self) {
        db = [[SQLiteDatabase alloc] init];
        connectionsByName = [[NSMutableDictionary alloc] init];
        transactionsById = [[NSMutableDictionary alloc] init];
        
        self.readOnlyDispatchQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
        self.readWriteDispatchQueue = dispatch_queue_create("com.futureplatforms.kirin.databases.write", NULL);
        
    }
    return self;
}

- (dispatch_queue_t) dispatchQueue {
    return dispatch_queue_create("com.futureplatforms.kirin.databases", NULL);
}

- (void)dealloc {
    [connectionsByName release];
    [transactionsById release];
    [db release];
    self.readOnlyDispatchQueue = nil;
    self.readWriteDispatchQueue = nil;
    [super dealloc];
}

@end

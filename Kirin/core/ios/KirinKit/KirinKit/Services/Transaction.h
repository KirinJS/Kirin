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
#import "SQLOperation.h"
#import "Connection.h"

@interface Transaction : NSObject {

    NSString *txId;
    NSMutableArray *operations;
    NSString *onSuccess;
    NSString *onError;
    bool readOnly;
    id <Connection> connection;
    NSNumber *schemaVersionOnCommit;

}

@property (nonatomic, retain) NSString *txId;
@property (nonatomic, assign) bool readOnly;
@property (nonatomic, retain) NSString *onSuccess;
@property (nonatomic, retain) NSString *onError;
@property (nonatomic, retain) id <Connection> connection;
@property (nonatomic, retain) NSNumber *schemaVersionOnCommit;

/*
 * Adds an SQL operation to the list of operations that comprise this
 * transaction.
 */
- (void)add:(SQLOperation *)sqlOperation;

/*
 * Adds a list of SQL operations to the list of operations that comprise this
 * transaction.
 */
- (void)addAll:(NSArray *)sqlOperations;

/*
 * Gets all the operations forming part of this transaction.
 * This will return an immutable copy of the operations array, autoreleased. Retain it
 * if you need it for some time.
 */
- (NSArray *)operations;

- (id)initWithTxId:(NSString *)_txId onConnection:(id <Connection>)_connection forWriting:(bool)readWrite onSuccessCall:(NSString *)_onSuccess onErrorCall:(NSString *)_onError;

@end


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



#import "Transaction.h"

@implementation Transaction

@synthesize txId;
@synthesize readOnly;
@synthesize onSuccess;
@synthesize onError;
@synthesize connection;
@synthesize schemaVersionOnCommit;

- (void)add:(SQLOperation *)sqlOperation
{
    [operations addObject:sqlOperation];
}

- (void)addAll:(NSArray *)sqlOperations
{
    [operations addObjectsFromArray:sqlOperations];
}

- (NSArray *)operations
{
    return [[[NSArray alloc] initWithArray:operations] autorelease];
}

- (id)init {
    self = [super init];
    if (self) {
        operations = [[NSMutableArray alloc] init];
    }
    return self;
}

- (id)initWithTxId:(NSString *)_txId onConnection:(id <Connection>)_connection forWriting:(bool)readWrite onSuccessCall:(NSString *)_onSuccess onErrorCall:(NSString *)_onError{
    self = [super init];
    if (self) {
        self.txId = _txId;
        self.onSuccess = _onSuccess;
        self.onError = _onError;
        self.readOnly = !readWrite;
        self.connection = _connection;
        operations = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void)dealloc {
    [schemaVersionOnCommit release];
    [operations release];
    [txId release];
    [onSuccess release];
    [onError release];
    [connection release];
    [super dealloc];
}

@end
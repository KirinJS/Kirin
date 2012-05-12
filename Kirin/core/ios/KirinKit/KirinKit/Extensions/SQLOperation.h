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

typedef enum sqlOperationType {rowset, row, array, file} SQLOperationType;

/*
 * Atomic SQL operations that form part of a transaction.
 *
 * They all take the following form:
 *
 * - type | statement | parameters | onSuccess | onError
 *
 * type can be:
 *
 * - rowset
 * - row
 * - array
 * - file
 *
 * File types have no parameters, and the statement is a filename used to locate
 * a file full of SQL that needs to be executed as a block. This type is used to
 * fit DDL and DML used to initialise the database into a convenient format - it can
 * consist of a lot of SQL.
 */
@interface SQLOperation : NSObject {
    
    SQLOperationType type;
    NSString *statement;
    NSArray *parameters;
    NSString *onSuccess;
    NSString *onError;
    
}

@property (nonatomic, assign) SQLOperationType type;
@property (nonatomic, retain) NSString *statement;
@property (nonatomic, retain) NSString *onSuccess;
@property (nonatomic, retain) NSString *onError;
@property (nonatomic, retain) NSArray *parameters;
/*
 * Gets the SQL needed to execute this operation. In most cases this is the text in the
 * statement field, but if this is a file type, this method will find and read the file.
 * This method may raise an exception, and also may involve some heavy operations (like
 * file access) and so results should be cached.
 * This method lives here so that we can test dereferencing code without having to
 * involve the database or javascript.
 */
- (NSString *)sql;

- (id)initWithType:(NSString*)_type andStatement:(NSString *)_statement andParameters:(NSArray *)parameters onSuccessCall:(NSString *)_onSuccess onErrorCall:(NSString *)_onError;


@end

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



#import "SQLOperation.h"
#import <KirinKit/Kirin.h>
#import <KirinKit/KirinPaths.h>

@implementation SQLOperation

@synthesize type;
@synthesize statement;
@synthesize onSuccess;
@synthesize onError;
@synthesize parameters;

- (id)initWithType:(NSString*)_type andStatement:(NSString *)_statement andParameters:(NSArray *)_parameters onSuccessCall:(NSString *)_onSuccess onErrorCall:(NSString *)_onError
{
    self = [super init];
    if (self) {
        if([_type isEqualToString:@"rowset"]) self.type = rowset;
        if([_type isEqualToString:@"row"]) self.type = row;
        if([_type isEqualToString:@"array"]) self.type = array;
        if([_type isEqualToString:@"file"]) self.type = file;
        self.statement = _statement;
        self.onSuccess = _onSuccess;
        self.onError = _onError;
        
        // TODO ensure that NSNull is replaced with nil.
        
        self.parameters = _parameters;
    }
    return self;
}

- (NSString *)sql
{
    if (self.type != file) return self.statement;
    
    NSError* err = nil;
    
    NSString* filename = [KirinPaths pathForResource: self.statement];
    
    NSLog(@"<SQL OPPERATION> using file: %@", filename);
    
    NSString *string = [NSString stringWithContentsOfFile:filename 
                              encoding:NSUTF8StringEncoding 
                                 error:&err];
    
    //NSLog(@"<SQL OPPERATION> using sql: %@", string);
    
    
    if(err) {
        [NSException raise:[err localizedDescription] format:@"[Failed to load SQL file] Reason:  %@",[err localizedFailureReason]];
    }
    
    return string;
    
}

- (void)dealloc {
    [parameters release];
    [statement release];
    [onSuccess release];
    [onError release];
    [super dealloc];
}

@end
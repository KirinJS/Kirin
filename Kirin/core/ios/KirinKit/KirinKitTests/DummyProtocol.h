//
//  DummyProtocol.h
//  KirinKit
//
//  Created by James Hugman on 31/03/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//


@protocol DummyProtocol <NSObject>

- (void) method0;

- (void) methodWithInt: (int) integer;

- (void) methodWithArray: (NSArray*) array;

- (void) methodWithDictionary: (NSDictionary*) dict;
   
- (void) methodWithBool: (BOOL) boolean;

- (void) methodWithArgs: (int) arg0 : (BOOL) arg1;

- (void) methodWithString: (NSString*) string;

- (void) methodWithNumber: (NSNumber*) number;

@end

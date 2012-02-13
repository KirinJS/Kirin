//
//  KirinArgs.h
//  KirinKit
//
//  Created by James Hugman on 11/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinHelper.h"

@interface KirinArgs : KirinHelper


+ (NSString*) string: (NSString*) string;

+ (NSString*) untaintedForDisplay: (NSString*) string;

+ (NSString*) taintedForJs: (NSString*) string;

+ (NSString*) object: (NSDictionary*) object;

+ (NSString*) array: (NSArray*) array;

+ (NSString*) integer: (int) number;

+ (NSString*) boolean: (BOOL) boolean;

+ (NSString*) args: (NSString*) arg, ... 
NS_REQUIRES_NIL_TERMINATION;

@end

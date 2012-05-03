//
//  KirinArgs.m
//  KirinKit
//
//  Created by James Hugman on 11/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinArgs.h"

#import "JSON.h"

@implementation KirinArgs

+ (NSString*) string: (NSString*) string {
    return [NSString stringWithFormat:@"\"%@\"", string];
}

+ (NSString*) untaintedForDisplay: (NSString*) string {
    return [string stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
}

+ (NSString*) taintedForJs: (NSString*) string {
    return [NSString stringWithFormat:@"\"%@\"", 
            [string stringByAddingPercentEscapesUsingEncoding: NSUTF8StringEncoding]];
}

+ (NSString*) array: (NSArray*) object {
    return [object JSONRepresentation];
}

+ (NSString*) object: (NSDictionary*) object {
    return [object JSONRepresentation];
}

+ (NSString*) integer: (int) number {
    return [NSString stringWithFormat:@"%d", number];
}

+ (NSString*) number: (NSNumber*) number {
    return [number stringValue];
}

+ (NSString*) boolean: (BOOL) boolean {
    return boolean ? @"true" : @"false";
}

+ (NSString*) args:(NSString *)argument, ... {
    NSMutableArray* argArray = [NSMutableArray array];
    va_list args;
    va_start(args, argument);
    for (NSString *object = argument; object != nil; object = va_arg(args, NSString*)) {
        [argArray addObject:object];
    }  
    va_end(args);
    return [argArray componentsJoinedByString:@", "];
}

+ (BOOL) isNull: (id) arg {
    return arg == nil || [arg isKindOfClass:[NSNull class]];
}

@end

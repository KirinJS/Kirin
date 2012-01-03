//
//  DummyNativeContext.m
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "DummyNativeContext.h"


@implementation DummyNativeContext

- (NSArray*) methodNamesFor: (id) obj {
    NSMutableArray* methods = [[NSMutableArray alloc] initWithCapacity:1];
    [methods addObject:@"dummyMethod:WithArgs:"];
    return methods;
    
}

@end

//
//  DummyJSContext.m
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "DummyJSContext.h"


@implementation DummyJSContext
@synthesize jsCalls;

- (id) init {
    self = [super init];
    if (self) {
        self.jsCalls = [[NSMutableArray alloc] init];
    }
    return self;
}

- (void) js: (NSString*) js {
    NSLog(@"javascript: %@", js);
    [jsCalls addObject:js];
}

- (void) registerObject: (NSObject*) obj asName: (NSString*) name {
    NSLog(@"Registering proxy for %@", name);
    
    [self js: [NSString stringWithFormat:@"kirin.loadProxyForModule('%@', %@)",  name, @"[empty]"]];
}

- (void) unregisterObject: (NSString*) name {
    [self js: [NSString stringWithFormat:@"kirin.unloadProxyForModule('%@')",  name]];
}

- (void) reset {
    [self.jsCalls removeAllObjects];
}

- (void) dealloc {
    self.jsCalls = nil;
    [super dealloc];
}

@end

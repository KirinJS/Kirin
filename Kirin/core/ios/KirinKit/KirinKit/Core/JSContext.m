//
//  JSContext.m
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "JSContext.h"
#import "JSON.h"


@interface JSContext (private)
 
    
@end

@implementation JSContext

@synthesize jsExecutor;

- (id) init {
    return [self initWithJSExecutor: nil];
}

- (id) initWithJSExecutor:(id<JSExecutor>) executor {
    self = [super init];
    if (self) {
        self.jsExecutor = executor;
    }
    return self;
}

- (void) dealloc {
    self.jsExecutor = nil;
    [super dealloc];
}

- (void) jsOnMainThread: (NSString*) js {
    if (jsExecutor) {
        [self.jsExecutor execJS:js];
    } else {
        NSLog(@"No JSExecutor! javascript: %@", js);
    }
}

- (void) js: (NSString*) js {
    [self performSelectorOnMainThread:@selector(jsOnMainThread:) withObject:js waitUntilDone:NO];
}



- (void) registerObjectProxy: (NSString*) name withMethods:(NSArray*) methods {
    NSString* methodJSON = [[[methods componentsJoinedByString:@"','"] componentsSeparatedByString:@":"] componentsJoinedByString:@"_"];
    [self js: [NSString stringWithFormat:@"EXPOSED_TO_NATIVE.native2js.loadProxyForModule('%@', ['%@'])",  name, methodJSON]];
}

- (void) unregisterObjectProxy: (NSString*) name {
    [self js: [NSString stringWithFormat:@"EXPOSED_TO_NATIVE.native2js.unloadProxyForModule('%@')",  name]];
}


@end

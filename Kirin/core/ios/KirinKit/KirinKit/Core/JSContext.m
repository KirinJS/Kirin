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

- (void) execJS:(NSString *)js {
    [self js:js];
}

- (void) js: (NSString*) js {
    if ([NSThread isMainThread]) {
        [self jsOnMainThread:js];
    } else {
        [self performSelectorOnMainThread:@selector(jsOnMainThread:) withObject:js waitUntilDone:NO];
    }
}

@end

//
//  DummyNativeObject.m
//  KirinKit
//
//  Created by James Hugman on 24/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "DummyNativeObject.h"

@implementation DummyNativeObject

@synthesize lastArg = lastArg_;
@synthesize lastMethod = lastMethod_;

- (void) methodWithNoArgs {
    self.lastMethod = _cmd;
    self.lastArg = nil;
}

- (void) methodWithArg: (NSString*) string0 {
    self.lastArg = string0;
    self.lastMethod = _cmd;

}

- (void) methodWithArg: (NSString*) string0 andArg: (NSString*) string1 {
    self.lastMethod = _cmd;
    self.lastArg = string1;
}

- (void) methodWithArg: (NSString*) string0 andArg: (NSString*) string1 andArg: (NSString*) string3 {
    self.lastMethod = _cmd;
    self.lastArg = string3;
}

- (void) methodWithError {
    [self performSelector:@selector(nosuchmethod)];
}

- (void) dealloc {
    [super dealloc];
}

@end

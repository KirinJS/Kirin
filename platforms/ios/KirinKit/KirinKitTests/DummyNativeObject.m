//
//  DummyNativeObject.m
//  KirinKit
//
//  Created by James Hugman on 24/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "DummyNativeObject.h"
#import "JSON.h"

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

- (void) methodWithInt: (int) arg {
    self.lastMethod = _cmd;
    self.lastArg = [NSString stringWithFormat:@"%d", arg];
}

- (void) methodWithNumber: (NSNumber*) arg {
    self.lastMethod = _cmd;
    self.lastArg = [NSString stringWithFormat:@"%@", arg];
}

- (void) methodWithBoolean: (BOOL) arg {
    self.lastMethod = _cmd;
    self.lastArg = arg ? @"YES" : @"NO";
}

- (void) methodWithShort: (short) arg {
    self.lastMethod = _cmd;
    self.lastArg = [NSString stringWithFormat:@"%d", arg];
}

- (void) methodWithFloat: (float) arg {
    self.lastMethod = _cmd;
    self.lastArg = [NSString stringWithFormat:@"%.1f", arg];
}

- (void) methodWithDouble: (double) arg {
    self.lastMethod = _cmd;
    self.lastArg = [NSString stringWithFormat:@"%.2f", arg];
}

- (void) methodWithLong: (long) arg {
    self.lastMethod = _cmd;
    self.lastArg = [NSString stringWithFormat:@"%d", arg];
}


- (void) methodWithString: (NSString*) arg {
    self.lastMethod = _cmd;
    self.lastArg = arg;
}

- (void) methodWithDict: (NSDictionary*) arg {
    self.lastMethod = _cmd;
    self.lastArg = [arg JSONRepresentation];
}

- (void) methodWithArray: (NSArray*) arg {
    self.lastMethod = _cmd;
    self.lastArg = [arg JSONRepresentation];
}

- (void) dealloc {
    self.lastArg = nil;
    self.lastMethod = nil;
    [super dealloc];
}

@end

//
//  NativeContextTest.m
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "NativeContextTest.h"

#import "DebugConsole.h"

@implementation NativeContextTest 



- (void) setUp {
    nativeObjects = [[NSMutableDictionary alloc] init];
    nativeCtx = [[NativeContext alloc] initWithDictionary:nativeObjects];
    jsCtx = [[DummyJSContext alloc] init];
}

- (void) tearDown {
    [nativeObjects release];
    [nativeCtx release];
    [jsCtx release];
}

- (void) testExecuteFromUrl {
    [nativeCtx registerNativeObject:jsCtx asName:@"OBJ"];
    [nativeCtx executeCommandFromModule:@"OBJ" andMethod:@"js_" andArgsList:@"[\"aNativeArgument\"]"];
    STAssertEqualObjects(@"aNativeArgument", [jsCtx.jsCalls objectAtIndex: 0], @"Method execution");
    
    [nativeCtx executeCommandFromModule:@"OBJ" andMethod:@"reset" andArgsList:@""];
    // there should be no calls remember if reset has been called.
    STAssertTrue(0 == [jsCtx.jsCalls count], @"Callback cleanup");
}

- (void) testExecuteLog {
    [nativeCtx registerNativeObject:[[DebugConsole alloc] init] asName:@"Log"];
    [nativeCtx executeCommandFromModule:@"Log" andMethod:@"log_atLevel_" andArgsList:@"[\"Test Log message\", \"INFO\"]"];
}

@end
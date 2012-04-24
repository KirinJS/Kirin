//
//  NativeContextTest.m
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "NativeContextTest.h"

#import "DebugConsole.h"
#import "DummyNativeObject.h"

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

- (void) testExecuteCommandWithMultipleArgs {
    DummyNativeObject* obj = [[[DummyNativeObject alloc] init] autorelease];
    [nativeCtx registerNativeObject:obj asName:@"obj"];
    
    obj.lastArg = nil;
    [nativeCtx executeCommandFromModule:@"obj" andMethod:@"methodWithNoArgs" andArgsList:@"[]"];
    STAssertEquals(@selector(methodWithNoArgs), obj.lastMethod, @"No args");
    STAssertNil(obj.lastArg, @"Arg is not nil");
    
    [nativeCtx executeCommandFromModule:@"obj" andMethod:@"methodWithArg" andArgsList:@"[\"string0\"]"];
    STAssertEquals(@selector(methodWithArg:), obj.lastMethod, @"One arg");    
    STAssertEqualObjects(@"string0", obj.lastArg, @"One arg");
    
    [nativeCtx executeCommandFromModule:@"obj" andMethod:@"methodWithArgAndArg" andArgsList:@"[\"string0\", \"string1\"]"];
    STAssertEquals(@selector(methodWithArg:andArg:), obj.lastMethod, @"Two arg");    
    STAssertEqualObjects(@"string1", obj.lastArg, @"Two arg");
    
//    [nativeCtx executeCommandFromModule:@"obj" andMethod:@"methodWithArgAndArgAndArg" andArgsList:@"[\"string0\", \"string1\", \"string2\"]"];
//    STAssertEquals(@selector(methodWithArg:andArg:), obj.lastMethod, @"Two arg");    
//    STAssertEqualObjects(@"string2", obj.lastArg, @"Two arg");
}

@end
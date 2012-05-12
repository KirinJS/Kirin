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
    
    [nativeCtx executeCommandFromModule:@"obj" andMethod:@"methodWithArgAndArgAndArg" andArgsList:@"[\"string0\", \"string1\", \"string2\"]"];
    STAssertEquals(@selector(methodWithArg:andArg:andArg:), obj.lastMethod, @"Two arg");    
    STAssertEqualObjects(@"string2", obj.lastArg, @"Two arg");
    
    @try {
        [nativeCtx executeCommandFromModule:@"obj" andMethod:@"methodWithError" andArgsList:@"[]"];
    }
    @catch (NSException *exception) {
        STFail(@"Exception should've been caught already");
    }
}

- (void) testMethodName: (NSString*) methodName 
           withArgsList: (NSString*) argsList 
             shouldCall: (SEL) selector
                withArg: (NSString*) receivedArg {
    DummyNativeObject* obj = [[[DummyNativeObject alloc] init] autorelease];
    [nativeCtx registerNativeObject:obj asName:@"obj"];

    obj.lastArg = nil;

    // DummyNativeObject will catch the argument it is sent, and represent it as a string.
    [nativeCtx executeCommandFromModule:@"obj" andMethod:methodName andArgsList:argsList];
    STAssertEquals(selector, obj.lastMethod, methodName);    
    STAssertEqualObjects(receivedArg, obj.lastArg, methodName);
    
    [nativeCtx unregisterNativeObject:@"obj"];
    
}

- (void) testDifferentTypes {

    // primitives
    [self testMethodName:@"methodWithBoolean" 
            withArgsList:@"[true]" 
              shouldCall:@selector(methodWithBoolean:) 
                 withArg:@"YES"];
    [self testMethodName:@"methodWithBoolean" 
            withArgsList:@"[false]" 
              shouldCall:@selector(methodWithBoolean:) 
                 withArg:@"NO"];
    
    [self testMethodName:@"methodWithInt" 
            withArgsList:@"[42]" 
              shouldCall:@selector(methodWithInt:) 
                 withArg:@"42"];
    
    [self testMethodName:@"methodWithShort" 
            withArgsList:@"[42]" 
              shouldCall:@selector(methodWithShort:) 
                 withArg:@"42"];    
    
    [self testMethodName:@"methodWithFloat" 
            withArgsList:@"[42.0]" 
              shouldCall:@selector(methodWithFloat:) 
                 withArg:@"42.0"];   
    
    [self testMethodName:@"methodWithDouble" 
            withArgsList:@"[42.0]" 
              shouldCall:@selector(methodWithDouble:) 
                 withArg:@"42.00"];  
    
    [self testMethodName:@"methodWithLong" 
            withArgsList:@"[42]" 
              shouldCall:@selector(methodWithLong:) 
                 withArg:@"42"];  
    
    // objects.
    [self testMethodName:@"methodWithNumber" 
            withArgsList:@"[42]" 
              shouldCall:@selector(methodWithNumber:) 
                 withArg:@"42"];

    [self testMethodName:@"methodWithString" 
            withArgsList:@"[\"a string\"]" 
              shouldCall:@selector(methodWithString:) 
                 withArg:@"a string"];    
    
    [self testMethodName:@"methodWithDict" 
            withArgsList:@"[{\"foo\": 1}]" 
              shouldCall:@selector(methodWithDict:) 
                 withArg:@"{\"foo\":1}"];
    
    [self testMethodName:@"methodWithArray" 
            withArgsList:@"[[1,2,3,4]]" 
              shouldCall:@selector(methodWithArray:) 
                 withArg:@"[1,2,3,4]"];
}

@end
//
//  KirinProxyTest.m
//  KirinKit
//
//  Created by James Hugman on 31/03/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinProxyTest.h"

#import <KirinKit/KirinProxy.h>
#import <KirinKit/JSExecutor.h>

#import "DummyJSContext.h"
#import "DummyProtocol.h"
#import "DummyValueObject.h"
#import "DummyResponseValueObject.h"

#import "KirinProxyWithDictionary.h"

#import "JSON.h"

@interface KirinProxyTest ()
@property(retain, nonatomic) KirinProxy* proxy;
@property(retain, nonatomic) id<DummyProtocol> dummy;
@property(retain, nonatomic) DummyJSContext* jsContext;
@property(retain, nonatomic) NSString* module;
@end

@implementation KirinProxyTest

@synthesize proxy = proxy_;
@synthesize jsContext = jsContext_;
@synthesize dummy = dummy_;
@synthesize module = module_;

- (void) setUp {
    self.module = @"DummyModule";
    self.jsContext = [[DummyJSContext alloc] initWithJSExecutor:nil];
    self.proxy = [KirinProxy proxyWithProtocol: @protocol(DummyProtocol) 
                                 andModuleName: self.module 
                                   andExecutor: self.jsContext];
    self.dummy = (id<DummyProtocol>) self.proxy;
}

- (void) tearDown {
    self.module = nil;
    self.jsContext = nil;
    self.proxy = nil;
    self.dummy = nil;
}

- (void) testMethodCallingIntoJS {
    [self.dummy method0];
    NSString* expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_JS, self.module, @"method0"];
    STAssertEqualObjects(
                expectedCall, 
                self.jsContext.lastCall, 
                @"js isn't equal"
    );
    

    
    [self.dummy methodWithArray:[NSArray array]];
    expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithArray", @"[[]]"];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
    
    [self.dummy methodWithDictionary:[NSDictionary dictionary]];
    expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithDictionary", @"[{}]"];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
    
    
    [self.dummy methodWithString:@"Hello"];
    expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithString", @"[\"Hello\"]"];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );

    
    [self.dummy methodWithNumber:[NSNumber numberWithFloat:1.5f]];
    expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithNumber", @"[1.5]"];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
    
}

- (void) testMultiArgs {
    [self.dummy methodWithArgs:1 :YES];
    NSString* expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithArgs", @"[1,true]"];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
}

- (void) testRespondsToSelector {
    STAssertTrue([self.dummy respondsToSelector:@selector(method0)], @"Should respond to method0");
    
    STAssertFalse([self.dummy respondsToSelector:@selector(methodNotThere)], @"Should not respond to methodNotThere");
}

- (void) testProxyForGettersOnly {
    NSMutableDictionary* dictionary = [NSMutableDictionary dictionary];
    id<DummyValueObject> proxy = [KirinProxy proxyWithProtocol:@protocol(DummyValueObject) andDictionary:dictionary andExecutor:self.jsContext];


    // objects
    [dictionary setObject:@"aString" forKey:@"string"];    
    STAssertEqualObjects(@"aString", [proxy string], @"string is wrong");
    STAssertEqualObjects(@"aString", proxy.string, @"string is wrong");

    // NSNumber
    [dictionary setObject:[NSNumber numberWithInt:2] forKey:@"numberObject"];
    STAssertEqualObjects([NSNumber numberWithInt:2], proxy.numberObject, @"number object is wrong");
    
    // int
    [dictionary setObject:[NSNumber numberWithInt:1] forKey:@"number"];
    STAssertEquals(1, proxy.number, @"number is wrong");
    
    
    // boolean
    [dictionary setObject:[NSNumber numberWithBool:YES] forKey:@"boolean"];
    STAssertTrue(proxy.boolean, @"boolean is wrong");
    [dictionary setObject:[NSNumber numberWithBool:NO] forKey:@"boolean"];
    STAssertFalse(proxy.boolean, @"boolean is wrong");    
    
    // float
    [dictionary setObject:[NSNumber numberWithFloat:42.0f] forKey:@"aFloat"];
    STAssertEquals(42.0f, proxy.aFloat, @"float is wrong");
    
    // long
    [dictionary setObject:[NSNumber numberWithLong:42l] forKey:@"aLong"];
    STAssertEquals(42l, proxy.aLong, @"long is wrong");

    // double
    [dictionary setObject:[NSNumber numberWithDouble:42.0] forKey:@"aDouble"];
    STAssertEquals(42.0, proxy.aDouble, @"double is wrong");
    
    // short
    [dictionary setObject:[NSNumber numberWithShort:(short) 42] forKey:@"aShort"];
    STAssertEquals((short) 42, proxy.aShort, @"short is wrong");

    // nil
    [dictionary removeObjectForKey:@"stringNotThere"];
    STAssertNil([proxy stringNotThere], @"nil is wrong");

    [dictionary removeObjectForKey:@"intNotThere"];
    STAssertEquals(0, [proxy intNotThere], @"Value is wrongly initialized");

}

- (void) testProxyForRequestObjectCallbacks {
    NSMutableDictionary* dictionary = [NSMutableDictionary dictionary];
    id<DummyValueObject> proxy = [KirinProxy proxyWithProtocol:@protocol(DummyValueObject) andDictionary:dictionary andExecutor:self.jsContext];
    NSString* expectedCall;
    
    [dictionary setObject:@"callback001" forKey:@"callback"];
    [proxy callback];
    expectedCall = [NSString stringWithFormat:EXECUTE_CALLBACK_JS, @"callback001"];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
    
    
    [dictionary setObject:@"errback001" forKey:@"errbackwithStatus"];
    [proxy errback:@"foo" withStatus:42];
    expectedCall = [NSString stringWithFormat:EXECUTE_CALLBACK_WITH_ARGS_JS, @"errback001", @"[\"foo\",42]"];
    STAssertEqualObjects(
                         expectedCall,
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
}


- (void) testProxyForResponseObject {
    NSMutableDictionary* dictionary = [NSMutableDictionary dictionary];
    id<DummyResponseValueObject> proxy = [KirinProxy proxyWithProtocol:@protocol(DummyResponseValueObject) andMutableDictionary:dictionary];
    
    proxy.string = @"foo";
    STAssertEqualObjects([dictionary objectForKey:@"string"], @"foo", [NSString stringWithFormat:@"String is wrong: %@", dictionary]);
    
    
    [proxy setString: @"bar"];
    STAssertEqualObjects([dictionary objectForKey:@"string"], @"bar", [NSString stringWithFormat:@"String is wrong: %@", dictionary]);
    
    [proxy setInteger:4];
    STAssertEqualObjects([dictionary objectForKey:@"integer"], [NSNumber numberWithInt:4], [NSString stringWithFormat:@"Integer is wrong: %@", dictionary]);

    proxy.boolean = YES;
    STAssertEqualObjects([dictionary objectForKey:@"boolean"], [NSNumber numberWithBool:YES], @"Bool is wrong");
    
    proxy.boolean = NO;
    STAssertEqualObjects([dictionary objectForKey:@"boolean"], [NSNumber numberWithBool:NO], @"Bool is wrong");
    
    NSMutableArray* args = [NSMutableArray array];

    
    STAssertEqualObjects([args JSONRepresentation], @"[]",@"JSON doesn't match");
    
    [args addObject:proxy];
    
    NSArray* newArray = [[args JSONRepresentation] JSONValue];
    STAssertEqualObjects(dictionary, [newArray objectAtIndex:0], @"JSON roundtripping not working");
}

- (void) testRequestResponse {
    
    NSMutableDictionary* requestParams = [NSMutableDictionary dictionary];
        // set up the callback
    [requestParams setObject:@"callback002" forKey:@"respond"];
    id<DummyValueObject> request = [KirinProxy proxyWithProtocol:@protocol(DummyValueObject) andDictionary:requestParams andExecutor:self.jsContext];
    

    
    
    NSMutableDictionary* dictionary = [NSMutableDictionary dictionary];
    id<DummyResponseValueObject> response = [KirinProxy proxyWithProtocol:@protocol(DummyResponseValueObject) andMutableDictionary:dictionary];
    
    response.boolean = YES;
//    [response setInteger:43];
//    response.string = @"bar";
    
    [request respond:response];
    
    NSString* expectedCall;
    expectedCall = [NSString stringWithFormat:EXECUTE_CALLBACK_WITH_ARGS_JS, @"callback002", @"[{\"boolean\":true}]"];
    STAssertEqualObjects(
                         expectedCall,
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
    
}

- (void) testCleanupCallbacks {
    NSMutableDictionary* requestParams = [NSMutableDictionary dictionary];
    // set up the callback
    [requestParams setObject:@"callback002" forKey:@"respond"];
    id<DummyValueObject> request = [KirinProxy proxyWithProtocol:@protocol(DummyValueObject) andDictionary:requestParams andExecutor:self.jsContext];
    
    KirinProxyWithDictionary<DummyValueObject> *requestObject = request;
    
    [requestObject cleanupCallbacks];

    NSString* expectedCall;
    expectedCall = [NSString stringWithFormat:DELETE_CALLBACK_JS, @"[\"callback002\"]"];
    STAssertEqualObjects(
                         expectedCall,
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
    
    
}


@end

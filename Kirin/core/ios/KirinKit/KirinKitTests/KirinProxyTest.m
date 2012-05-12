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

- (void) testProxyForDictionary {
    NSMutableDictionary* dictionary = [NSMutableDictionary dictionary];
    id<DummyValueObject> proxy = [KirinProxy proxyWithProtocol:@protocol(DummyValueObject) andDictionary:dictionary];


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


@end

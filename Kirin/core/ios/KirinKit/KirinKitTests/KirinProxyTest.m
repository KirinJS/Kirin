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

- (void) testSingleArg {
//    NSLog(@"[self.dummy method0];");
    [self.dummy method0];
    NSString* expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_JS, self.module, @"method0"];
    
    STAssertEqualObjects(
                expectedCall, 
                self.jsContext.lastCall, 
                @"js isn't equal"
    );
    

    
    [self.dummy methodWithArray:[NSArray array]];
    expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithArray", @"[]"];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
    
    [self.dummy methodWithDictionary:[NSDictionary dictionary]];
    expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithDictionary", @"{}"];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
    
    
    [self.dummy methodWithString:@"Hello"];
    expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithString", @"\"Hello\""];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );

    
    [self.dummy methodWithNumber:[NSNumber numberWithFloat:1.5f]];
    expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithNumber", @"1.5"];
    STAssertEqualObjects(
                         expectedCall, 
                         self.jsContext.lastCall, 
                         @"js isn't equal"
                         );
    
}

- (void) testMultiArgs {
    [self.dummy methodWithArgs:1 :YES];
    NSString* expectedCall = [NSString stringWithFormat:EXECUTE_METHOD_WITH_ARGS_JS, self.module, @"methodWithArgs", @"1, true"];
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

@end

//
//  KirinHelperTest.m
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "KirinHelperTest.h"
#import "JSON.h"
#import "DummyNativeContext.h"

@implementation KirinHelperTest

- (void)setUp
{
    [super setUp];
    ctx = [[DummyJSContext alloc] init];
    DummyNativeContext* nativeContext = [[DummyNativeContext alloc] init];
    helper = [[KirinHelper alloc] initWithModuleName: @"TestModule" andNativeObject: self andJsContext: ctx andNativeContext: nativeContext andState:nil];
    STAssertNotNil(helper, @"Helper should not be nil");
    
}

- (void)tearDown
{
    // Tear-down code here.
    [ctx release];
    [helper release];
    [super tearDown];
}

- (void) testHelperLifecycle 
{
    STAssertEqualObjects(@"TestModule", helper.jsModuleName, @"Helper's module name is wrong");
    
    [helper onLoad];
    
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.loadProxyForModule('TestModule', ['dummyMethod_WithArgs_'])", [ctx.jsCalls objectAtIndex:0], @"loading didn't work");
    
    [ctx reset];
    
    [helper onUnload];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.unloadProxyForModule('TestModule')", [ctx.jsCalls objectAtIndex:0], @"unloading didn't work");
}

- (void) testJsExecMethod {
    [helper jsMethod:@"doStuff"];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execMethod('TestModule', 'doStuff')", [ctx.jsCalls objectAtIndex:0], @"Method calling");
    
    [ctx reset];
    
    [helper jsMethod:@"doStuff" withArgsList: @"42, 'foo'"];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execMethod('TestModule', 'doStuff', [42, 'foo'])", [ctx.jsCalls objectAtIndex:0], @"Method calling");    
    
    [ctx reset];
    
    [helper jsMethod:@"doStuff" withArgsList: @""];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execMethod('TestModule', 'doStuff')", [ctx.jsCalls objectAtIndex:0], @"Method calling");    
    
    [ctx reset];
    
    [helper jsMethod:@"doStuff" withArgsList: nil];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execMethod('TestModule', 'doStuff')", [ctx.jsCalls objectAtIndex:0], @"Method calling");    
}

- (void) testJsExecCallback {
    [helper jsCallback:@"cb0001"];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execCallback('cb0001')", [ctx.jsCalls objectAtIndex:0], @"Callback calling");
    
    [ctx reset];
    
    [helper jsCallback:@"cb0001WithArgs" withArgsList: @""];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execCallback('cb0001WithArgs')", [ctx.jsCalls objectAtIndex:0], @"Callback calling");

    [ctx reset];
    
    [helper jsCallback:@"cb0001WithArgs" withArgsList: nil];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execCallback('cb0001WithArgs')", [ctx.jsCalls objectAtIndex:0], @"Callback calling");
    
}

- (void) testJsExecCallbackWithConfig {
    NSMutableDictionary* config = [[[NSMutableDictionary alloc] init] autorelease];
    [config setValue:@"callback0001" forKey:@"onSuccess"];
    [config setValue:@"errback0001" forKey:@"onError"];
    
    [helper jsCallback:@"onSuccess" fromConfig:config];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execCallback('callback0001')", [ctx.jsCalls objectAtIndex:0], @"Config Callback calling");

    [ctx reset];
    [helper jsCallback:@"onSuccess" fromConfig:config withArgsList:@"2, 'bar', []"];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execCallback('callback0001', [2, 'bar', []])", [ctx.jsCalls objectAtIndex:0], @"Config Callback calling");

    [ctx reset];
    [helper jsCallback:@"onError" fromConfig:config];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execCallback('errback0001')", [ctx.jsCalls objectAtIndex:0], @"Config Callback calling");
    
    [ctx reset];
    [helper jsCallback:@"onError" fromConfig:config withArgsList:@"2, 'bar', []"];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.execCallback('errback0001', [2, 'bar', []])", [ctx.jsCalls objectAtIndex:0], @"Config Callback calling");
    
    

}
    
- (void) testJsRemoveCallback {
    [helper cleanupCallback:@"cb001", @"eb001", nil];
    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.deleteCallback(['cb001', 'eb001'])", [ctx.jsCalls objectAtIndex:0], @"Callback cleanup");
    
    [ctx reset];
    [helper cleanupCallback:nil];
    // there should be no extra call.
    STAssertTrue(0 == [ctx.jsCalls count], @"Callback cleanup");
}

- (void) testJsRemoveCallbackWithConfig {
    NSMutableDictionary* config = [[[NSMutableDictionary alloc] init] autorelease];
    [config setValue:@"callback0001" forKey:@"onSuccess"];
    [config setValue:@"errback0001" forKey:@"onError"];
    
    [helper cleanupCallback:config withNames:@"onSuccess", @"onError", nil];
    

    STAssertEqualObjects(@"EXPOSED_TO_NATIVE.native2js.deleteCallback(['callback0001', 'errback0001'])", [ctx.jsCalls objectAtIndex:0], @"Callback cleanup");
    
    [ctx reset];
    [helper cleanupCallback:nil withNames:@"onSuccess", @"onError", nil];
    // there should be no extra call.
    STAssertTrue(0 == [ctx.jsCalls count], @"Callback cleanup");
}
@end
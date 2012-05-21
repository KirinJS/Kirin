//
//  KirinProxyWithModule.m
//  KirinKit
//
//  Created by James Hugman on 26/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinProxyWithModule.h"

#import "JSON.h"


@interface KirinProxyWithModule ()


@property(retain, nonatomic) id<JSExecutor> jsExecutor;
@property(retain, nonatomic) NSString* moduleName;

@end

@implementation KirinProxyWithModule

@synthesize jsExecutor = jsExecutor_;
@synthesize moduleName = moduleName_;

- (id) initWithProtocol: (Protocol*) protocol andModuleName: (NSString*) moduleName andExecutor: (id<JSExecutor>) executor {
    
    self = [super initWithProtocol: protocol];
    if (self) {
        self.jsExecutor = executor;
        self.moduleName = moduleName;
    }
    return self;
}


- (void) forwardInvocation: (NSInvocation*) invocation {

    
    NSString* methodName = [self getMethodNameForSelector: invocation.selector];

    
    NSMethodSignature* sig = invocation.methodSignature;
    unsigned numArgs = [sig numberOfArguments];
    if (numArgs == 2) {
        [self.jsExecutor execJS:[NSString stringWithFormat: EXECUTE_METHOD_JS, self.moduleName, methodName]];
        return;
    }
    NSArray* args = [self getArgsFromSignature:sig andInvocation:invocation];
    
    NSString* jsString = [NSString stringWithFormat: EXECUTE_METHOD_WITH_ARGS_JS, self.moduleName, methodName, [args JSONRepresentation]];
    
    [self.jsExecutor execJS:jsString];
}


- (void) dealloc {
    self.jsExecutor = nil;
    self.moduleName = nil;
    [super dealloc];
}

@end

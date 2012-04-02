//
//  KirinProxy.m
//  KirinKit
//
//  Created by James Hugman on 31/03/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinProxy.h"

#import "JSON.h"

#import <objc/runtime.h>



@interface KirinProxy ()

- (id) initWithProtocol: (Protocol*) protocol andModuleName: (NSString*) moduleName andExecutor: (id<JSExecutor>) executor;

@property(retain, nonatomic) Protocol* targetProtocol;
@property(retain, nonatomic) id<JSExecutor> jsExecutor;
@property(retain, nonatomic) NSString* moduleName;
@end

@implementation KirinProxy

@synthesize targetProtocol = targetProtocol_;
@synthesize jsExecutor = jsExecutor_;
@synthesize moduleName = moduleName_;

+ (KirinProxy*) proxyWithProtocol: (Protocol*) protocol andModuleName: (NSString*) moduleName andExecutor: (id<JSExecutor>) executor {
    return [[[KirinProxy alloc] initWithProtocol:protocol andModuleName: moduleName andExecutor:executor] autorelease];
}

- (id) initWithProtocol: (Protocol*) protocol andModuleName: (NSString*) moduleName andExecutor: (id<JSExecutor>) executor {
    self = [super init];
    if (self) {
        self.moduleName = moduleName;
        self.targetProtocol = protocol;
        self.jsExecutor = executor;
    }
    return self;
}

- (void) dealloc {
    self.jsExecutor = nil;
    self.moduleName = nil;
    self.targetProtocol = nil;
    [super dealloc];
}

#pragma mark - 
#pragma mark Invocation magic

- (NSMethodSignature*) methodSignatureForSelector: (SEL) selector {
    // http://www.a-coding.com/2010/10/making-nsinvocations.html
    BOOL required = YES;
    struct objc_method_description desc = protocol_getMethodDescription(self.targetProtocol, selector, required, YES);
    if (desc.name == NULL) {
        required = NO;
        desc = protocol_getMethodDescription(self.targetProtocol, selector, required, YES);
    }
    if (desc.name == NULL)
        return nil;
    
    return [NSMethodSignature signatureWithObjCTypes:desc.types];
}

- (BOOL) respondsToSelector: (SEL) selector {
    BOOL required = YES;
    struct objc_method_description desc = protocol_getMethodDescription(self.targetProtocol, selector, required, YES);
    if (desc.name == NULL) {
        required = NO;
        desc = protocol_getMethodDescription(self.targetProtocol, selector, required, YES);
    }
    return (desc.name != NULL);
}

- (void) forwardInvocation: (NSInvocation*) invocation {
    NSMethodSignature* sig = invocation.methodSignature;
    SEL selector = invocation.selector;
    
    NSString* name = NSStringFromSelector(selector);
    
    NSString* methodName = [[name componentsSeparatedByString:@":"] componentsJoinedByString:@""];

    unsigned numArgs = [sig numberOfArguments];
    if (numArgs == 2) {
        [self.jsExecutor execJS:[NSString stringWithFormat: EXECUTE_METHOD_JS, self.moduleName, methodName]];
        return;
    }
         
    NSMutableArray* args = [NSMutableArray array];

    for(unsigned i = 2; i < numArgs; i++) {
        const char *type = [sig getArgumentTypeAtIndex: i];

        if (strcmp(type, @encode(id)) == 0) {
            // https://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html
            id arg = nil;
            [invocation getArgument:&arg atIndex:i];
            if (arg == nil) {
                [args addObject:@"null"];
            } else if ([arg isKindOfClass:[NSString class]]) {
                [args addObject:[NSString stringWithFormat:@"\"%@\"", arg]];
            } else if ([arg isKindOfClass:[NSDictionary class]]) {
                [args addObject:[arg JSONRepresentation]];
            } else if ([arg isKindOfClass:[NSArray class]]) {
                [args addObject:[arg JSONRepresentation]];
            } else if ([arg isKindOfClass:[NSNull class]]) {
                [args addObject:@"null"];
            } else {
                [args addObject:[NSString stringWithFormat:@"%@", arg]];
            } 
        } else if (strcmp(type, @encode(int)) == 0) {
            int arg = 0;
            [invocation getArgument:&arg atIndex:i];
            [args addObject: [NSString stringWithFormat:@"%d", arg]];
        } else if (strcmp(type, @encode(BOOL)) == 0) {
            BOOL arg = NO;
            [invocation getArgument:&arg atIndex:i];
            [args addObject: arg ? @"true" : @"false"];
        } else if (strcmp(type, @encode(float)) == 0) {
            float arg = 0.0f;
            [invocation getArgument:&arg atIndex:i];
            [args addObject: [NSString stringWithFormat:@"%f", arg]];
        } else if (strcmp(type, @encode(double)) == 0) {
            double arg = 0.0;
            [invocation getArgument:&arg atIndex:i];
            [args addObject: [NSString stringWithFormat:@"%f", arg]];
        } 
    }
    NSString* jsString = [NSString stringWithFormat: EXECUTE_METHOD_WITH_ARGS_JS, self.moduleName, methodName, [args componentsJoinedByString:@", "]];
    
    [self.jsExecutor execJS:jsString];
}

@end

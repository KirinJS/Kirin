//
//  KirinProxy.m
//  KirinKit
//
//  Created by James Hugman on 31/03/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinProxy.h"
#import "KirinProxyWithModule.h"
#import "KirinProxyWithDictionary.h"
#import "KirinProxyWithEmptyDictionary.h"

#import <objc/runtime.h>



@interface KirinProxy ()

- (id) initWithProtocol: (Protocol*) protocol;

@end

@implementation KirinProxy

@synthesize targetProtocol = targetProtocol_;


+ (id) proxyWithProtocol: (Protocol*) protocol andModuleName: (NSString*) moduleName andExecutor: (id<JSExecutor>) executor {
    return [[[KirinProxyWithModule alloc] initWithProtocol:protocol andModuleName: moduleName andExecutor:executor] autorelease];
}

+ (id) proxyWithProtocol:(Protocol *)protocol andDictionary:(NSDictionary *)dictionary andExecutor: (id<JSExecutor>) executor {
    return [[[KirinProxyWithDictionary alloc] initWithProtocol:protocol andDictionary: dictionary andExecutor: (id<JSExecutor>) executor] autorelease];
}

// Just setters, backed by a mutable dictionary;
+ (id) proxyWithProtocol:(Protocol *)protocol andMutableDictionary:(NSMutableDictionary *)dictionary {
    return [[[KirinProxyWithEmptyDictionary alloc] initWithProtocol:protocol andDictionary:dictionary] autorelease];
}

- (id) initWithProtocol: (Protocol*) protocol {
    self = [super init];
    if (self) {
        self.targetProtocol = protocol;
    }
    return self;
}

- (void) dealloc {
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
    return (desc.name != NULL) || [super respondsToSelector:selector];
}


- (NSArray*) getArgsFromSignature: (NSMethodSignature*) sig andInvocation: (NSInvocation*) invocation {
    NSMutableArray* args = [NSMutableArray array];
    
    for(unsigned i = 2, numArgs = [sig numberOfArguments]; i < numArgs; i++) {
        const char *type = [sig getArgumentTypeAtIndex: i];
        
        if (strcmp(type, @encode(id)) == 0) {
            // https://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html
            id arg = nil;
            [invocation getArgument:&arg atIndex:i];
            if (arg == nil) {
                [args addObject:[NSNull null]];
            } else if ([arg isKindOfClass:[NSString class]]) {
                [args addObject:arg];
            } else if ([arg isKindOfClass:[NSDictionary class]]) {
                [args addObject:arg];
            } else if ([arg isKindOfClass:[NSArray class]]) {
                [args addObject:arg];
            } else if ([arg isKindOfClass:[NSNull class]]) {
                [args addObject:arg];
            } else {
                // handles numbers.
                [args addObject:arg];
            } 
        } else if (strcmp(type, @encode(int)) == 0) {
            int arg = 0;
            [invocation getArgument:&arg atIndex:i];
            [args addObject: [NSNumber numberWithInt:arg]];
        } else if (strcmp(type, @encode(BOOL)) == 0) {
            BOOL arg = NO;
            [invocation getArgument:&arg atIndex:i];
            [args addObject: [NSNumber numberWithBool:arg]];
        } else if (strcmp(type, @encode(float)) == 0) {
            float arg = 0.0f;
            [invocation getArgument:&arg atIndex:i];
            [args addObject: [NSNumber numberWithFloat:arg]];
        } else if (strcmp(type, @encode(double)) == 0) {
            double arg = 0.0;
            [invocation getArgument:&arg atIndex:i];
            [args addObject: [NSNumber numberWithDouble:arg]];
        } 
    }
    return args;
}

- (NSString*) getMethodNameForSelector: (SEL) selector {
    
    NSString* name = NSStringFromSelector(selector);
    
    // TODO: will this need to be camel cased? 
    return [[name componentsSeparatedByString:@":"] componentsJoinedByString:@""];
}


- (void) handleGettingReturnType: (char) returnType withResult: (id) result andInvocation: (NSInvocation*) invocation {
    if (result == nil) {
        return;
    }
    if (returnType == @encode(id)[0]) {    
        if ([result isKindOfClass:[NSNull class]]) {
            result = nil;
        }
        [invocation setReturnValue:&result];
    } else if ([result isKindOfClass: [NSNumber class]]) {
        NSNumber* num = (NSNumber*) result;
        if (returnType == @encode(int)[0]) {
            int value = [num intValue];
            [invocation setReturnValue:&value];
        } else if (returnType == @encode(BOOL)[0]) {
            BOOL value = [num boolValue];
            [invocation setReturnValue:&value];
        } else if (returnType == @encode(float)[0]) {
            float value = [num floatValue];
            [invocation setReturnValue:&value];
        } else if (returnType == @encode(double)[0]) {
            double value = [num doubleValue];
            [invocation setReturnValue:&value];
        } else if (returnType == @encode(long)[0]) {
            long value = [num longValue];
            [invocation setReturnValue:&value];
        } else if (returnType == @encode(short)[0]) {
            short value = [num shortValue];
            [invocation setReturnValue:&value];
        }
    }
}

@end

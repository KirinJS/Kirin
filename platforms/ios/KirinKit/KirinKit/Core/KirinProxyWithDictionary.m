//
//  KirinProxyWithDictionary.m
//  KirinKit
//
//  Created by James Hugman on 26/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinProxyWithDictionary.h"

#import "JSON.h"

#import <objc/runtime.h>

@interface KirinProxyWithDictionary ()

@property(nonatomic, retain) NSDictionary* dictionary;
@property(nonatomic, retain) id<JSExecutor> jsExecutor;

@end

@implementation KirinProxyWithDictionary

@synthesize dictionary = dictionary_;
@synthesize jsExecutor = jsExecutor_;

- (id) initWithProtocol: (Protocol*) protocol andDictionary: (NSDictionary*) dictionary andExecutor: (id<JSExecutor>) executor {
    self = [super initWithProtocol:protocol];
    if (self) {
        self.dictionary = dictionary;
        self.jsExecutor = executor;
    }
    return self;
}

- (void) cleanupCallbacks {
    int i=0;
    unsigned int mc = 0;
    struct objc_method_description * mlist = protocol_copyMethodDescriptionList(self.targetProtocol, YES, YES, &mc);
    
    NSMutableArray* callbackIds = [NSMutableArray arrayWithCapacity:mc];
    
    for(i=0;i<mc;i++) {
        struct objc_method_description method = mlist[i];
        char returnType = method.types[0];
        if (returnType == @encode(void)[0]) {
            // we have a callback
            NSString* methodName = [self getMethodNameForSelector: method.name];    
            NSObject* callbackId = [self.dictionary objectForKey:methodName];
            if ([callbackId isKindOfClass:[NSString class]]) {
                [callbackIds addObject:callbackId]; 
            }
        }
    }
    
    free(mlist);
    
    if ([callbackIds count] > 0) {
        [self.jsExecutor execJS:[NSString stringWithFormat: DELETE_CALLBACK_JS, [callbackIds JSONRepresentation]]];
    }
}

- (void) forwardInvocation: (NSInvocation*) invocation {
    NSMethodSignature* sig = invocation.methodSignature;

    NSString* methodName = [self getMethodNameForSelector:invocation.selector];    
    
    
    id result = [self.dictionary objectForKey:methodName];
    char returnType = [sig methodReturnType][0];
    if (returnType == @encode(void)[0]) {
        // call a callback if return type is void
        if (!result || [result isKindOfClass:[NSNull class]]) {
            return;
        }
        if (![result isKindOfClass:[NSString class]]) {
            NSLog(@"Method name %@ does not encode for a callback. Callback id is a non-string: %@", methodName, result);
            return;
        }
        
        NSString* callbackId = (NSString*) result;
        
        NSMethodSignature* sig = invocation.methodSignature;
        unsigned numArgs = [sig numberOfArguments];
        if (numArgs == 2) {
            [self.jsExecutor execJS:[NSString stringWithFormat: EXECUTE_CALLBACK_JS, callbackId]];
            return;
        }
        NSArray* args = [self getArgsFromSignature:sig andInvocation:invocation];
        NSString* jsString = [NSString stringWithFormat: EXECUTE_CALLBACK_WITH_ARGS_JS, callbackId, [args JSONRepresentation]];
        [self.jsExecutor execJS:jsString];        
        return;
    }
    

    

    // handle getters

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

- (void) dealloc {
    self.dictionary = nil;
    self.jsExecutor = nil;
    [super dealloc];
}

@end

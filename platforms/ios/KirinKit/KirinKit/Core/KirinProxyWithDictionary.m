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
    if (result && returnType == @encode(void)[0]) {
        // call a callback if return type is void
        if (!result || [result isKindOfClass:[NSNull class]]) {
            return;
        }

        
        NSNumber* methodPresent = (NSNumber*) result;
        if (!methodPresent) {
            return;
        }
        NSString* callbackObjectId = [self.dictionary objectForKey:@"__id"];
        if (![callbackObjectId isKindOfClass:[NSString class]]) {
            NSLog(@"Object name %@ does not encode for a callback. Callback object id is a non-string: %@", methodName, callbackObjectId);
            return;
        }
        NSMethodSignature* sig = invocation.methodSignature;
        unsigned numArgs = [sig numberOfArguments];
        if (numArgs == 2) {
            [self.jsExecutor execJS:[NSString stringWithFormat: EXECUTE_CALLBACK_METHOD_JS, callbackObjectId, methodName]];
            return;
        }
        NSArray* args = [self getArgsFromSignature:sig andInvocation:invocation];
        NSString* jsString = [NSString stringWithFormat: EXECUTE_CALLBACK_METHOD_WITH_ARGS_JS, callbackObjectId, methodName, [args JSONRepresentation]];
        [self.jsExecutor execJS:jsString];
        return;
    }
    

    

    // handle getters
    [self handleGettingReturnType: returnType withResult: result andInvocation: invocation];
    
    
}



- (void) dealloc {
    self.dictionary = nil;
    self.jsExecutor = nil;
    [super dealloc];
}

@end

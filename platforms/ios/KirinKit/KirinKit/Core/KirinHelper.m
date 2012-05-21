//
//  KirinHelper.m
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "KirinHelper.h"
#import "JSON.h"
#import "KirinProxy.h"

@interface KirinHelper () 
@property(retain) JSContext* jsContext;
@property(retain) NativeContext* nativeContext;
@property(retain) KirinProxy* proxyForJSModule;
@end

@implementation KirinHelper

@synthesize jsModuleName = jsModuleName_;
@synthesize nativeObject = nativeObject_;
@synthesize state = state_;
@synthesize proxyForJSModule = proxyForJSModule_;
@synthesize jsContext = jsContext_;
@synthesize nativeContext = nativeContext_;

- (id) initWithModuleName: (NSString*) moduleName 
          andNativeObject: (NSObject*) obj 
             andJsContext: (JSContext*) ctx 
         andNativeContext: (NativeContext*) nativeCtx
                 andState: (KirinState*) state

{
    self = [super init];
	if (self) {
        self.jsModuleName = moduleName;
        self.nativeObject = obj;
        self.state = state;
        self.jsContext = ctx;
        self.nativeContext = nativeCtx;
    }
    return self;
}

- (void) onLoad {
    // register the object so as to be callable from Javascript.
    [self.nativeContext registerNativeObject:self.nativeObject asName:self.jsModuleName];
    
    // now tell the js what methods to construct a proxy with.
    NSArray* methods = [self.nativeContext methodNamesFor: self.jsModuleName];
    
    [self.jsContext js: [NSString stringWithFormat: REGISTER_MODULE_WITH_METHODS,  self.jsModuleName, [methods JSONRepresentation]]];
}

- (void) onUnload {
    [self.jsContext js: [NSString stringWithFormat: UNREGISTER_MODULE,  self.jsModuleName]];

    // possible race condition here. We should disallow any calls in onUnload() to native.
    [self.nativeContext unregisterNativeObject:self.jsModuleName];
}

- (void) jsMethod:(NSString *)methodName {
    [self jsMethod:methodName withArgsList:nil];
}

- (void) jsMethod:(NSString *)methodName withArgsList:(NSString*) argsList {
    if (argsList == nil || [argsList length] == 0) {
        [self.jsContext js:[NSString stringWithFormat: EXECUTE_METHOD_JS, self.jsModuleName, methodName]];
    } else {
        [self.jsContext js:[NSString stringWithFormat: DEPRECATED_EXECUTE_METHOD_WITH_ARGS_JS, self.jsModuleName, methodName, argsList]];
    }
}

- (void) jsMethod:(NSString *)methodName withArgArray:(NSArray*) argArray {
    if (argArray == nil || [argArray count] == 0) {
        [self.jsContext js:[NSString stringWithFormat: EXECUTE_METHOD_JS, self.jsModuleName, methodName]];
    } else {
        // we need to think about square brackets: 
        [self.jsContext js:[NSString stringWithFormat: EXECUTE_METHOD_WITH_ARGS_JS, self.jsModuleName, methodName, [argArray JSONRepresentation]]];
    }    
}

- (void) jsMethod:(NSString *)methodName withArgs:(NSObject *)argument, ... {
    // TODO test me.
    // TODO generalize me into a reusable block, or something.
    // TODO manage the memory a bit more tightly with all these arrays.
    NSMutableArray* argArray = [NSMutableArray array];
    va_list args;
    va_start(args, argument);
    for (NSObject *object = argument; object != nil; object = va_arg(args, NSObject*)) {
        [argArray addObject:object];
    }  
    va_end(args);
    [self jsMethod:methodName withArgArray:argArray];
}


- (void) jsCallback: (NSString*) callbackId {
    [self jsCallback:callbackId withArgsList:nil];
}

- (void) jsCallback: (NSString*) callbackId withArgsList:(NSString*) argsList {
    if (!callbackId || [callbackId isKindOfClass:[NSNull class]]) {
        return;
    }
    if (argsList == nil || [argsList length] == 0) {
        [self.jsContext js:[NSString stringWithFormat: EXECUTE_CALLBACK_JS, callbackId]];
    } else {
        [self.jsContext js:[NSString stringWithFormat: DEPRECATED_EXECUTE_CALLBACK_WITH_ARGS_JS, callbackId, argsList]];
    }    
}

- (void) jsCallback: (NSString*) callbackName fromConfig: (NSDictionary*) config {
    NSString* callbackId = [config objectForKey:callbackName];
    [self jsCallback:callbackId];
}

- (void) jsCallback: (NSString*) callbackName fromConfig: (NSDictionary*) config withArgsList:(NSString*) argsList {
    NSString* callbackId = [config objectForKey:callbackName];
    [self jsCallback:callbackId withArgsList:argsList];
}

- (void) jsCallback: (NSString*) callbackId withArgArray:(NSArray*) argArray {
    if (!callbackId || [callbackId isKindOfClass:[NSNull class]]) {
        return;
    }
    if (argArray == nil || [argArray count] == 0) {
        [self.jsContext js:[NSString stringWithFormat: EXECUTE_CALLBACK_JS, callbackId]];
    } else {
        [self.jsContext js:[NSString stringWithFormat: EXECUTE_CALLBACK_WITH_ARGS_JS, callbackId, [argArray JSONRepresentation]]];
    }
}

- (void) jsCallback: (NSString*) callbackId withArgs:(NSObject *)argument, ... {
    NSMutableArray* argArray = [NSMutableArray array];
    va_list args;
    va_start(args, argument);
    for (NSObject *object = argument; object != nil; object = va_arg(args, NSObject*)) {
        [argArray addObject:object];
    }  
    va_end(args);

    [self jsCallback:callbackId withArgArray:argArray];
}

- (void) jsCallback:(NSString *)callbackName fromConfig:(NSDictionary *)config withArgs:(NSObject *)argument, ... {
    NSString* callbackId = [config objectForKey:callbackName];
    if (!callbackId) {
        return;
    }
    NSMutableArray* argArray = [NSMutableArray array];
    va_list args;
    va_start(args, argument);
    for (NSObject *object = argument; object != nil; object = va_arg(args, NSObject*)) {
        [argArray addObject:object];
    }  
    va_end(args);
    
    [self jsCallback:callbackId withArgArray:argArray];
}

- (void) cleanupCallbacks:(NSArray*) callbackIds {
    if ([callbackIds count]) {
        [self.jsContext js:[NSString stringWithFormat: DELETE_CALLBACK_JS, [callbackIds JSONRepresentation]]];
    }
}

- (void) cleanupCallback:(NSString *)callbackId, ... {
    NSMutableArray* callbackIds = [NSMutableArray array];
    va_list args;
    va_start(args, callbackId);
    for (NSString *arg = callbackId; arg != nil; arg = va_arg(args, NSString*)) {
        [callbackIds addObject:arg];
    }
    va_end(args);
    [self cleanupCallbacks:callbackIds];
}

- (void) cleanupCallback:(NSDictionary *)config withNames:(NSString *)callbackName, ... {
    NSMutableArray* callbackIds = [NSMutableArray array];
    va_list args;
    va_start(args, callbackName);
    for (NSString *arg = callbackName; arg != nil; arg = va_arg(args, NSString*)) {
        NSString* callbackId = [config objectForKey:arg];
        if (callbackId && ![callbackId isKindOfClass:[NSNull class]]) {
            [callbackIds addObject:callbackId];
        }
    }
    va_end(args);
    [self cleanupCallbacks:callbackIds];
}

- (KirinDropbox*) dropbox {
    return self.state.dropbox;
}

- (id) proxyForJavascriptObject: (Protocol*) protocol {
    if (!self.proxyForJSModule) {
        self.proxyForJSModule = [KirinProxy proxyWithProtocol:protocol andModuleName:self.jsModuleName andExecutor:self.jsContext];
    }
    return self.proxyForJSModule;
}

- (id) proxyForJavascriptObject:(Protocol *)protocol andDictionary: (NSDictionary*) dictionary {
    return [KirinProxy proxyWithProtocol:protocol andDictionary:dictionary];
}

- (void) dealloc {
    self.jsContext = nil;
    self.nativeContext = nil;
    self.proxyForJSModule = nil;
    self.jsModuleName = nil;
    self.nativeObject = nil;
    self.state = nil;
    [super dealloc];
}

@end

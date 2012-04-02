//
//  KirinHelper.m
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "KirinHelper.h"
#import "JSON.h"

@interface KirinHelper () 
@property(retain) JSContext* jsContext;
@property(retain) NativeContext* nativeContext;

@end

@implementation KirinHelper

@synthesize jsModuleName;
@synthesize nativeObject;
@synthesize state = state_;

@synthesize jsContext = jsContext_;
@synthesize nativeContext = nativeObject_;

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
    [self.nativeContext registerNativeObject:self.nativeObject asName:jsModuleName];
    [self.jsContext registerObjectProxy: self.jsModuleName withMethods:[self.nativeContext methodNamesFor: nativeObject]];
}

- (void) onUnload {
    
    [self.jsContext unregisterObjectProxy:jsModuleName];
    
    // possible race condition here. We should disallow any calls in onUnload() to native.
    [self.nativeContext unregisterNativeObject:jsModuleName];

}

- (void) jsMethod:(NSString *)methodName {
    [self jsMethod:methodName withArgsList:nil];
}

- (void) jsMethod:(NSString *)methodName withArgsList:(NSString*) argsList {
    if (argsList == nil || [argsList length] == 0) {
        [self.jsContext js:[NSString stringWithFormat: EXECUTE_METHOD_JS, self.jsModuleName, methodName]];
    } else {
        [self.jsContext js:[NSString stringWithFormat: EXECUTE_METHOD_WITH_ARGS_JS, self.jsModuleName, methodName, argsList]];
    }
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
        [self.jsContext js:[NSString stringWithFormat: EXECUTE_CALLBACK_WITH_ARGS_JS, callbackId, argsList]];
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

- (void) cleanupCallbacks:(NSArray*) callbackIds {
    if ([callbackIds count]) {
        [self.jsContext js:[NSString stringWithFormat: @"EXPOSED_TO_NATIVE.native2js.deleteCallback(['%@'])", [callbackIds componentsJoinedByString:@"', '"]]];
    }
}

- (void) cleanupCallback:(NSString *)callbackId, ... {
    NSMutableArray* callbackIds = [[[NSMutableArray alloc] init] autorelease];
    va_list args;
    va_start(args, callbackId);
    for (NSString *arg = callbackId; arg != nil; arg = va_arg(args, NSString*)) {
        [callbackIds addObject:arg];
    }
    va_end(args);
    [self cleanupCallbacks:callbackIds];
}

- (void) cleanupCallback:(NSDictionary *)config withNames:(NSString *)callbackName, ... {
    NSMutableArray* callbackIds = [[[NSMutableArray alloc] init] autorelease];
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

- (void) dealloc {
    self.jsContext = nil;
    self.nativeContext = nil;
    
    self.jsModuleName = nil;
    self.nativeObject = nil;
    self.state = nil;
    [super dealloc];
}

@end

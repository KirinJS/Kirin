//
//  KirinHelper.m
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "KirinHelper.h"
#import "JSON.h"


@interface KirinHelper (private) 

@end

@implementation KirinHelper

@synthesize jsModuleName;
@synthesize nativeObject;
@synthesize dropbox;


- (id) initWithModuleName: (NSString*) moduleName 
          andNativeObject: (NSObject*) obj 
             andJsContext: (JSContext*) ctx 
         andNativeContext: (NativeContext*) nativeCtx
               andDropbox: (KirinDropbox*) dropBox

{
    self = [super init];
	if (self) {
        self.jsModuleName = moduleName;
        self.nativeObject = obj;
        self.dropbox = dropBox;
        jsContext = [ctx retain];
        nativeContext = [nativeCtx retain];
    }
    return self;
}

- (void) onLoad {
    [nativeContext registerNativeObject:nativeObject asName:jsModuleName];
    [jsContext registerObjectProxy: jsModuleName withMethods:[nativeContext methodNamesFor: nativeObject]];
}

- (void) onUnload {
    // TODO tell jsContext.
    
    [jsContext unregisterObjectProxy:jsModuleName];
    
    // possible race condition here. We should disallow any calls in onUnload() to native.
    [nativeContext unregisterNativeObject:jsModuleName];

}

- (void) jsMethod:(NSString *)methodName {
    [self jsMethod:methodName withArgsList:nil];
}

- (void) jsMethod:(NSString *)methodName withArgsList:(NSString*) argsList {
    if (argsList == nil || [argsList length] == 0) {
        [jsContext js:[NSString stringWithFormat: @"kirin.execMethod('%@', '%@')", jsModuleName, methodName]];
    } else {
        [jsContext js:[NSString stringWithFormat: @"kirin.execMethod('%@', '%@', [%@])", jsModuleName, methodName, argsList]];
    }
}

- (void) jsCallback: (NSString*) callbackId {
    [self jsCallback:callbackId withArgsList:nil];
}

- (void) jsCallback: (NSString*) callbackId withArgsList:(NSString*) argsList {
    if (!callbackId) {
        return;
    }
    if (argsList == nil || [argsList length] == 0) {
        [jsContext js:[NSString stringWithFormat: @"kirin.execCallback('%@')", callbackId]];
    } else {
        [jsContext js:[NSString stringWithFormat: @"kirin.execCallback('%@', [%@])", callbackId, argsList]];
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
        [jsContext js:[NSString stringWithFormat: @"kirin.deleteCallback(['%@'])", [callbackIds componentsJoinedByString:@"', '"]]];
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
        if (callbackId) {
            [callbackIds addObject:callbackId];
        }
    }
    va_end(args);
    [self cleanupCallbacks:callbackIds];
}

- (void) dealloc {
    
    [jsContext release];
    jsContext = nil;
    [nativeContext release];
    nativeContext = nil;
    
    self.jsModuleName = nil;
    self.nativeObject = nil;
    self.dropbox = nil;
    [super dealloc];
}

@end

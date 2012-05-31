//
//  KirinProxy.h
//  KirinKit
//
//  Created by James Hugman on 31/03/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>


#import "JSExecutor.h"

@interface KirinProxy : NSObject

@property(retain, nonatomic) Protocol* targetProtocol;

// Modules objects
+ (id) proxyWithProtocol:(Protocol*) protocol andModuleName:(NSString*) moduleName andExecutor:(id<JSExecutor>) executor;

// Requests from Javascript, with getters and callbacks
+ (id) proxyWithProtocol:(Protocol *)protocol andDictionary:(NSDictionary *)dictionary andExecutor: (id<JSExecutor>) executor;

// Just setters, backed by a mutable dictionary;
+ (id) proxyWithProtocol:(Protocol *)protocol andMutableDictionary:(NSMutableDictionary *)dictionary;


- (id) initWithProtocol: (Protocol*) protocol;

- (NSArray*) getArgsFromSignature: (NSMethodSignature*) sig andInvocation: (NSInvocation*) invocation;

- (NSString*) getMethodNameForSelector: (SEL) selector;

- (void) handleGettingReturnType: (char) returnType withResult: (id) result andInvocation: (NSInvocation*) invocation;

@end

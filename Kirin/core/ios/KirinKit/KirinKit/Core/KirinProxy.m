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

#import <objc/runtime.h>



@interface KirinProxy ()

- (id) initWithProtocol: (Protocol*) protocol;

@property(retain, nonatomic) Protocol* targetProtocol;
@end

@implementation KirinProxy

@synthesize targetProtocol = targetProtocol_;


+ (id) proxyWithProtocol: (Protocol*) protocol andModuleName: (NSString*) moduleName andExecutor: (id<JSExecutor>) executor {
    return [[[KirinProxyWithModule alloc] initWithProtocol:protocol andModuleName: moduleName andExecutor:executor] autorelease];
}

+ (id) proxyWithProtocol:(Protocol *)protocol andDictionary:(NSDictionary *)dictionary {
    return [[KirinProxyWithDictionary alloc] initWithProtocol:protocol andDictionary: dictionary];
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
    return (desc.name != NULL);
}


@end

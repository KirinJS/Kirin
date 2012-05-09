//
//  KirinProxyWithDictionary.m
//  KirinKit
//
//  Created by James Hugman on 26/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinProxyWithDictionary.h"

@interface KirinProxyWithDictionary ()

@property(nonatomic, retain) NSDictionary* dictionary;

@end

@implementation KirinProxyWithDictionary

@synthesize dictionary = dictionary_;

- (id) initWithProtocol: (Protocol*) protocol andDictionary: (NSDictionary*) dictionary {
    self = [super initWithProtocol:protocol];
    if (self) {
        self.dictionary = dictionary;
    }
    return self;
}

- (void) forwardInvocation: (NSInvocation*) invocation {
    NSMethodSignature* sig = invocation.methodSignature;
    SEL selector = invocation.selector;
    
    NSString* name = NSStringFromSelector(selector);
    

    
    NSString* methodName = [[name componentsSeparatedByString:@":"] componentsJoinedByString:@""];
    
    unsigned numArgs = [sig numberOfArguments];
    if (numArgs > 2) {
        [NSException raise:@"KirinProxyException" format:@"Message %@ has arguments, which are not supported by KirinProxyWithDictionary", methodName];
        return;
    }
    
    id result = [self.dictionary objectForKey:methodName];

    
    char returnType = [sig methodReturnType][0];

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
    [super dealloc];
}

@end

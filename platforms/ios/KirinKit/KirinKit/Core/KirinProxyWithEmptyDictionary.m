//
//  KirinProxyWithEmptyDictionary.m
//  KirinKit
//
//  Created by James Hugman on 18/05/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinProxyWithEmptyDictionary.h"

#import "JSON.h"

@interface KirinProxyWithEmptyDictionary ()

@property(nonatomic, retain) NSMutableDictionary* data;

@end

@implementation KirinProxyWithEmptyDictionary

@synthesize data = data_;

- (id) initWithProtocol:(Protocol *)protocol {
    return [self initWithProtocol:protocol andDictionary:[NSMutableDictionary dictionary]];
}

- (id) initWithProtocol:(Protocol *)protocol andDictionary: (NSMutableDictionary*) dictionary {
    self = [super initWithProtocol:protocol];
    if (self) {
        self.data = dictionary;
    }
    return self;
}

- (id) JSONValue {
    return [self.data JSONRepresentation];
}

- (id) proxyForJson {
    return self.data;
}

- (void) forwardInvocation: (NSInvocation*) invocation {
    NSString* methodName = [self getMethodNameForSelector:invocation.selector];


    if (invocation.selector == @selector(JSONValue)) {
        NSString* ret = [self.data JSONRepresentation];
        [invocation setReturnValue: &ret];
        return;
    } else if (invocation.selector == @selector(proxyForJson)) {
        [invocation setReturnValue: &data_];
        return;
    }
    

    NSMethodSignature* sig = [invocation methodSignature];
    char returnType = [sig methodReturnType][0];
    

    int start = -1;
    BOOL isGetter = NO;
    if (returnType == @encode(void)[0] && [methodName hasPrefix:@"set"] && [sig numberOfArguments] == 3) {
        start = 3;
    } else if (returnType != @encode(void)[0] && [sig numberOfArguments] == 2) {
        start = 0;
        isGetter = YES;
    }

    if (start < 0) {
        [NSException raise:@"KirinProxyException" format:@"Method %@ does not seem to be either a getter or a setter", methodName];
    }
    

    NSLog(@"We can do something with %@", methodName);
    if (isGetter) {
        // handle getters
        [self handleGettingReturnType: returnType withResult: [self.data objectForKey:methodName] andInvocation: invocation];
    } else {
        
        NSMutableString* propertyName = [NSMutableString stringWithString:methodName];
        [propertyName replaceCharactersInRange:NSMakeRange(0, start) withString:@""];    
        [propertyName replaceCharactersInRange:NSMakeRange(0, 1) withString:[[propertyName substringToIndex:1] lowercaseString]];
        
        NSArray* args = [self getArgsFromSignature:sig andInvocation:invocation];
        [self.data setObject:[args objectAtIndex:0] forKey:propertyName];
    }
    
}
    
    
    
    
    


@end

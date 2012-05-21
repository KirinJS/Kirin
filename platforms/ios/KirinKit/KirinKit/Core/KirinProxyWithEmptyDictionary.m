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
    NSLog(@"Method name called on response object is %@", methodName);
    
    if (invocation.selector == @selector(JSONValue)) {
        NSString* ret = [self.data JSONRepresentation];
        [invocation setReturnValue: &ret];
        return;
    } else if (invocation.selector == @selector(proxyForJson)) {
        [invocation setReturnValue: &data_];
    }
    

    
    if (![methodName hasPrefix:@"set"]) {
        [NSException raise:@"KirinProxyException" format:@"Can only support setters with this object, i.e. begin with 'set'"];
    }
    
    
    


    NSMutableString* propertyName = [NSMutableString stringWithString:methodName];
    [propertyName replaceCharactersInRange:NSMakeRange(0, 3) withString:@""];

    
    NSLog(@"First letter is %@", [propertyName substringToIndex:1]);
    
    [propertyName replaceCharactersInRange:NSMakeRange(0, 1) withString:[[propertyName substringToIndex:1] lowercaseString]];
    
    
    NSLog(@"Propertyname is %@", propertyName);
    NSMethodSignature* sig = invocation.methodSignature;
    NSArray* args = [self getArgsFromSignature:sig andInvocation:invocation];
    
    if ([args count] != 1) {
        [NSException raise:@"KirinProxyException" format:@"Can only support setters with this object, i.e. with a single argument"];
    }
    
    
    
    [self.data setObject:[args objectAtIndex:0] forKey:propertyName];

   // [invocation setReturnValue:&self];
}
    
    
    
    
    


@end

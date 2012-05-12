//
//  NativeObjectHolder.m
//  KirinKit
//
//  Created by James Hugman on 29/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "NativeObjectHolder.h"

#import <KirinKit/KirinExtensionOnMainThread.h>
#import <UIKit/UIViewController.h>

#import <objc/runtime.h>

@interface NativeObjectHolder ()

@property(nonatomic, retain) NSDictionary* methodsMap;

- (void) initializeMethodsMap;
- (NSString*) camelCasedMethodName: (NSString*) methodName;
- (NSString*) underscoredMethodName: (NSString*) methodName;

@end

@implementation NativeObjectHolder

@synthesize nativeObject = nativeObject_;
@synthesize dispatchQueue = dispatchQueue_;
@synthesize methodsMap = methodsMap_;

+ (NativeObjectHolder*) holderForObject: (NSObject*) object {
    NativeObjectHolder* holder = [[[NativeObjectHolder alloc] init] autorelease];
    holder.nativeObject = object;
    return holder;
}

- (void) setNativeObject:(NSObject*)nativeObject {
    
    [nativeObject retain];
    [nativeObject_ release];
    nativeObject_ = nativeObject;
    if (!nativeObject_) {
        self.dispatchQueue = nil;
        return;
    }
    
    if ([nativeObject isKindOfClass:[UIViewController class]]) {
        NSLog(@"Will dispatch to UIViewController %@ on the main thread", [nativeObject class]);
        self.dispatchQueue = nil;//dispatch_get_main_queue();
    } else if ([nativeObject conformsToProtocol:@protocol(KirinExtensionOnMainThread)]) {
        NSLog(@"Will dispatch to KirinExtensionWithUI %@ on the main thread", [nativeObject class]);
        self.dispatchQueue = nil;//dispatch_get_main_queue();
    } else {
        
        SEL getter = @selector(dispatchQueue);
        
        if ([nativeObject_ respondsToSelector:getter]) {
            self.dispatchQueue = (dispatch_queue_t) [nativeObject performSelector:getter];
        }
        
        if (self.dispatchQueue) {
            NSLog(@"Will dispatch to KirinExtension %@ on a custom dispatch queue", [nativeObject class]);
        } else {
            NSLog(@"Will dispatch to KirinExtension %@ on a global dispatch queue", [nativeObject class]);
            self.dispatchQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
        }
        
        
    }
    
    // generate the method names will use to call selectors on this object.
    self.methodsMap = nil;
    [self initializeMethodsMap];
}


- (NSString*) underscoredMethodName: (NSString*) methodName {
    return [[methodName componentsSeparatedByString:@":"] componentsJoinedByString:@"_"];
}


- (NSString*) camelCasedMethodName: (NSString*) methodName {
    NSMutableString *output = [NSMutableString string];
    BOOL makeNextCharacterUpperCase = NO;
    for (NSInteger idx = 0; idx < [methodName length]; idx += 1) {
        unichar c = [methodName characterAtIndex:idx];
        if (c == ':') {
            makeNextCharacterUpperCase = YES;
        } else if (makeNextCharacterUpperCase) {
            [output appendString:[[NSString stringWithCharacters:&c length:1] uppercaseString]];
            makeNextCharacterUpperCase = NO;
        } else {
            [output appendFormat:@"%C", c];
        }
    }
    return output;
}

- (void) initializeMethodsMap {
    if (self.methodsMap) {
        return;
    }
    NSMutableDictionary* methods = [NSMutableDictionary dictionary];
    
    self.methodsMap = methods;
    
    Class class = object_getClass(self.nativeObject);
    while (class) {
        int i=0;
        unsigned int mc = 0;
        Method * mlist = class_copyMethodList(class, &mc);
        
        for(i=0;i<mc;i++) {
            Method method = mlist[i];
            SEL selector = method_getName(method);
            NSString* realMethodName = NSStringFromSelector(selector);
            // comment out this line to disallow using 
            [methods setObject:realMethodName forKey:[self underscoredMethodName:realMethodName]];
            [methods setObject:realMethodName forKey:[self camelCasedMethodName: realMethodName]];
        }
        
        /* note mlist needs to be freed */
        free(mlist);
        
        class = class_getSuperclass(class);
    }
}

- (NSArray*) methodNames {
    NSMutableArray* methodNames = [NSMutableArray array];
    for (NSString* methodName in [self.methodsMap keyEnumerator]) {
        [methodNames addObject:methodName];
    }
    return methodNames;
	
}


- (SEL) findSelectorFromString: methodName {
    NSString* realMethodName = [self.methodsMap objectForKey:methodName];
    
//    NSLog(@"Javascript is calling: %@, calling a method called %@", methodName, realMethodName);
    
    // unsure as to allow non-string munged methods.
    return NSSelectorFromString(realMethodName);
}

- (void) dealloc {
    self.dispatchQueue = nil;
    self.nativeObject = nil;
    [super dealloc];
}

@end

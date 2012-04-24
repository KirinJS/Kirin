//
//  NativeContext.m
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "NativeContext.h"
#import "JSON.h"
#import "NativeObjectHolder.h"

@interface NativeContext () 

@property(nonatomic, retain) NSMutableDictionary* nativeObjects;
    
@end


@implementation NativeContext

@synthesize nativeObjects = nativeObjects_;

- (id) init {
    return [self initWithDictionary: [NSMutableDictionary dictionary]]; 
}

- (id) initWithDictionary: (NSMutableDictionary*) nativeObjs {
    self = [super init];
    if (self) {
        self.nativeObjects = nativeObjs;
    }
    return self;
}

- (NSArray*) methodNamesFor: (NSString*) moduleName {
    NativeObjectHolder* holder = [self.nativeObjects objectForKey:moduleName];
    if (!holder) {
        [NSException raise:@"KirinNoSuchObjectException" format:@"There is no object registered called %@", moduleName];
    }
    return [holder methodNames];
}

- (void) registerNativeObject: (id) object asName: (NSString*) name {
    [self.nativeObjects setValue:[NativeObjectHolder holderForObject:object] forKey:name];
}

- (void) unregisterNativeObject: (NSString*) name {
    if (name) {
        [self.nativeObjects removeObjectForKey:name];
    }
}

- (void) executeCommandFromModule: (NSString*) host andMethod: (NSString*) fullMethodName andArgsList: (NSString*) query {
    NativeObjectHolder* holder = [self.nativeObjects objectForKey:host];
    id obj = holder ? holder.nativeObject : nil;

    
	SEL selector = [holder findSelectorFromString:fullMethodName];
	if (obj && [obj respondsToSelector:selector]) {
        NSString* argsJSON = [query stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];

        NSMutableArray* arguments = [argsJSON JSONValue];

        // TODO make this work. This would mean that we were no longer restricted to 
        // two args selectors.
        // http://developer.apple.com/library/mac/#documentation/Cocoa/Reference/ObjCRuntimeRef/Reference/reference.html
        // http://cocoawithlove.com/2009/05/variable-argument-lists-in-cocoa.html
//        char *argList = (char *)malloc(sizeof(NSString *) * [arguments count]);
//        [arguments getObjects:(id *)argList];        
//        objc_msgSend(obj, selector, argList);
//        free(argList);

        void (^block)(void) = ^{
            @try {
                int len = [arguments count];
                if (len == 0) {
                    [obj performSelector:selector];
                } else if (len == 1) {
                    [obj performSelector:selector withObject:[arguments objectAtIndex:0]];
                } else if (len == 2) {
                    [obj performSelector:selector withObject:[arguments objectAtIndex:0] withObject:[arguments objectAtIndex:1]];
                }
            } @catch (NSException* exception) {
                NSLog(@"Exception while executing %@.%@", host, fullMethodName);
                
                // Create a string based on the exception
                NSString *exceptionMessage = [NSString stringWithFormat:@"%@\nReason: %@\nUser Info: %@", [exception name], [exception reason], [exception userInfo]];
                
                // Always log to console for history
                NSLog(@"Exception raised:\n%@", exceptionMessage);
                NSLog(@"Backtrace: %@", [exception callStackSymbols]);
            }
        };
        
        dispatch_queue_t queue = holder.dispatchQueue;
        if (queue) {
//            block();
            dispatch_async(queue, block);
        } else {
            block();
        }
	} else {                
        // There's no method to call, so throw an error.

         NSString* className = NSStringFromClass([obj class]);

        if (!className) {
            className = host;
        }
        NSLog(@"Class method '%@' not defined in class %@, called from module %@.js", fullMethodName, className, host);
        
        //[NSException raise:NSInternalInconsistencyException format:@"Class method '%@' not defined against class '%@'.", fullMethodName, className];
        
	}
}

- (void) dealloc {
    [self.nativeObjects removeAllObjects];
    self.nativeObjects = nil;
    
    [super dealloc];
}

@end

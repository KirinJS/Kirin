//
//  NativeContext.m
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "NativeContext.h"
#import "JSON.h"
#import <objc/runtime.h>


@interface NativeContext (private) 

    
@end


@implementation NativeContext

@synthesize nativeObjects;

- (id) init {
    return [self initWithDictionary: [[[NSMutableDictionary alloc] init] autorelease]]; 
}

- (id) initWithDictionary: (NSMutableDictionary*) nativeObjs {
    self = [super init];
    if (self) {
        self.nativeObjects = nativeObjs;
    }
    return self;
}

- (NSArray*) methodNamesFor: (id) obj {
	NSMutableArray* selectorNames = [[[NSMutableArray alloc] init] autorelease];
	int i=0;
	unsigned int mc = 0;
	Method * mlist = class_copyMethodList(object_getClass(obj), &mc);
    
	for(i=0;i<mc;i++) {
		[selectorNames addObject:[NSString stringWithFormat:@"%s", sel_getName(method_getName(mlist[i]))]];
	}
	
	/* note mlist needs to be freed */
	free(mlist);
	
    return selectorNames;
	
}

- (void) registerNativeObject: (id) object asName: (NSString*) name {
    [self.nativeObjects setValue:object forKey:name];
}

- (void) unregisterNativeObject: (NSString*) name {
    [self.nativeObjects removeObjectForKey:name];
}

- (void) executeCommandFromModule: (NSString*) host andMethod: (NSString*) file andArgsList: (NSString*) query {
    id obj = [self.nativeObjects objectForKey:host];
    NSString* fullMethodName = [[file componentsSeparatedByString:@"_"] componentsJoinedByString:@":"];
    
	SEL selector = NSSelectorFromString(fullMethodName);
	if ([obj respondsToSelector:selector]) {
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
        
		int len = [arguments count];
		if (len == 0) {
			[obj performSelector:selector];
		} else if (len == 1) {
			[obj performSelector:selector withObject:[arguments objectAtIndex:0]];
		} else if (len == 2) {
			[obj performSelector:selector withObject:[arguments objectAtIndex:0] withObject:[arguments objectAtIndex:1]];
		}
	}
	else {                
        // There's no method to call, so throw an error.
        NSString* className = [[obj class] description];
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

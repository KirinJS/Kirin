//
//  NativeObjectHolder.m
//  KirinKit
//
//  Created by James Hugman on 29/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "NativeObjectHolder.h"

#import <KirinKit/KirinServiceWithUI.h>
#import <UIKit/UIViewController.h>

@implementation NativeObjectHolder

@synthesize nativeObject = nativeObject_;
@synthesize dispatchQueue = dispatchQueue_;

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
    } else if ([nativeObject conformsToProtocol:@protocol(KirinServiceWithUI)]) {
        NSLog(@"Will dispatch to KirinServiceWithUI %@ on the main thread", [nativeObject class]);
        self.dispatchQueue = nil;//dispatch_get_main_queue();
    } else {
        
        SEL getter = @selector(dispatchQueue);
        
        if ([nativeObject_ respondsToSelector:getter]) {
            self.dispatchQueue = (dispatch_queue_t) [nativeObject performSelector:getter];
        }
        
        if (self.dispatchQueue) {
            NSLog(@"Will dispatch to KirinService %@ on a custom dispatch queue", [nativeObject class]);
        } else {
            NSLog(@"Will dispatch to KirinService %@ on a global dispatch queue", [nativeObject class]);
            self.dispatchQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
        }
        
        
    }
    
}

- (void) dealloc {
    self.dispatchQueue = nil;
    self.nativeObject = nil;
    [super dealloc];
}

@end

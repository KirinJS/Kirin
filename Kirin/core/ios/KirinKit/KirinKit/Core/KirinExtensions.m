//
//  KirinExtensions.m
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import "KirinExtensions.h"

#import "SettingsBackend.h"
#import "FileSystemBackend.h"
#import "NetworkingBackend.h"
#import "KirinImagePicker.h"
#import "DatabasesBackend.h"
#import "KirinLocationBackend.h"
#import "KirinImageTransformer.h"

@interface KirinExtensions()

@property(retain) NSMutableArray* allServices;

@end

@implementation KirinExtensions

@synthesize isStarted;

@synthesize allServices;

+ (KirinExtensions*) empty {
    NSLog(@"Empty KirinExtensions");
    return [[[KirinExtensions alloc] init] autorelease];
}

+ (KirinExtensions*) coreServices {
    KirinExtensions* services = [KirinExtensions empty];
    NSLog(@"Core KirinExtensions");
    [services registerExtension:[[[SettingsBackend alloc] init] autorelease]];
    [services registerExtension:[[[FileSystemBackend alloc] init] autorelease]];
    [services registerExtension:[[[NetworkingBackend alloc] init] autorelease]];
    [services registerExtension:[[[KirinImagePicker alloc] init] autorelease]];
    [services registerExtension:[[[DatabasesBackend alloc] init] autorelease]];
    [services registerExtension:[KirinLocationBackend instance]];
    [services registerExtension:[KirinImageTransformer instance]];
    return services;
}

- (id) init {
    self = [super init];
    if (self) {
        self.allServices = [NSMutableArray array];
    }
    return self;
}

- (void) registerExtension: (id<KirinExtensionProtocol>) service {
    [self.allServices addObject:service];
    [service onLoad];
    if (self.isStarted && [service respondsToSelector:@selector(onStart)]) {
        [service onStart];
    }
}

- (void) ensureStarted {
    if (self.isStarted) {
        return;
    }
 
    self.isStarted = YES;   
    
    for (int i=0, max=[self.allServices count]; i<max; i++) {
        id<KirinExtensionProtocol> service = [self.allServices objectAtIndex:i];
        if ([service respondsToSelector:@selector(onStart)]) {
            [service onStart];
        }
    }
    
}

- (void) unloadServices {
    if (!self.isStarted) {
        return;
    }
    
    for (int i=0, max=[self.allServices count]; i<max; i++) {
        id<KirinExtensionProtocol> service = [self.allServices objectAtIndex:i];
        if ([service respondsToSelector:@selector(onStop)]) {
            [service onStop];
        }
    }
    
    for (int i=0, max=[self.allServices count]; i<max; i++) {
        id<KirinExtensionProtocol> service = [self.allServices objectAtIndex:i];
        if ([service respondsToSelector:@selector(onUnload)]) {
            [service onUnload];
        }
    }
    
    self.isStarted = NO;
}

- (void) dealloc {
    self.isStarted = NO;
    self.allServices = nil;
    [super dealloc];
}

@end

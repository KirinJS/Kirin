//
//  KirinExtensions.m
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import "KirinExtensions.h"

#import "SettingsBackend.h"
#import "PreferencesBackendImpl.h"
#import "FileSystemBackend.h"
#import "NetworkingBackend.h"
#import "KirinImagePicker.h"
#import "DatabasesBackend.h"
#import "KirinLocationBackendImpl.h"
#import "KirinImageTransformer.h"

@interface KirinExtensions()

@property(retain) NSMutableArray* allExtensions;

@end

@implementation KirinExtensions

@synthesize isStarted;

@synthesize allExtensions;

+ (KirinExtensions*) empty {
    NSLog(@"Empty KirinExtensions");
    return [[[KirinExtensions alloc] init] autorelease];
}

+ (KirinExtensions*) coreExtensions {
    KirinExtensions* services = [KirinExtensions empty];
    NSLog(@"Core KirinExtensions");
    [services registerExtension:[[[SettingsBackend alloc] init] autorelease]];
    [services registerExtension:[PreferencesBackendImpl instance]];
    [services registerExtension:[[[FileSystemBackend alloc] init] autorelease]];
    [services registerExtension:[[[NetworkingBackend alloc] init] autorelease]];
    [services registerExtension:[[[KirinImagePicker alloc] init] autorelease]];
    [services registerExtension:[[[DatabasesBackend alloc] init] autorelease]];
    [services registerExtension:[KirinLocationBackendImpl instance]];
    [services registerExtension:[KirinImageTransformer instance]];
    return services;
}

- (id) init {
    self = [super init];
    if (self) {
        self.allExtensions = [NSMutableArray array];
    }
    return self;
}

- (void) registerExtension: (id<KirinExtensionProtocol>) service {
    [self.allExtensions addObject:service];
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
    
    for (int i=0, max=[self.allExtensions count]; i<max; i++) {
        id<KirinExtensionProtocol> service = [self.allExtensions objectAtIndex:i];
        if ([service respondsToSelector:@selector(onStart)]) {
            [service onStart];
        }
    }
    
}

- (void) unloadServices {
    if (!self.isStarted) {
        return;
    }
    
    for (int i=0, max=[self.allExtensions count]; i<max; i++) {
        id<KirinExtensionProtocol> service = [self.allExtensions objectAtIndex:i];
        if ([service respondsToSelector:@selector(onStop)]) {
            [service onStop];
        }
    }
    
    for (int i=0, max=[self.allExtensions count]; i<max; i++) {
        id<KirinExtensionProtocol> service = [self.allExtensions objectAtIndex:i];
        if ([service respondsToSelector:@selector(onUnload)]) {
            [service onUnload];
        }
    }
    
    self.isStarted = NO;
}

- (void) dealloc {
    self.isStarted = NO;
    self.allExtensions = nil;
    [super dealloc];
}

@end

//
//  KirinServices.m
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import "KirinServices.h"

#import "SettingsBackend.h"
#import "FileSystemBackend.h"
#import "NetworkingBackend.h"
#import "KirinImagePicker.h"
#import "DatabasesBackend.h"
#import "KirinLocationBackend.h"
#import "KirinImageTransformer.h"

@interface KirinServices()

@property(retain) NSMutableArray* allServices;

@end

@implementation KirinServices

@synthesize isStarted;

@synthesize allServices;

+ (KirinServices*) empty {
    NSLog(@"Empty KirinServices");
    return [[[KirinServices alloc] init] autorelease];
}

+ (KirinServices*) coreServices {
    KirinServices* services = [KirinServices empty];
    NSLog(@"Core KirinServices");
    [services registerService:[[[SettingsBackend alloc] init] autorelease]];
    [services registerService:[[[FileSystemBackend alloc] init] autorelease]];
    [services registerService:[[[NetworkingBackend alloc] init] autorelease]];
    [services registerService:[[[KirinImagePicker alloc] init] autorelease]];
    [services registerService:[[[DatabasesBackend alloc] init] autorelease]];
    [services registerService:[KirinLocationBackend instance]];
    [services registerService:[KirinImageTransformer instance]];
    return services;
}

- (id) init {
    self = [super init];
    if (self) {
        self.allServices = [NSMutableArray array];
    }
    return self;
}

- (void) registerService: (id<KirinServiceProtocol>) service {
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
        id<KirinServiceProtocol> service = [self.allServices objectAtIndex:i];
        if ([service respondsToSelector:@selector(onStart)]) {
            [service onStart];
        }
    }
    
}

- (void) dealloc {
    self.isStarted = NO;
    self.allServices = nil;
    [super dealloc];
}

@end

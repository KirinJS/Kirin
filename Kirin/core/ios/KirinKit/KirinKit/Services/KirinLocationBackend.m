//
//  KirinLocationBackend.m
//  Moo
//
//  Created by James Hugman on 27/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinLocationBackend.h"

#import <CoreLocation/CoreLocation.h>
#import <KirinKit/JSON.h>

@interface KirinLocationBackend ()

@property(nonatomic, retain) NSString* callback;
@property(nonatomic, retain) NSString* errback;

@property(nonatomic, retain) CLLocationManager* locationManager;




@end

@implementation KirinLocationBackend

@synthesize callback = callback_;
@synthesize errback = errback_;
@synthesize locationManager = locationManager_;

+ (KirinLocationBackend*) instance {
    return [[[KirinLocationBackend alloc] init] autorelease];
}

#pragma mark - 
#pragma mark KirinService methods.

- (id) init {
    return [super initWithModuleName:@"Location"];
}

- (void) onStart {
    [super onStart];
    self.locationManager = [[[CLLocationManager alloc] init] autorelease];
}

- (void) onUnload {
    [self stop];
    [super onUnload];
}

#pragma mark -
#pragma mark Utility methods.


- (NSDictionary*) dictionaryFromLocation: (CLLocation*) l {
    NSMutableDictionary* d = [NSMutableDictionary dictionary];
    
    [d setObject:[NSNumber numberWithDouble:l.coordinate.latitude] forKey:@"latitude"];
    [d setObject:[NSNumber numberWithDouble:l.coordinate.longitude] forKey:@"longitude"];
    
    [d setObject:[NSNumber numberWithDouble:[l.timestamp timeIntervalSince1970]] forKey:@"timestamp"];
    
    return d;
}

- (void) sendLocation: (CLLocation*) loc {
    [self.kirinHelper jsCallback:self.callback withArgsList:[KirinArgs object:[self dictionaryFromLocation:loc]]];
}

#pragma mark - 
#pragma mark Called by Javascript.

- (void) startWithCallback: (NSString*) callback andErrback: (NSString*) errback {
    self.callback = callback;
    self.errback = errback;
    self.locationManager.delegate = self;    
    
    if (self.locationManager.location) {
        [self sendLocation:self.locationManager.location];
    }
    
    [self.locationManager startUpdatingLocation];
}

- (void) stop {
    [self.kirinHelper cleanupCallback:self.callback, self.errback, nil];
    
    [self.locationManager stopUpdatingLocation];

    
    self.locationManager.delegate = nil;
    
}

- (void) forceRefresh {
    [self.locationManager stopUpdatingLocation];
    [self.locationManager startUpdatingLocation];
}

#pragma mark - 
#pragma mark CoreLocation delegate methods.


- (void) locationManager:(CLLocationManager *)manager didUpdateToLocation:(CLLocation *)newLocation fromLocation:(CLLocation *)oldLocation {
    
    [self.kirinHelper jsCallback:self.callback withArgsList:[KirinArgs object:[self dictionaryFromLocation:newLocation]]];
    
}

- (void) locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    [self.kirinHelper jsCallback:self.errback withArgsList:[KirinArgs string: [error localizedDescription]]];
}

#pragma mark - 
#pragma mark Memory management.

- (void) dealloc {
    
    self.errback = nil;
    self.callback = nil;
    self.locationManager = nil;
    [super dealloc];
}

@end

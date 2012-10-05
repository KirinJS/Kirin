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
#pragma mark KirinExtension methods.

- (id) init {
    return [super initWithModuleName:@"device-location-alpha"];
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
    [d setObject:[NSNumber numberWithDouble:l.horizontalAccuracy] forKey:@"horizontalAccuracy"];
    return d;
}

- (void) sendLocation: (CLLocation*) loc {
    [self.kirinHelper jsCallback:self.callback withArgsList:[KirinArgs object:[self dictionaryFromLocation:loc]]];
}

#pragma mark - 
#pragma mark Called by Javascript.

- (void) denyAccess {
    NSLog(@"Denying access to Location Services: ");
    self.locationManager.delegate = nil;
    [self.kirinHelper jsCallback:self.errback withArgsList:[KirinArgs string:@"denied"]];
    [self.locationManager stopUpdatingLocation];
}

- (void) failWithMessage: (NSString*) message {
    [self.kirinHelper jsCallback:self.errback withArgsList:[KirinArgs string:message]];
}

- (void) startWithCallback: (NSString*) callback andErrback: (NSString*) errback {
    self.callback = callback;
    self.errback = errback;
    self.locationManager.delegate = self;    
    
    if (self.locationManager.location) {
        [self sendLocation:self.locationManager.location];
    }

    
    if (![CLLocationManager locationServicesEnabled]) {
        // the device has location services switched off.
        NSLog(@"Location services aren't on");
        // starting updates will ask the user to switch it on 
    } else if ([CLLocationManager authorizationStatus] == kCLAuthorizationStatusDenied) {
        NSLog(@"Location services are on, but we've been denied before");
        [self denyAccess];
        return;
    }
    
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    
    switch (status) {
        case kCLAuthorizationStatusDenied:
            
            NSLog(@"Location authorization denied");
            break;
        case kCLAuthorizationStatusRestricted:
            NSLog(@"Location authorization restricted");
            // the user can't change this. Parental settings need to change.
            [self denyAccess];
            return;
        case kCLAuthorizationStatusNotDetermined:
            NSLog(@"Location authorization not determined");
            break;
        case kCLAuthorizationStatusAuthorized:
            NSLog(@"Location authorization already given");
            break;
    }

    [self.locationManager setDistanceFilter:50.0];
 
    [self.locationManager startUpdatingLocation];
 
}

- (void) stop {
    NSLog(@"Location services: stopping listening");
    [self.kirinHelper cleanupCallback:self.callback, self.errback, nil];
    
    [self.locationManager stopUpdatingLocation];

    
    self.locationManager.delegate = nil;
    
}

- (void) forceRefresh {
    [self.locationManager stopUpdatingLocation];
    [self.locationManager startUpdatingLocation];
}

- (void) updatePermissions: (NSDictionary*) config {
    NSMutableDictionary* result = [NSMutableDictionary dictionary];
    
    NSNumber* true_ = [NSNumber numberWithInt: 1];
    NSNumber* false_ = [NSNumber numberWithInt: 0];
    
    BOOL isAuthorized = ([CLLocationManager locationServicesEnabled] && [CLLocationManager authorizationStatus] == kCLAuthorizationStatusAuthorized);
    [result setObject: isAuthorized ? true_ : false_ forKey: @"authorized"];
    [self.kirinHelper jsCallback:@"callback" fromConfig:config withArgsList:[KirinArgs object:result]];
    [self.kirinHelper cleanupCallback:config withNames:@"callback", @"errback", nil];
}

#pragma mark - 
#pragma mark CoreLocation delegate methods.


- (void) locationManager:(CLLocationManager *)manager didUpdateToLocation:(CLLocation *)newLocation fromLocation:(CLLocation *)oldLocation {
    [self sendLocation:newLocation];
}



- (void) locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    //NSLog(@"%@ %@: Location failed: %@", __PRETTY_FUNCTION__, __LINE__, error);
    if (error.code == kCLErrorDenied) {
        [self denyAccess];
    } else if (error.code != kCLErrorLocationUnknown) {
        [self.kirinHelper jsCallback:self.errback withArgsList:[KirinArgs string: [error localizedDescription]]];
    }

    
}

- (void) locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    switch (status) {
        case kCLAuthorizationStatusDenied:
            NSLog(@"User has denied location authorization");
            [self denyAccess];
            break;
        case kCLAuthorizationStatusRestricted:
            NSLog(@"User has restricted location authorization");
            [self denyAccess];
            break;
        case kCLAuthorizationStatusAuthorized:
            NSLog(@"User has given location authorization");
            break;
        case kCLAuthorizationStatusNotDetermined:
            NSLog(@"User has somehow managed to not determine location authorization");
            break;
    }

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

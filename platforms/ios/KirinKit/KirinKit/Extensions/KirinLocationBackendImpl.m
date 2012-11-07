//
//  KirinLocationBackendImpl.m
//  KirinKit
//
//  Created by James on 06/10/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinLocationBackendImpl.h"
#import "KirinLocationListener.h"
#import "KirinLocationData.h"
#import "KirinLocationPermissions.h"

@interface KirinLocationBackendImpl ()

@property(nonatomic, retain) id<KirinLocationListener> locationListener;

@property(nonatomic, retain) CLLocationManager* locationManager;

@end

@implementation KirinLocationBackendImpl

@synthesize locationManager = locationManager_;
@synthesize locationListener = locationListener_;

+ (KirinLocationBackendImpl*) instance {
    return [[[KirinLocationBackendImpl alloc] init] autorelease];
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
    [self stopLocationListener];
    [super onUnload];
}

#pragma mark -
#pragma mark Methods used below.

- (void) denyAccess {
    NSLog(@"Denying access to Location Services: ");
    self.locationManager.delegate = nil;
    [self.locationListener locationError:@"Denied"];
    [self.locationManager stopUpdatingLocation];
}

- (void) failWithMessage: (NSString*) message {
    [self.locationListener locationError:message];
}

- (id<KirinLocationData>) locationDataFromCLLocation: (CLLocation*) l {
    id<KirinLocationData> d = [self.kirinHelper proxyForJavascriptResponse:@protocol(KirinLocationData) ];
    
    d.latitude = l.coordinate.latitude;
    d.longitude = l.coordinate.longitude;
    d.timestamp = [l.timestamp timeIntervalSince1970];
    d.horizontalAccuracy = l.horizontalAccuracy;
    
    return d;
}

- (void) sendLocation: (CLLocation*) loc {
    [self.locationListener locationUpdate:[self locationDataFromCLLocation:loc]];
}

#pragma mark -
#pragma mark CoreLocation delegate methods.

- (void) locationManager:(CLLocationManager *)manager didUpdateToLocation:(CLLocation *)newLocation fromLocation:(CLLocation *)oldLocation {
    [self sendLocation:newLocation];
}

- (void) locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    if (error.code == kCLErrorDenied) {
        [self denyAccess];
    } else if (error.code != kCLErrorLocationUnknown) {
        [self failWithMessage:[error localizedDescription]];
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
#pragma mark Calls coming from Javascript.

/**
 * @param listener
 */
- (void) startWithLocationListener: (NSDictionary*) listenerDictionary {
    self.locationListener = [self.kirinHelper proxyForJavascriptRequest: @protocol(KirinLocationListener)
                                                          andDictionary: listenerDictionary];
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


- (void) stopLocationListener {
    NSLog(@"Location services: stopping listening");
    [self.locationListener locationUpdateEnding];
    [self.locationManager stopUpdatingLocation];
    self.locationManager.delegate = nil;
    
}

- (void) forceRefresh {
    [self.locationManager stopUpdatingLocation];
    [self.locationManager startUpdatingLocation];
}

/**
 * @param permissionCallback
 */
- (void) getPermissions {
    id<KirinLocationPermissions> permissions = [self.kirinHelper proxyForJavascriptResponse:@protocol(KirinLocationPermissions)];
    
    permissions.authorized =  ([CLLocationManager locationServicesEnabled] && [CLLocationManager authorizationStatus] == kCLAuthorizationStatusAuthorized);

    [self.locationListener updatePermissions:permissions];
}


#pragma mark -
#pragma mark Memory management.
- (void) dealloc {
    self.locationListener = nil;
    self.locationManager = nil;
    [super dealloc];
}



@end

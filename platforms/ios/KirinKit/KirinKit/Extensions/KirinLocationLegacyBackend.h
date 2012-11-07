//
//  KirinLocationBackend.h
//  Moo
//
//  Created by James Hugman on 27/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <KirinKit/KirinKit.h>
#import <CoreLocation/CoreLocation.h>
#import "KirinLocationLegacy.h"

@interface KirinLocationLegacyBackend : KirinExtensionStub<KirinLocationLegacy, CLLocationManagerDelegate>

+ (KirinLocationLegacyBackend*) instance;

@end

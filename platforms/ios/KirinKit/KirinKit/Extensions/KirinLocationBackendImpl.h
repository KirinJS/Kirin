//
//  KirinLocationBackendImpl.h
//  KirinKit
//
//  Created by James on 07/11/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <KirinKit/KirinKit.h>
#import <CoreLocation/CoreLocation.h>
#import "KirinLocationBackend.h"

@interface KirinLocationBackendImpl : KirinExtensionStub <KirinLocationBackend, CLLocationManagerDelegate>

+ (KirinLocationBackendImpl*) instance;

@end

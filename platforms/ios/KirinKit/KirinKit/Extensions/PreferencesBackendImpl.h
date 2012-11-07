//
//  PreferencesBackend.h
//  KirinKit
//
//  Created by James on 06/10/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <KirinKit/KirinKit.h>
#import "KirinPreferencesBackend.h"

@interface PreferencesBackendImpl : KirinExtensionStub <KirinPreferencesBackend>

+ (PreferencesBackendImpl*) instance;

@end

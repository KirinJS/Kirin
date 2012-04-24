//
//  KirinExtensions.h
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <KirinKit/KirinExtensionProtocol.h>

@interface KirinExtensions : NSObject {
    
}

+ (KirinExtensions*) coreServices;

+ (KirinExtensions*) empty;

@property BOOL isStarted;



- (void) registerExtension: (id<KirinExtensionProtocol>) service;

- (void) ensureStarted;

- (void) unloadServices;

@end

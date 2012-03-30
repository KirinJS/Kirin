//
//  KirinServices.h
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <KirinKit/KirinServiceProtocol.h>

@interface KirinServices : NSObject {
    
}

+ (KirinServices*) coreServices;

+ (KirinServices*) empty;

@property BOOL isStarted;



- (void) registerService: (id<KirinServiceProtocol>) service;

- (void) ensureStarted;

- (void) unloadServices;

@end

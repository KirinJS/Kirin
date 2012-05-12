//
//  KirinState.m
//  KirinKit
//
//  Created by James Hugman on 20/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinState.h"

@implementation KirinState

@synthesize currentScreen = currentScreen_;
@synthesize dropbox = dropbox_;

+ (KirinState*) initialState {
    return [[[KirinState alloc] init] autorelease];
    
}

@end

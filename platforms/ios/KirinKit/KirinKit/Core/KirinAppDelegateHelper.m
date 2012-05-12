//
//  KirinAppDelegateHelper.m
//  KirinKit
//
//  Created by James Hugman on 09/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinAppDelegateHelper.h"

@implementation KirinAppDelegateHelper

- (UIViewController*) viewController {
    return self.state.currentScreen;
}

@end

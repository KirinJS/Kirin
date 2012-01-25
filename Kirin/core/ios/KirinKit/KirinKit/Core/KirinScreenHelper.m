//
//  KirinScreenHelper.m
//  KirinKit
//
//  Created by James Hugman on 10/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import "KirinScreenHelper.h"
#import <UIKit/UIViewController.h>

@implementation KirinScreenHelper

- (void) onLoad {
    self.state.currentScreen = (UIViewController*) self.nativeObject;
    [super onLoad];
}

- (void) onUnload {
    if (self.state.currentScreen == self.nativeObject) {
        self.state.currentScreen = nil;
    }
    [super onUnload];
}

@end

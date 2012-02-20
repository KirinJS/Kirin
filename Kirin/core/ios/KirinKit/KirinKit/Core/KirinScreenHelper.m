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

- (void) onPause {
    if (self.state.currentScreen == self.nativeObject) {
        self.state.currentScreen = nil;
    }
    [super onPause];
}

- (void) onResume {
    self.state.currentScreen = (UIViewController*) self.nativeObject;
    [super onResume];
}

- (void) onResumeWithArgsList: (NSString*) argsList {
    self.state.currentScreen = (UIViewController*) self.nativeObject;
    [super onResumeWithArgsList:argsList];
}


@end

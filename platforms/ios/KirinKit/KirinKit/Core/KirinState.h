//
//  KirinState.h
//  KirinKit
//
//  Created by James Hugman on 20/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIViewController.h>
#import "KirinDropbox.h"

@interface KirinState : NSObject

+ (KirinState*) initialState;

@property(retain, nonatomic) UIViewController* currentScreen;
@property(retain, nonatomic) KirinDropbox* dropbox;

@end

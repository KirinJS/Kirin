//
//  KirinUIViewControllerViewController.h
//  KirinKit
//
//  Created by James Hugman on 26/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <UIKit/UIKit.h>

#import <KirinKit/Kirin.h>
#import <KirinKit/KirinScreenHelper.h>

@interface KirinUIViewControllerViewController : UIViewController

@property(retain, nonatomic) KirinScreenHelper* kirinHelper;

- (void) bindScreenWithoutLoading: (NSString*) moduleName;

- (void) bindScreen: (NSString*) moduleName;

- (id) bindScreen:(NSString *)moduleName withProtocol: (Protocol*) protocol;

@end

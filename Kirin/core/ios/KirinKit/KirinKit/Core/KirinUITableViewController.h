//
//  KirinUITableViewController.h
//  KirinKit
//
//  Created by James Hugman on 30/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <KirinKit/KirinScreenHelper.h>

@interface KirinUITableViewController : UITableViewController
@property(retain, nonatomic) KirinScreenHelper* kirinHelper;

- (void) bindScreenWithoutLoading: (NSString*) moduleName;

- (void) bindScreen: (NSString*) moduleName;

- (id) bindScreen:(NSString *)moduleName withProtocol: (Protocol*) protocol;

@end

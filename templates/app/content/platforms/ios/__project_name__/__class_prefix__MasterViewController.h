//
//  __class_prefix__MasterViewController.h
//  __project_name__
//
//  Created by James Hugman on 30/04/2012.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <KirinKit/KirinKit.h>

#import "__native_screen__.h"

@class __class_prefix__DetailViewController;

@interface __class_prefix__MasterViewController : KirinUITableViewController <__native_screen__>

@property (strong, nonatomic) __class_prefix__DetailViewController *detailViewController;

@end

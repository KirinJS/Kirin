//
//  __class_prefix__ModelController.h
//  __project_name__
//
//  Created by James Hugman on 30/04/2012.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@class __class_prefix__DataViewController;

@interface __class_prefix__ModelController : NSObject <UIPageViewControllerDataSource>

- (__class_prefix__DataViewController *)viewControllerAtIndex:(NSUInteger)index storyboard:(UIStoryboard *)storyboard;
- (NSUInteger)indexOfViewController:(__class_prefix__DataViewController *)viewController;

@end

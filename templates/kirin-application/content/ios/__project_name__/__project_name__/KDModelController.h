//
//  KDModelController.h
//  __project_name__
//
//  Created by James Hugman on 30/04/2012.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@class KDDataViewController;

@interface KDModelController : NSObject <UIPageViewControllerDataSource>

- (KDDataViewController *)viewControllerAtIndex:(NSUInteger)index storyboard:(UIStoryboard *)storyboard;
- (NSUInteger)indexOfViewController:(KDDataViewController *)viewController;

@end

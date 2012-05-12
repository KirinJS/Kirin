//
//  KDViewController.h
//  KirinNetworking
//
//  Created by James Hugman on 10/02/2012.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface KDViewController : UIViewController <UITextFieldDelegate>

#pragma mark -
#pragma mark IBOutlets
@property(retain, nonatomic) IBOutlet UITextField* urlTextField;
@property(retain, nonatomic) IBOutlet UIButton* downloadButton;
@property(retain, nonatomic) IBOutlet UIImageView* backgroundImage;

#pragma mark -
#pragma mark IBActions
- (IBAction) downloadNow: (UIButton*) button;


#pragma mark -
#pragma mark Respond to calls from Javascript

- (void) updateUiWithDictionary: (NSDictionary*) dict;

@end

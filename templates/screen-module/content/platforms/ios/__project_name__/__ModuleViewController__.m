//
//  __class_prefix__MasterViewController.m
//  __project_name__
//
//  Created by James Hugman on 30/04/2012.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "__ModuleViewController__.h"

#import "__ModuleProtocol__.h"

@interface __ModuleViewController__ () 
@property(retain, nonatomic) id<__ModuleProtocol__> kirinModule;
@end

@implementation __ModuleViewController__

@synthesize kirinModule = kirinModule_;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        self.title = NSLocalizedString(@"__module_name__", @"__module_name__");
        if ([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPad) {
            self.contentSizeForViewInPopover = CGSizeMake(320.0, 600.0);
        }
    }
    return self;
}
							
- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.kirinModule = [self bindScreen:@"__module_name__" withProtocol:@protocol(__ModuleProtocol__)];
    
	// Do any additional setup after loading the view, typically from a nib.
    self.navigationItem.leftBarButtonItem = self.editButtonItem;

}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    if ([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone) {
        return (interfaceOrientation != UIInterfaceOrientationPortraitUpsideDown);
    } else {
        return YES;
    }
}

@end

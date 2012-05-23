//
//  __ModuleViewController__.m
//  __project_name__
//
//  Created by James Hugman on 30/04/2012.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "__ModuleViewController__.h"

#import "__ModuleProtocol__.h"

@interface __ModuleViewController__ () 
@property(retain, nonatomic) id<__ModuleProtocol__> screenModule;
@end

@implementation __ModuleViewController__

@synthesize screenModule = screenModule_;

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
    
    self.screenModule = [self bindScreen:@"__module_name__" withProtocol:@protocol(__ModuleProtocol__)];
    
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


#pragma mark - Implementing __ScreenProtocol__, called by __module_name__.js

- (void) setDataForScreen: (NSDictionary*) dataDictionary {
    id<__RequestProtocol__> data = [self.kirinHelper proxyForJavascriptRequest:@protocol(__RequestProtocol__) 
                                                                  andDictionary: dataDictionary];
    NSLog(@"Sent from __module_name__.js: %@", data.name);
}

@end

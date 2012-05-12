//
//  KDViewController.m
//  KirinNetworking
//
//  Created by James Hugman on 10/02/2012.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "KDViewController.h"

#import <KirinKit/KirinKit.h>

@interface KDViewController ()

@property(retain, nonatomic) KirinScreenHelper* kirinHelper;

@end

@implementation KDViewController

@synthesize downloadButton = _downloadButton;
@synthesize urlTextField = _urlTextField;
@synthesize backgroundImage = _backgroundImage;

@synthesize kirinHelper = _kirinHelper;

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    
    self.urlTextField.delegate = self;
    
    self.kirinHelper = [KIRIN bindScreen:self toModule:@"MyScreen"];
    [self.kirinHelper onLoad];
}

- (void)viewDidUnload
{
    [self.kirinHelper onUnload];
    
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    self.urlTextField = nil;
    self.downloadButton = nil;
    
    self.kirinHelper = nil;
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.kirinHelper onResume];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated
{
	[super viewWillDisappear:animated];
}

- (void)viewDidDisappear:(BOOL)animated
{
    [self.kirinHelper onPause];
	[super viewDidDisappear:animated];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    if ([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone) {
        return (interfaceOrientation != UIInterfaceOrientationPortraitUpsideDown);
    } else {
        return YES;
    }
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField
{
    [textField resignFirstResponder];
    [self.kirinHelper jsMethod:@"startDownload" withArgsList:[KirinArgs taintedForJs:self.urlTextField.text]];
    return YES;
}


#pragma mark -
#pragma mark Respond to UI events

- (IBAction) downloadNow: (UIButton*) button {
    [self textFieldShouldReturn: self.urlTextField];
}

#pragma mark -
#pragma mark Respond to Javascript calls


- (void) updateUiWithDictionary: (NSDictionary*) dict {
    if ([dict objectForKey:@"urlToDownload"]) {
        self.urlTextField.text = [dict objectForKey:@"urlToDownload"];
    }
    
    if ([dict objectForKey:@"urlDownloaded"]) {
        NSLog(@"Just finished downloading from: %@", [dict objectForKey:@"urlDownloaded"]);
    }

    
    if ([dict objectForKey:@"contents"]) {
        NSLog(@"Contents");
        NSLog(@"%@", [dict objectForKey:@"contents"]);
    }
    
    if ([dict objectForKey:@"imageFile"]) {
        
    }
}

- (void) changeImage: (NSString*) filePath {
    self.backgroundImage.image = [UIImage imageWithContentsOfFile:filePath];
}

@end

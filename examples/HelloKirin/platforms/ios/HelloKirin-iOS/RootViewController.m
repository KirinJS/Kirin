/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/



#import "RootViewController.h"
#import <KirinKit/KirinKit.h>


#import "DumbListViewController.h"

@interface RootViewController() 

@property(retain, nonatomic) KirinScreenHelper* kirinHelper;

@end

@implementation RootViewController
@synthesize label = label_;
@synthesize dumbListViewController = dumbListViewController_;
@synthesize kirinHelper = kirinHelper_;
#pragma mark -
#pragma mark View lifecycle


- (void)viewDidLoad {
    [super viewDidLoad];

	UIBarButtonItem* editButton = [[[UIBarButtonItem alloc] initWithTitle:@"List" style:UIBarButtonItemStyleDone target:self action:@selector(showListOnClick:)] autorelease];
	self.navigationItem.rightBarButtonItem = editButton;
	
	self.navigationItem.title = @"How big?";
    self.kirinHelper = [KIRIN bindScreen:self
                                toModule:@"DumbButtonScreenModule"];
    [self.kirinHelper onLoad];
}



- (void)viewWillAppear:(BOOL)animated {
    [self.kirinHelper onResume];
    [super viewWillAppear:animated];
}

/*
- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
}
*/
/*
- (void)viewWillDisappear:(BOOL)animated {
	[super viewWillDisappear:animated];
}
*/

- (void)viewDidDisappear:(BOOL)animated {
    [self.kirinHelper onPause];
	[super viewDidDisappear:animated];
}


/*
 // Override to allow orientations other than the default portrait orientation.
- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation {
	// Return YES for supported orientations.
	return (interfaceOrientation == UIInterfaceOrientationPortrait);
}
 */

-(IBAction) buttonOnClick: (id)sender {    
    [self.kirinHelper jsMethod:@"onDumbButtonClick"];
	
}

-(IBAction) showListOnClick: (id)sender {
    [self.kirinHelper jsMethod:@"onNextScreenButtonClick"];
}

- (void) updateLabelSize:(int) size andText:(NSString*) text {
    NSLog(@"Setting label to %@ with size %d", text, size);
//    [self.label setFont:[UIFont fontWithName:@"Helvetica" size: size]];
	self.label.text = text;

    
}

- (void) changeScreen:(NSString*) text {
	NSLog(@"Request to change screen with argument: %@", text);
	if (!self.dumbListViewController) {
		self.dumbListViewController = [[[DumbListViewController alloc] initWithNibName:@"DumbListViewController" bundle:nil] autorelease];
	}
	[[self navigationController] pushViewController: self.dumbListViewController animated:YES];
}

#pragma mark -
#pragma mark Memory management

- (void)didReceiveMemoryWarning {
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Relinquish ownership any cached data, images, etc that aren't in use.
}

- (void)viewDidUnload {
    // Relinquish ownership of anything that can be recreated in viewDidLoad or on demand.
    // For example: self.myOutlet = nil;
    [self.kirinHelper onUnload];
}


- (void)dealloc {
    self.kirinHelper = nil;
    [super dealloc];
}


@end


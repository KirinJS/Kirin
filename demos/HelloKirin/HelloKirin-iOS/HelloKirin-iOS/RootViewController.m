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
#import <KirinKit/Kirin.h>

#import "DumbListViewController.h"

@implementation RootViewController
@synthesize label;
@synthesize dumbListViewController;

#pragma mark -
#pragma mark View lifecycle


- (void)viewDidLoad {
    [super viewDidLoad];

	UIBarButtonItem* editButton = [[[UIBarButtonItem alloc] initWithTitle:@"List" style:UIBarButtonItemStyleDone target:self action:@selector(showListOnClick:)] autorelease];
	self.navigationItem.rightBarButtonItem = editButton;
	
	self.navigationItem.title = @"How big?";
}



- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
	[KIRIN setCurrentScreen:self forName:@"DumbButtonScreen"];
    [KIRIN fireEventIntoJS:@"native2jsScreenProxy.onResume()"];
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
/*
- (void)viewDidDisappear:(BOOL)animated {
	[super viewDidDisappear:animated];
}
*/

/*
 // Override to allow orientations other than the default portrait orientation.
- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation {
	// Return YES for supported orientations.
	return (interfaceOrientation == UIInterfaceOrientationPortrait);
}
 */

-(IBAction) buttonOnClick: (id)sender {
	[KIRIN fireEventIntoJS:@"native2jsScreenProxy.onDumbButtonClick()"];
	
}

-(IBAction) showListOnClick: (id)sender {
	[KIRIN fireEventIntoJS:@"native2jsScreenProxy.onNextScreenButtonClick()"];
}

- (void) updateLabelSize:(NSInteger) size andText:(NSString*) text {
    NSLog(@"Setting label to %@ with size %@", text, size);
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
}


- (void)dealloc {
    [super dealloc];
}


@end


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



#import "DumbListViewController.h"

#import "IDumbListScreenModule.h"

@interface DumbListViewController () 



@property(retain, nonatomic) id<IDumbListScreenModule> screenModule;
@property(retain, nonatomic) NSArray* jsonList;

@end

@implementation DumbListViewController
@synthesize jsonList = jsonList_;
@synthesize screenModule = screenModule_;
#pragma mark -
#pragma mark View lifecycle


- (void)viewDidLoad {
    [super viewDidLoad];

    // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
    // self.navigationItem.rightBarButtonItem = self.editButtonItem;
	self.navigationItem.title = @"Alphabet";

    self.screenModule = [self bindScreen:@"DumbListScreenModule" withProtocol:@protocol(IDumbListScreenModule)];
 
}

- (void) populateList: (NSArray*) list {
	self.jsonList = list;

	[(UITableView*)self.view reloadData];
}

#pragma mark -
#pragma mark Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    // Return the number of sections.
    return 1;
}


- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    // Return the number of rows in the section.
    return [self.jsonList count];
}

- (NSString*) getRowAtIndex: (int) index {
    return [[self.jsonList objectAtIndex:index] objectForKey:@"key"];
}

// Customize the appearance of table view cells.
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    static NSString* cellReuseID = @"dumbCellIdentifier";
	UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellReuseID]; // Reuse cells where possible
	if (cell == nil) {
		NSArray *topLevelObjects = [[NSBundle mainBundle] loadNibNamed:@"DumbTableCell" owner:self options:nil];
		cell = [topLevelObjects objectAtIndex:0];
	}
	
	
    // Configure the cell...
    UILabel *dumbLabel = (UILabel *)[cell viewWithTag:42];


	dumbLabel.text = [self getRowAtIndex:indexPath.row];
	
    return cell;
}

#pragma mark -
#pragma mark Table view delegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    // Navigation logic may go here. Create and push another view controller.
	[self.screenModule onListItemClick:indexPath.row : [self getRowAtIndex:[indexPath row]]];
}

- (void) showToast:(NSString*) title {
	NSString* message = [NSString stringWithFormat:@"You clicked on %@", title];
	[[[[UIAlertView alloc] initWithTitle:@"Click!" message:message delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil] autorelease] show];
}


#pragma mark -
#pragma mark Memory management

- (void)viewDidUnload {
    // Relinquish ownership of anything that can be recreated in viewDidLoad or on demand.
    // For example: self.myOutlet = nil;
	self.jsonList = nil;
    self.screenModule = nil;
    [super viewDidUnload];
    
}


- (void)dealloc {
    [super dealloc];
}


@end


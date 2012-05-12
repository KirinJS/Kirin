//
//  __class_prefix__MasterScreen.h
//  __project_name__
//
//  Created by James Hugman on 30/04/2012.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

@protocol __class_prefix__MasterScreen <NSObject>

- (void) setTableContents: (NSArray*) tableRows;

- (void) insertRow: (NSNumber*) rowNumber withContents: (NSString*) rowContents;

- (void) displayDetailScreenForRow: (NSNumber*) row andContents: (NSString*) contents;

@end

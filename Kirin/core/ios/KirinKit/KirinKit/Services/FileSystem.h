//
//  FileSystem.h
//  KirinKit
//
//  Created by James Hugman on 08/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol FileSystem <NSObject>

- (void) readStringWithConfig: (NSDictionary*) config;

- (void) readJsonWithConfig: (NSDictionary*) config;

- (void) copyItemWithConfig: (NSDictionary*) config;

- (void) deleteItemWithConfig: (NSDictionary*) config; 

@end

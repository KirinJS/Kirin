//
//  KirinServiceProtocol.h
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>


@protocol KirinServiceProtocol <NSObject>

- (void) onLoad;

- (void) onStart;

- (void) onUnload;

- (NSString*) moduleName;

@end

//
//  KirinExtensionProtocol.h
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>


@protocol KirinExtensionProtocol <NSObject>

- (void) onLoad;

- (void) onStart;

- (void) onStop;

- (void) onUnload;

- (NSString*) moduleName;

@end

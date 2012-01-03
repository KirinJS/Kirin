//
//  NativeExecutor.h
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>


@protocol NativeExecutor <NSObject>
- (void) executeCommandFromModule: (NSString*) host andMethod: (NSString*) file andArgsList: (NSString*) query;
@end

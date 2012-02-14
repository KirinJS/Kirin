//
//  JSExecutor.h
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

#define DEBUG_JS NO

@protocol JSExecutor <NSObject>
- (void) execJS: (NSString*) js;
@end

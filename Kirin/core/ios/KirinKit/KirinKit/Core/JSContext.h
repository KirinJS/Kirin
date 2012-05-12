//
//  JSContext.h
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "JSExecutor.h"



@interface JSContext : NSObject<JSExecutor> {
}

@property(retain) id<JSExecutor> jsExecutor;

- (id) initWithJSExecutor:(id<JSExecutor>) executor;

- (void) js: (NSString*) js;

@end

//
//  DummyJSContext.h
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <KirinKit/JSContext.h>
#import <KirinKit/KirinServiceOnMainThread.h>
#import <KirinKit/JSExecutor.h>

@interface DummyJSContext : JSContext <KirinServiceOnMainThread, JSExecutor> {
}

@property(retain) NSString* lastCall;
        
@property(retain) NSMutableArray* jsCalls;

- (void) reset;

@end

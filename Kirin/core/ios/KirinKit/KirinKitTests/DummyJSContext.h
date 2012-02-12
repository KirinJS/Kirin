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

@interface DummyJSContext : JSContext <KirinServiceOnMainThread> {
    NSMutableArray* jsCalls;
}

@property(retain) NSMutableArray* jsCalls;

- (void) reset;

@end

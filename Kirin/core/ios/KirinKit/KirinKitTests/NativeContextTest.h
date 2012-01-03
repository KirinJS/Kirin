//
//  NativeContextTest.h
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <SenTestingKit/SenTestingKit.h>

#import <KirinKit/NativeContext.h>
#import "DummyJSContext.h"

@interface NativeContextTest : SenTestCase {
    NSMutableDictionary* nativeObjects;
    NativeContext* nativeCtx;
    
    DummyJSContext* jsCtx;
}

@end

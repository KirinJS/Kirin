//
//  KirinHelperTest.h
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <SenTestingKit/SenTestingKit.h>
#import <KirinKit/KirinHelper.h>
#import "DummyJSContext.h"

@interface KirinHelperTest : SenTestCase {
    DummyJSContext* ctx;
    KirinHelper* helper;
}

@end

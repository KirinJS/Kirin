//
//  KirinServiceHelper.m
//  KirinKit
//
//  Created by James Hugman on 10/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import "KirinServiceHelper.h"


@implementation KirinServiceHelper

- (void) onStart {
    [self jsMethod:@"onStart"];
}

- (void) onStop {
    [self jsMethod:@"onStop"];
}

@end

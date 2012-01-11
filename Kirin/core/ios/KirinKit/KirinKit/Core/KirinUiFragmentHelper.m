//
//  KirinUiFragmentHelper.m
//  KirinKit
//
//  Created by James Hugman on 10/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import "KirinUiFragmentHelper.h"


@implementation KirinUiFragmentHelper

- (void) onPause {
    [self jsMethod:@"onPause"];
}

- (void) onResume {
    [self jsMethod:@"onResume"];
}

@end

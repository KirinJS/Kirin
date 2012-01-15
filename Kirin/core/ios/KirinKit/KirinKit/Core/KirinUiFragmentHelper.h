//
//  KirinUiFragmentHelper.h
//  KirinKit
//
//  Created by James Hugman on 10/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import <KirinKit/KirinHelper.h>

@interface KirinUiFragmentHelper : KirinHelper {
    
}

- (void) onResume;

- (void) onResumeWithOptions: (NSDictionary*) options;

- (void) onPause;

@end

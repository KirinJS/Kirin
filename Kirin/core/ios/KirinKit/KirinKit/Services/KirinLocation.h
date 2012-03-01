//
//  KirinLocation.h
//  Moo
//
//  Created by James Hugman on 27/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol KirinLocation <NSObject>

- (void) startWithCallback: (NSString*) callback andErrback: (NSString*) errback;

- (void) stop;

- (void) forceRefresh;

@end

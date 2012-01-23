//
//  StringDownloader.h
//  KirinKit
//
//  Created by James Hugman on 19/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface StringDownloader : NSObject

+ (StringDownloader*) downloaderWithTarget:(id<NSObject>) target andCallback:(SEL)callback andErrback:(SEL)errback;



- (void) startDownloadWithConfig: (NSDictionary*) config;

@property(retain, nonatomic) NSDictionary* mConfig;

@end

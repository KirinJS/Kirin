//
//  StringDownloader.h
//  KirinKit
//
//  Created by James Hugman on 19/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>


typedef void (^SuccessBlock)(NSData* data);
typedef void (^ErrorBlock)(NSString* data);

@interface StringDownloader : NSObject

- (void) startDownloadWithConfig: (NSDictionary*) config;

@property(readwrite, copy, nonatomic) SuccessBlock successBlock; 
@property(readwrite, copy, nonatomic) ErrorBlock errorBlock;

@property(nonatomic) int statusCode;

@end

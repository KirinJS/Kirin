//
//  ImageTransformProtocol.h
//  KirinKit
//
//  Created by James Hugman on 08/03/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol ImageTransformProtocol <NSObject>
- (void) transform: (NSString*) transformType withConfig: (NSDictionary*) config;
@end

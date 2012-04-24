//
//  CameraProtocol.h
//  Moo
//
//  Created by James Hugman on 24/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol CameraProtocol <NSObject>

- (void) galleryPicture: (NSDictionary*) config;

- (void) cameraPicture: (NSDictionary*) config;

@end

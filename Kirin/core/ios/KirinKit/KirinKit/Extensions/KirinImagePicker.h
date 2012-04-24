//
//  KirinImagePicker.h
//  Moo
//
//  Created by James Hugman on 24/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//


#import <KirinKit/KirinKit.h>
#import <UIKit/UIKit.h>

#import "CameraProtocol.h"


@interface KirinImagePicker : KirinExtensionStub<CameraProtocol, KirinExtensionOnMainThread, UIImagePickerControllerDelegate, UINavigationControllerDelegate>

- (NSString*) saveImage: (UIImage*) image toFilename: (NSString*) filename andFileType: (NSString*) fileType;
- (UIImage*)imageByScalingAndCroppingForSize:(UIImage*)anImage toSize:(CGSize)targetSize;

@end

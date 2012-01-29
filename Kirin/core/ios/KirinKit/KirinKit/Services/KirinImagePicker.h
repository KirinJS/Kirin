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


@interface KirinImagePicker : KirinServiceStub<CameraProtocol, KirinServiceWithUI, UIImagePickerControllerDelegate, UINavigationControllerDelegate>

@end

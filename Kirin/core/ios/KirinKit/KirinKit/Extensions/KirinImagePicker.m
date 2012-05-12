//
//  KirinImagePicker.m
//  Moo
//
//  Created by James Hugman on 24/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinImagePicker.h"
#import <MobileCoreServices/UTCoreTypes.h>
#import <UIKit/UIViewController.h>
#import "KirinFileSystem.h"


@interface KirinImagePicker ()

- (void) cleanup;
- (void) getPicture: (NSDictionary*) config fromSource: (UIImagePickerControllerSourceType) sourceType;
- (void) presentModalViewController: picker;



- (UIImage*)imageCorrectedForCaptureOrientation:(UIImage*)anImage;


@property(retain, nonatomic) NSDictionary* config;

@end

@implementation KirinImagePicker 

@synthesize config = config_;

- (id) init {
    return [super initWithModuleName:@"Camera"];
}

- (void) cleanup {
    [self.kirinHelper cleanupCallback:self.config withNames:@"onSuccess", @"onError", @"onCancel", nil];
    self.config = nil;
}

- (void) cameraPicture:(NSDictionary *)config {
        NSLog(@"Pick an image from the camera");
    [self getPicture:config fromSource:UIImagePickerControllerSourceTypeCamera];    
}

- (void) galleryPicture:(NSDictionary *)config {
    NSLog(@"Pick an image from the gallery");
    [self getPicture:config fromSource:UIImagePickerControllerSourceTypeSavedPhotosAlbum];
}



#pragma mark - 
#pragma Utility methods.

- (void) getPicture: (NSDictionary*) config fromSource: (UIImagePickerControllerSourceType) sourceType {
    self.config = config;
    
    if (![UIImagePickerController isSourceTypeAvailable: sourceType]) {
        [self.kirinHelper jsCallback:@"onError" fromConfig:self.config withArgsList:@"'Image source is not available'"];
        [self cleanup];
        return;
    }
    
    NSLog(@"Image picker or camera is available");
    UIImagePickerController *picker = [[UIImagePickerController alloc] init];
    // select camera rather than library
    picker.sourceType = sourceType; 
	
    // Hides the controls for moving & scaling pictures, or for
    // trimming movies. To instead show the controls, use YES.
    picker.allowsEditing = YES;
    picker.delegate = self;
    [self presentModalViewController:picker];
}

- (void) presentModalViewController: (UIImagePickerController*) picker {
    [[self.kirinHelper viewController] presentModalViewController: picker animated: YES]; 
}


#pragma mark - Image delegate
// For responding to the user tapping Cancel.
- (void) imagePickerControllerDidCancel: (UIImagePickerController *) picker 
{
    NSLog(@"imagePickerControllerDidCancel");
    picker.delegate = nil;
    
	if([picker respondsToSelector:@selector(presentingViewController)]) {
        [[picker presentingViewController] dismissModalViewControllerAnimated: YES];
    } else {
        [picker dismissModalViewControllerAnimated:YES];
    } 
    [self.kirinHelper jsCallback:@"onCancel" fromConfig:self.config];
    [self cleanup];
    
}

// For responding to the user accepting a newly-captured picture or movie
- (void) imagePickerController: (UIImagePickerController *) picker
 didFinishPickingMediaWithInfo: (NSDictionary *) info {
	
    NSString *mediaType = [info objectForKey: UIImagePickerControllerMediaType];
    UIImage *originalImage, *editedImage, *imageToSave;
    // Handle a still image capture
    if (CFStringCompare ((CFStringRef) mediaType, kUTTypeImage, 0)
		== kCFCompareEqualTo) {
		
        editedImage = (UIImage *) [info objectForKey:UIImagePickerControllerEditedImage];
        originalImage = (UIImage *) [info objectForKey:UIImagePickerControllerOriginalImage];
        
        NSNumber* targetWidth = [self.config valueForKey:@"targetWidth"];
        NSNumber* targetHeight = [self.config valueForKey:@"targetHeight"];

        if (editedImage) {
            imageToSave = editedImage;
        } else {
            imageToSave = originalImage;
        }
        if(picker.sourceType == UIImagePickerControllerSourceTypeCamera)
        {
            // Also save the image to the Camera Roll  - NOT REALLY NECESSSARY BUT COULD BE USEFUL
            // This allows the user to then further exploit the image
            // only want to do this with photos from camera
            UIImageWriteToSavedPhotosAlbum (originalImage, nil, nil , nil);
		}

        if (targetWidth != nil && targetHeight != nil) {
            CGSize targetSize = CGSizeMake([targetWidth floatValue], [targetHeight floatValue]);
            imageToSave = [self imageByScalingAndCroppingForSize:imageToSave toSize:targetSize];
        }
         

        NSString* filename = [self.config objectForKey:@"filename"];
        if (filename) {
            KirinFileSystem* fs = [KirinFileSystem fileSystem];
            NSString* fileArea = [self.config objectForKey:@"fileArea"];
            NSString* fullPath = [fs filePath:filename inArea:fileArea];
            [fs mkdirForFile:fullPath];
            NSString* err = [self saveImage:imageToSave toFilename:fullPath andFileType:[self.config objectForKey:@"fileType"]];
            if (err) {
                [self.kirinHelper jsCallback:@"onError" fromConfig:self.config withArgsList:[NSString stringWithFormat:@"'%@'", err]];            
                filename = nil;
            } else {
                filename = fullPath;
            }
        } else {
            filename = [[self.kirinHelper dropbox] putObject:imageToSave withTokenPrefix:@"camera."];
        }
        
        if (filename) {
            [self.kirinHelper jsCallback:@"onSuccess" fromConfig:self.config withArgsList:[NSString stringWithFormat:@"'%@'", filename]];
        }
    } // NB we're not allowing kUTTypeAudiovisualContent
    
    [picker dismissModalViewControllerAnimated:YES];
    [self cleanup];
    picker.delegate = nil;
    [picker release];
}

#pragma mark - 
#pragma mark Image manipulation.

- (NSString*) saveImage: (UIImage*) image toFilename: (NSString*) filename andFileType: (NSString*) fileType {
    NSData* data = nil;
    if ([fileType isEqualToString:@"png"]) {
        data = UIImagePNGRepresentation(image);
    } else if ([fileType isEqualToString:@"jpeg"]) {
        data = UIImageJPEGRepresentation(image, 1.0f);
    }

    
    KirinFileSystem* fs = [KirinFileSystem fileSystem];

    if ([fs mkdirForFile:filename]) {
        NSError* err = nil;
        
        if (![data writeToFile:filename options:NSDataWritingAtomic error:&err]) {
            return [err localizedDescription];
        }
    } else {
        return [NSString stringWithFormat:@"Could not create a directory to put %@ in", filename];
    }
    

    return nil;
}

- (UIImage*)imageByScalingAndCroppingForSize:(UIImage*)anImage toSize:(CGSize)targetSize {
    UIImage *sourceImage = anImage;
    UIImage *newImage = nil;        
    CGSize imageSize = sourceImage.size;
    CGFloat width = imageSize.width;
    CGFloat height = imageSize.height;
    CGFloat targetWidth = targetSize.width;
    CGFloat targetHeight = targetSize.height;
    CGFloat scaleFactor = 0.0;
    CGFloat scaledWidth = targetWidth;
    CGFloat scaledHeight = targetHeight;
    CGPoint thumbnailPoint = CGPointMake(0.0,0.0);
    
    if (CGSizeEqualToSize(imageSize, targetSize) == NO) 
    {
        CGFloat widthFactor = targetWidth / width;
        CGFloat heightFactor = targetHeight / height;
        
        if (widthFactor > heightFactor) 
            scaleFactor = widthFactor; // scale to fit height
        else
            scaleFactor = heightFactor; // scale to fit width
        scaledWidth  = width * scaleFactor;
        scaledHeight = height * scaleFactor;
        
        // center the image
        if (widthFactor > heightFactor)
        {
            thumbnailPoint.y = (targetHeight - scaledHeight) * 0.5; 
        }
        else 
            if (widthFactor < heightFactor)
            {
                thumbnailPoint.x = (targetWidth - scaledWidth) * 0.5;
            }
    }       
    
    UIGraphicsBeginImageContext(targetSize); // this will crop
    
    CGRect thumbnailRect = CGRectZero;
    thumbnailRect.origin = thumbnailPoint;
    thumbnailRect.size.width  = scaledWidth;
    thumbnailRect.size.height = scaledHeight;
    
    [sourceImage drawInRect:thumbnailRect];
    
    newImage = UIGraphicsGetImageFromCurrentImageContext();
    if(newImage == nil) 
        NSLog(@"could not scale image");
    
    //pop the context to get back to the default
    UIGraphicsEndImageContext();
    return newImage;
}

- (UIImage*)imageCorrectedForCaptureOrientation:(UIImage*)anImage
{   
    float rotation_radians = 0;
    bool perpendicular = false;
    switch ([anImage imageOrientation]) {
        case UIImageOrientationUp:
            rotation_radians = 0.0;
            break;
        case UIImageOrientationDown:   
            rotation_radians = M_PI; //don't be scared of radians, if you're reading this, you're good at math
            break;
        case UIImageOrientationRight:
            rotation_radians = M_PI_2;
            perpendicular = true;
            break;
        case UIImageOrientationLeft:
            rotation_radians = -M_PI_2;
            perpendicular = true;
            break;
        default:
            break;
    }
    
    UIGraphicsBeginImageContext(CGSizeMake(anImage.size.width, anImage.size.height));
    CGContextRef context = UIGraphicsGetCurrentContext();
    
    //Rotate around the center point
    CGContextTranslateCTM(context, anImage.size.width/2, anImage.size.height/2);
    CGContextRotateCTM(context, rotation_radians);
    
    CGContextScaleCTM(context, 1.0, -1.0);
    float width = perpendicular ? anImage.size.height : anImage.size.width;
    float height = perpendicular ? anImage.size.width : anImage.size.height;
    CGContextDrawImage(context, CGRectMake(-width / 2, -height / 2, width, height), [anImage CGImage]);
    
    // Move the origin back since the rotation might've change it (if its 90 degrees)
    if (perpendicular) {
        CGContextTranslateCTM(context, -anImage.size.height/2, -anImage.size.width/2);
    }
    
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return newImage;
}


- (void) dealloc {
    self.config = nil;
    [super dealloc];
}

@end

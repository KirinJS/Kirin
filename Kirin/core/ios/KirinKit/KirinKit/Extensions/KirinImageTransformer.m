//
//  KirinImageTransformer.m
//  KirinKit
//
//  Created by James Hugman on 08/03/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinImageTransformer.h"

#import "KirinImagePicker.h"

@interface KirinImageTransformer ()

@property(retain, nonatomic) KirinImagePicker* camera;

@end

@implementation KirinImageTransformer

@synthesize camera;

+ (KirinImageTransformer*) instance {
    return [[[KirinImageTransformer alloc] init] autorelease];
}

- (id) init {
    self = [super initWithModuleName:@"ImageTransform"];
    if (self) {
        self.camera = [[[KirinImagePicker alloc] init] autorelease];
    }
    return self;
}

- (void) transform: (NSString*) transformType withConfig: (NSDictionary*) config {
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    BOOL supported = NO;
    NSString* fromImageFilepath = [fs filePathFromConfig:config withPrefix:@"from"]; 
    NSString* toFilepath = [fs filePathFromConfig:config withPrefix:@"to"];
    
    if (![[config objectForKey:@"overwrite"] boolValue] && [fs fileExists:toFilepath]) {
        supported = YES;
        [self.kirinHelper jsCallback:@"callback" fromConfig:config withArgsList:[KirinArgs string:toFilepath]];
    } else if ([transformType isEqualToString:@"size"]) {
        
        UIImage* image = [UIImage imageWithContentsOfFile:fromImageFilepath];
        
        
        CGFloat width = [[config objectForKey:@"width"] floatValue];
        CGFloat height = [[config objectForKey:@"height"] floatValue];
        UIImage* toImage = [self.camera imageByScalingAndCroppingForSize: image toSize:CGSizeMake(width, height)];
        if ([self.camera saveImage:toImage toFilename:toFilepath andFileType:[config objectForKey:@"fileType"]] == nil) {
            [self.kirinHelper jsCallback:@"callback" fromConfig:config withArgsList:[KirinArgs string:toFilepath]];
            
        } else {
            [self.kirinHelper jsCallback:@"errback" fromConfig:config withArgsList:[KirinArgs string:toFilepath]];
            
            
        }
        supported = YES;
    }
    
    if (!supported) {
        [self.kirinHelper jsCallback:@"errback" fromConfig:config withArgsList:[KirinArgs string: @"Unsupported transform type"]];
    }
    
    [self.kirinHelper cleanupCallback:config withNames:@"callback", @"errback", nil];   
    
}

- (void) dealloc {
    self.camera = nil;
    [super dealloc];
}

@end

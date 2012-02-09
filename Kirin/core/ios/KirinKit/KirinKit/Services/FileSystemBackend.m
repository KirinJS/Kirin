//
//  FileSystemBackend.m
//  KirinKit
//
//  Created by James Hugman on 08/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "FileSystemBackend.h"

#import "KirinFileSystem.h"

@implementation FileSystemBackend

- (id) init {
    return [super initWithModuleName:@"FileSystem"];
}

- (void) readStringWithConfig: (NSDictionary*) config {
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    
    /*
     backend.readStringWithConfig_({
     fileArea: fileArea, 
     filename: filename, 
     callback: wrapCallback(callback, "FileSytem", "readStringCb."),
     errback: wrapCallback(errback, "FileSytem", "readStringErr.")
     });
     */
    NSString* filePath = [fs filePath:[config objectForKey:@"filename"] inArea:[config objectForKey:@"fileArea"]];
    
    NSLog(@"Reading file at %@",filePath);
    // TODO check if the file exists.
    
    NSString* str = [fs readString:filePath];
    
    // TODO: we _need_ a KirinStringUtils.
    
    

    if (!str) {
        
        [self.kirinHelper jsCallback:@"errback" fromConfig:config withArgsList:@"'There is no spoon'"];
    }
    
    
    [self.kirinHelper jsCallback:@"callback" fromConfig:config withArgsList:[NSString stringWithFormat:@"'%@'", str]];
    
    
    [self.kirinHelper cleanupCallback:config withNames:@"callback", @"errback", nil];
}

- (void) readJsonWithConfig: (NSDictionary*) config {

}
    
- (void) copyItemWithConfig: (NSDictionary*) config {
    /*
     backend.copyItemWithConfig_({
     fromFileArea: fromFileArea, 
     fromFilename: fromFilename,
     
     toFileArea: toFileArea, 
     toFilename: toFilename,
     
     callback: wrapCallback(callback, "FileSytem", "copyCb."),
     errback: wrapCallback(errback, "FileSytem", "copyErr.")
     });
     */
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    NSString* srcFilePath = [fs filePath:[config objectForKey:@"fromFilename"] inArea:[config objectForKey:@"fromFileArea"]];
    NSString* destFilePath = [fs filePath:[config objectForKey:@"toFilename"] inArea:[config objectForKey:@"toFileArea"]];
    
        // TODO check if the src file exists,
    
    [fs copyFrom:srcFilePath to:destFilePath];
    
    
    [self.kirinHelper jsCallback:@"callback" fromConfig:config withArgsList:[NSString stringWithFormat:@"'%@'", destFilePath]];
    
    [self.kirinHelper cleanupCallback:config withNames:@"callback", @"errback", nil];
     
}

- (void) deleteItemWithConfig: (NSDictionary*) config {
    
}

@end

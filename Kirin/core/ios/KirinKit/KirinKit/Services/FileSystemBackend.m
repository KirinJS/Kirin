//
//  FileSystemBackend.m
//  KirinKit
//
//  Created by James Hugman on 08/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "FileSystemBackend.h"

#import "KirinFileSystem.h"

@interface FileSystemBackend ()

- (NSString*) readStringOrNilFromConfig: (NSDictionary*) config;

- (void) cleanupConfig: (NSDictionary*) config;

@end

@implementation FileSystemBackend

- (id) init {
    return [super initWithModuleName:@"FileSystem"];
}

- (void) readStringWithConfig: (NSDictionary*) config {

    NSString* str = [self readStringOrNilFromConfig:config];
    
    if (str != nil) {
        [self.kirinHelper jsCallback:@"callback" 
                          fromConfig:config 
                        withArgsList:[NSString stringWithFormat:@"'%@'", str]];
    }
    
    [self cleanupConfig:config];
}

- (void) readJsonWithConfig: (NSDictionary*) config {
    NSString* str = [self readStringOrNilFromConfig: config];
    if (str != nil) {
        // currently assumes that this is JSON.
        [self.kirinHelper jsCallback:@"callback" 
                          fromConfig:config 
                        withArgsList:str];
    }
    
    [self cleanupConfig:config];
}

- (NSString*) readStringOrNilFromConfig: (NSDictionary*) config {
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    NSString* filePath = [fs filePathFromConfig:config];
    

    // TODO check if the file exists.
    
    NSString* str = [fs readString:filePath];
    
    // TODO: we _need_ a KirinStringUtils.
    
    
    
    if (!str) {
        [self.kirinHelper jsCallback:@"errback" fromConfig:config withArgsList:[NSString stringWithFormat:@"'The file %@ is empty'", filePath]];
    }
    
    return str;

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
    NSString* srcFilePath = [fs filePathFromConfig:config withPrefix:@"from"];
    NSString* destFilePath = [fs filePathFromConfig:config withPrefix:@"to"];
    
        // TODO check if the src file exists,
    
    [fs copyFrom:srcFilePath to:destFilePath];
    
    
    [self.kirinHelper jsCallback:@"callback" fromConfig:config withArgsList:[NSString stringWithFormat:@"'%@'", destFilePath]];
    

    [self cleanupConfig:config]; 
}


- (void) cleanupConfig: (NSDictionary*) config {
    [self.kirinHelper cleanupCallback:config withNames:@"callback", @"errback", nil];
    
}

- (void) deleteItemWithConfig: (NSDictionary*) config {
    
    [self cleanupConfig:config];
}

- (void) fileListFromConfig: (NSDictionary*) config {
    NSMutableArray* fileObjectList = [[NSMutableArray arrayWithCapacity:1] autorelease];
    
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    NSString* filePath = [fs filePathFromConfig:config];
    
    

    
    [self cleanupConfig:config];
}

@end

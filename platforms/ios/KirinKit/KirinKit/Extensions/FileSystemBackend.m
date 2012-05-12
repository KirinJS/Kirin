//
//  FileSystemBackend.m
//  KirinKit
//
//  Created by James Hugman on 08/02/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "FileSystemBackend.h"

#import "KirinFileSystem.h"
#import "JSON.h"

@interface FileSystemBackend ()

- (NSString*) readStringOrNilFromConfig: (NSDictionary*) config;

- (void) cleanupConfig: (NSDictionary*) config;

@end

@implementation FileSystemBackend

#pragma mark -
#pragma mark Constructors 

- (id) init {
    return [super initWithModuleName:@"FileSystem"];
}

#pragma mark -
#pragma mark Protocol methods. 

- (void) readStringWithConfig: (NSDictionary*) config {

    NSString* str = [self readStringOrNilFromConfig:config];
    
    if (str != nil) {
        
        [self.kirinHelper jsCallback:@"callback" 
                          fromConfig:config 
                        withArgsList:[KirinArgs taintedForJs:str]];
    }
    
    [self cleanupConfig:config];
}

- (void) readJsonWithConfig: (NSDictionary*) config {
    NSString* str = [self readStringOrNilFromConfig: config];
    if (str != nil) {
        // currently assumes that this is JSON.
        [self.kirinHelper jsCallback:@"callback" 
                          fromConfig:config 
                        withArgsList:[[str JSONValue] JSONRepresentation]];
        // we parse this then give a canonical source so as to make sure it's all on one line.
    }
    
    [self cleanupConfig:config];
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

- (void) writeStringWithConfig:(NSDictionary *)config {

    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    NSString* string = (NSString*) [config objectForKey:@"contents"];
    NSData* data = [string dataUsingEncoding:NSUTF8StringEncoding allowLossyConversion:YES];
    NSString* filePath = [fs filePathFromConfig: config];
    NSLog(@"FileSystemBackend: Saving file to disk %@", filePath);
    if (filePath != nil && [fs writeData:data toFile:filePath]) {
        [self.kirinHelper jsCallback:@"callback" 
                          fromConfig:config 
                        withArgsList:[NSString stringWithFormat:@"'%@'", filePath]];
    } else {
        [self.kirinHelper jsCallback:@"errback" 
                          fromConfig:config                        
                        withArgsList:[NSString stringWithFormat:@"Could not save file to %@", filePath]];
    }
    
    
    
    [self cleanupConfig:config];
}

- (void) deleteItemWithConfig: (NSDictionary*) config {
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    NSString* filePath = [fs filePathFromConfig:config];
    
    if ([fs rmForce:filePath]) {
        [self.kirinHelper jsCallback:@"callback" fromConfig:config withArgsList:[NSString stringWithFormat:@"'%@'", filePath]];
    } else {
        [self.kirinHelper jsCallback:@"errback" fromConfig:config withArgsList:[NSString stringWithFormat:@"'Problem deleting %@'", filePath]];
    }
    
    [self cleanupConfig:config];
}

- (void) fileListFromConfig: (NSDictionary*) config {
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    NSString* filePath = [fs filePathFromConfig:config];
    if (filePath == nil) {
        [self.kirinHelper jsCallback:@"errback" fromConfig:config withArgsList:@"'Problem finding directory to list'"];
    } else {
    
        NSArray* files = [fs list:filePath];

        if (files == nil) {
            [self.kirinHelper jsCallback:@"errback" fromConfig:config withArgsList:[NSString stringWithFormat:@"'Problem listing directory at %@'", filePath]];        
        
         } else {
             [self.kirinHelper jsCallback:@"callback" fromConfig:config withArgsList:[files JSONRepresentation]]; 
         }
    }
    [self cleanupConfig:config];
}

#pragma mark -
#pragma mark Helper methods.

- (NSString*) readStringOrNilFromConfig: (NSDictionary*) config {
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    NSString* filePath = [fs filePathFromConfig:config];
    
    
    // TODO check if the file exists.
    
    NSString* str = [fs readStringFromFilepath:filePath];
    
    // TODO: we _need_ a KirinStringUtils.
    
    
    
    if (!str) {
        [self.kirinHelper jsCallback:@"errback" fromConfig:config withArgsList:[NSString stringWithFormat:@"'The file %@ is empty'", filePath]];
    }
    
    return str;
    
}

- (void) cleanupConfig: (NSDictionary*) config {
    [self.kirinHelper cleanupCallback:config withNames:@"callback", @"errback", nil];
    
}

@end

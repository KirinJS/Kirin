//
//  KirinFileSystem.m
//  KirinKit
//
//  Created by James Hugman on 27/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinFileSystem.h"
#import "KirinPaths.h"

@interface KirinFileSystem ()

@end

@implementation KirinFileSystem

- (BOOL) mkdir: (NSString*) newDir {
    NSFileManager *filemgr =[NSFileManager defaultManager];
    BOOL ret = YES;
    if ([filemgr createDirectoryAtPath:newDir withIntermediateDirectories:YES attributes:nil error: NULL] == NO)
    {
        // Failed to create directory
        ret = NO;
    }
    [filemgr release];
    return ret;
}

- (BOOL) rmForce: (NSString*) fileOrDir {
    NSFileManager *filemgr =[NSFileManager defaultManager];
    BOOL ret = [filemgr removeItemAtPath:fileOrDir error:nil];
    [filemgr release];
    return ret;
}

- (BOOL) mkdirForFile: (NSString*) filePath {
    NSMutableArray* directoryParts = [NSMutableArray arrayWithArray:[filePath componentsSeparatedByString:@"/"]];
    [directoryParts removeLastObject];
    
    return [self mkdir: [directoryParts componentsJoinedByString:@"/"]];
}

- (BOOL) writeData: (NSData*) data toFile: filePath {
    NSFileManager *filemgr =[NSFileManager defaultManager];
    BOOL ret = [self mkdirForFile:filePath] && [filemgr createFileAtPath:filePath contents:data attributes:nil];
    [filemgr release];
    return ret;
}

- (NSString*) filePath: (NSString*) filePath inArea: (NSString*) fileArea {
    if (fileArea) {
        // TODO not sure we have the right names yet.
        if ([@"assets" isEqualToString:fileArea]) {
            return [KirinPaths filePathInAppAssets:filePath];
        } else if ([@"temporary" isEqualToString:fileArea]) {
            return [KirinPaths filePathInTempDir:filePath];
        } else if ([@"external" isEqualToString:fileArea]) {
            return [KirinPaths filePathInDocuments:filePath];
        }
    }
    
    NSLog(@"No fileArea was specified, so defaulting to 'temporary'");
    return [KirinPaths filePathInTempDir:filePath];
}


@end

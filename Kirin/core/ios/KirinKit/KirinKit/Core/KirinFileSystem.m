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

+ (KirinFileSystem*) fileSystem {
    return [[[KirinFileSystem alloc] init] autorelease];
}

- (BOOL) mkdir: (NSString*) newDir {
    NSFileManager *filemgr =[NSFileManager defaultManager];
    BOOL ret = YES;
    if ([filemgr createDirectoryAtPath:newDir withIntermediateDirectories:YES attributes:nil error: NULL] == NO)
    {
        // Failed to create directory
        ret = NO;
    }
    return ret;
}

- (BOOL) rmForce: (NSString*) fileOrDir {
    NSFileManager *filemgr =[NSFileManager defaultManager];
    return [filemgr removeItemAtPath:fileOrDir error:nil];
}

- (BOOL) mkdirForFile: (NSString*) filePath {
    NSMutableArray* directoryParts = [NSMutableArray arrayWithArray:[filePath componentsSeparatedByString:@"/"]];
    [directoryParts removeLastObject];
    
    return [self mkdir: [directoryParts componentsJoinedByString:@"/"]];
}

- (BOOL) writeData: (NSData*) data toFile: (NSString*) filePath {
    return [self mkdirForFile:filePath] && [data writeToFile:filePath atomically:YES];
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
        } else if ([@"internal" isEqualToString:fileArea]) {
            return [KirinPaths filePathInDocuments:filePath];
        }
    }
    
    NSLog(@"No fileArea was specified, so defaulting to 'temporary'");
    return [KirinPaths filePathInTempDir:filePath];
}

- (NSString*) readString: (NSString*) filePath {
    NSMutableData* data = [NSData dataWithContentsOfFile:filePath];
    return [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
}

- (BOOL) copyFrom: (NSString*) srcFilePath to:(NSString*) destFilePath {
    [self mkdirForFile:destFilePath];
    NSFileManager *filemgr =[NSFileManager defaultManager];
    return [filemgr copyItemAtPath:srcFilePath toPath:destFilePath error:nil];
}

- (BOOL) fileExists: (NSString*) filePath {
    NSFileManager *filemgr =[NSFileManager defaultManager];
    return [filemgr fileExistsAtPath:filePath];
}

- (NSArray*) list: (NSString*) dirPath {
    NSFileManager *filemgr =[NSFileManager defaultManager];
    NSArray* filenames = [filemgr contentsOfDirectoryAtPath:dirPath error:nil];
    
    if (filenames == nil) {
        return nil;
    }
        
    NSMutableArray* files = [NSMutableArray arrayWithCapacity:[filenames count]];
    
    for (int i=0, max=[filenames count]; i<max; i++) {
        NSString* filename = [filenames objectAtIndex:i];
        NSString* filePath = [KirinPaths join:dirPath andFilePath:filename];

        NSDictionary* attributes = [filemgr attributesOfItemAtPath:filePath error:nil];
        NSMutableDictionary* forJs = nil;
        if ([attributes fileType] == NSFileTypeRegular) {
            forJs = [NSMutableDictionary dictionary];
            [forJs setObject:@"file" forKey:@"fileType"];
            [forJs setObject:[NSNumber numberWithLong:[attributes fileSize]] forKey:@"fileSize"];
        } else if ([attributes fileType] == NSFileTypeDirectory) {
            forJs = [NSMutableDictionary dictionary];
            [forJs setObject:@"directory" forKey:@"fileType"];
        }
        
        if (forJs != nil) {
            [forJs setObject:[NSNumber numberWithBool:[attributes fileType] == NSFileTypeDirectory] forKey: @"isDirectory"];
            [forJs setObject:filename forKey:@"filename"];
            [forJs setObject:filePath forKey:@"filePath"];
            [forJs setObject: [NSNumber numberWithBool:[filemgr isWritableFileAtPath:filename]] forKey:@"isWriteable"];
            [files addObject:forJs];
        }
    }
    
    return files;
    
}

- (NSString*) filePathFromConfig: (NSDictionary*) config {
    NSString* path = [config objectForKey:@"filePath"];
    if (path) {
        return path;
    }
    
    return [self filePath:[config objectForKey:@"filename"] inArea:[config objectForKey:@"fileArea"]];
}

- (NSString*) filePathFromConfig: (NSDictionary*) config withPrefix:(NSString*) prefix {
    NSString* path = [config objectForKey:[NSString stringWithFormat:@"%@FilePath", prefix]];
    if (path) {
        return path;
    }
    
    return [self filePath:[config objectForKey:[NSString stringWithFormat:@"%@Filename", prefix]] inArea:[config objectForKey:[NSString stringWithFormat:@"%@FileArea", prefix]]];    
}
@end

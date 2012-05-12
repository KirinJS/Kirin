//
//  KirinFileSystem.h
//  KirinKit
//
//  Created by James Hugman on 27/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface KirinFileSystem : NSObject

+ (KirinFileSystem*) fileSystem;

- (NSString*) filePath: (NSString*) filePath inArea: (NSString*) fileArea;

- (BOOL) writeData: (NSData*) data toFile: (NSString*) filePath;

- (BOOL) mkdirForFile: (NSString*) filePath;

- (BOOL) rmForce: (NSString*) fileOrDir;

- (BOOL) mkdir: (NSString*) newDir;

- (NSString*) readStringFromFilepath: (NSString*) filePath;

- (BOOL) copyFrom: (NSString*) srcFilePath to:(NSString*) destFilePath; 

- (NSString*) filePathFromConfig: (NSDictionary*) config withPrefix:(NSString*) prefix;

- (NSString*) filePathFromConfig: (NSDictionary*) config;

- (NSArray*) list: (NSString*) filePath;

- (BOOL) fileExists: (NSString*) filePath;



@end

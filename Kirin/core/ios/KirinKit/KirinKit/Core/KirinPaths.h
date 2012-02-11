//
//  KirinPaths.h
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface KirinPaths : NSObject {
    
}


+ (NSString*) indexFilename;

+ (NSString*) javascriptDirectory;

+ (NSString*) pathForResource:(NSString*)resourcepath;

+ (NSString*) filePathInDocuments: (NSString*) path;

+ (NSString*) filePathInTempDir: (NSString*) path;

+ (NSString*) filePathInAppAssets: (NSString*) path;

+ (NSString*) fileInJavascriptDir: (NSString*) path;

+ (NSString*) join: (NSString*) prefix andFilePath: (NSString*) suffix;

@end

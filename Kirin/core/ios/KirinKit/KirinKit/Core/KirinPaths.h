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

@end

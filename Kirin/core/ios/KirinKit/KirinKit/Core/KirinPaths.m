//
//  KirinPaths.m
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import "KirinPaths.h"


@implementation KirinPaths


+ (NSString*) indexFilename {
	return @"index-ios.html";
}

+ (NSString*) javascriptDirectory {
	return @"generated-javascript";
}

+ (NSString*) pathForResource:(NSString*)resourcepath {
    NSBundle * mainBundle = [NSBundle mainBundle];
    NSMutableArray *directoryParts = [NSMutableArray arrayWithArray:[resourcepath componentsSeparatedByString:@"/"]];
    NSString       *filename       = [directoryParts lastObject];
    [directoryParts removeLastObject];
	
    NSString *directoryStr = [NSString stringWithFormat:@"%@%@", [self javascriptDirectory], [directoryParts componentsJoinedByString:@"/"]];
    return [mainBundle pathForResource:filename ofType:@"" inDirectory:directoryStr];
}

@end

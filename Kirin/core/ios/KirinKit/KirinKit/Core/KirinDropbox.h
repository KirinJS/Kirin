//
//  KirinDropbox.h
//  KirinKit
//
//  Created by James Hugman on 23/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface KirinDropbox : NSObject {
 
    
    
    @private
    NSMutableDictionary* dropbox;
    int dropboxCounter;
}


- (NSString*) putObject:(id) object withTokenPrefix:(NSString*) tokenPrefix;

- (NSObject*) consumeObjectWithToken:(NSString*) token;

- (void) disposeObjectWithToken:(NSString*) token;


@end

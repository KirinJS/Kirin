//
//  KirinDropbox.m
//  KirinKit
//
//  Created by James Hugman on 23/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "KirinDropbox.h"


@implementation KirinDropbox

- (id) init {
    self = [super init];
    
    if (self) {
        dropbox = [[NSMutableDictionary alloc] init];
        dropboxCounter = 0;
    }
    
    return self;
}

#pragma mark -
#pragma mark Dropbox methods

- (NSString*) putObject:(id) object withTokenPrefix:(NSString*) tokenPrefix {
    NSString* token = [NSString stringWithFormat:@"%@.%d", tokenPrefix, dropboxCounter];
    [dropbox setObject:object forKey:token];
    
    dropboxCounter++;
    return token;
}

- (NSString*) putObject:(id) object withToken:(NSString*) token {
    [dropbox setObject:object forKey:token];
    return token;
}

- (NSObject*) consumeObjectWithToken:(NSString*) token {
    if (!token) {
        return nil;
    }
    NSObject* obj = [[[dropbox objectForKey:token] retain] autorelease];
    [dropbox removeObjectForKey:token];
    return obj;
}

- (void) disposeObjectWithToken:(NSString*) token {
    [dropbox removeObjectForKey:token];
}

- (NSObject*) getObjectWithToken:(NSString*) token {
    NSObject* obj = [[[dropbox objectForKey:token] retain] autorelease];
    return obj;
}

#pragma mark -
#pragma mark Memory management
- (void) dealloc {
    [dropbox removeAllObjects];
    [dropbox release];
    [super dealloc];
}

@end

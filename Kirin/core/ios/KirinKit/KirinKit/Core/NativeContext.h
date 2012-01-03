//
//  NativeContext.h
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <KirinKit/NativeExecutor.h>

@interface NativeContext : NSObject<NativeExecutor> {
    @private
    NSMutableDictionary* nativeObjects;
}

- (id) init;

- (id) initWithDictionary: (NSMutableDictionary*) nativeObjs;

- (NSArray*) methodNamesFor: (id) object;

- (void) registerNativeObject: (id) object asName: (NSString*) name;

- (void) unregisterNativeObject: (NSString*) name;

@end

//
//  DummyNativeObject.h
//  KirinKit
//
//  Created by James Hugman on 24/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <KirinKit/KirinServiceOnMainThread.h>

@interface DummyNativeObject : NSObject<KirinServiceOnMainThread>

@property(nonatomic) SEL lastMethod;

@property(retain, nonatomic) NSString* lastArg;

- (void) methodWithNoArgs;

- (void) methodWithArg: (NSString*) string0;

- (void) methodWithArg: (NSString*) string0 andArg: (NSString*) string1;

- (void) methodWithArg: (NSString*) string0 andArg: (NSString*) string1 andArg: (NSString*) string3;

@end

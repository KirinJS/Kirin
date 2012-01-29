//
//  NativeObjectHolder.h
//  KirinKit
//
//  Created by James Hugman on 29/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NativeObjectHolder : NSObject

+ (NativeObjectHolder*) holderForObject: (NSObject*) object;

@property(retain, nonatomic) NSObject* nativeObject;
@property(nonatomic) dispatch_queue_t dispatchQueue;

@end

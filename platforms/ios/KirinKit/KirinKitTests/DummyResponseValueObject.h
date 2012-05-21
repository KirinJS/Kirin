//
//  DummyResponseValueObject.h
//  KirinKit
//
//  Created by James Hugman on 21/05/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol DummyResponseValueObject <NSObject>

@property(assign) NSString* string;

@property(assign) BOOL boolean;


- (void) setInteger: (int) value;



@end

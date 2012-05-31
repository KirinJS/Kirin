//
//  DummyResponseValueObject.h
//  KirinKit
//
//  Created by James Hugman on 21/05/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol DummyResponseValueObject <NSObject>

@property(retain) NSString* string;

- (BOOL) boolean;
- (void) setBoolean: (BOOL) value;


@property int integer;



@end

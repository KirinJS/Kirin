//
//  DummyValueObject.h
//  KirinKit
//
//  Created by James Hugman on 26/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//


@protocol DummyValueObject <NSObject>

- (int) number;

- (NSString*) string;

- (NSDictionary*) dictionary;

- (NSNumber*) numberObject;

- (BOOL) boolean;

- (int) intNotThere;

- (NSString*) stringNotThere;

@end

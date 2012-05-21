//
//  KirinProxyWithEmptyDictionary.h
//  KirinKit
//
//  Created by James Hugman on 18/05/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinProxy.h"

@interface KirinProxyWithEmptyDictionary : KirinProxy

- (id) initWithProtocol:(Protocol *)protocol;

- (id) initWithProtocol:(Protocol *)protocol andDictionary: (NSDictionary*) dictionary;

- (NSString*) JSONValue;

@end

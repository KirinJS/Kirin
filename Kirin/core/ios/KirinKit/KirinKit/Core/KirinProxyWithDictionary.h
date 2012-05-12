//
//  KirinProxyWithDictionary.h
//  KirinKit
//
//  Created by James Hugman on 26/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinProxy.h"

@interface KirinProxyWithDictionary : KirinProxy

- (id) initWithProtocol: (Protocol*) protocol andDictionary: (NSDictionary*) dictionary;

@end

//
//  KirinProxy.h
//  KirinKit
//
//  Created by James Hugman on 31/03/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>


#import "JSExecutor.h"

@interface KirinProxy : NSObject

+ (KirinProxy*) proxyWithProtocol: (Protocol*) protocol andModuleName: (NSString*) moduleName andExecutor: (id<JSExecutor>) executor;

@end

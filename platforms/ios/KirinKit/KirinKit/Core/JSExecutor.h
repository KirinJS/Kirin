//
//  JSExecutor.h
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>

#define DEBUG_JS NO

#define EXECUTE_METHOD_JS @"EXPOSED_TO_NATIVE.native2js.execMethod('%@', '%@')"
#define EXECUTE_METHOD_WITH_ARGS_JS @"EXPOSED_TO_NATIVE.native2js.execMethod('%@', '%@', %@)"
#define DEPRECATED_EXECUTE_METHOD_WITH_ARGS_JS @"EXPOSED_TO_NATIVE.native2js.execMethod('%@', '%@', [%@])"

#define EXECUTE_CALLBACK_JS @"EXPOSED_TO_NATIVE.native2js.execCallback('%@')"
#define EXECUTE_CALLBACK_WITH_ARGS_JS @"EXPOSED_TO_NATIVE.native2js.execCallback('%@', %@)"
#define DEPRECATED_EXECUTE_CALLBACK_WITH_ARGS_JS @"EXPOSED_TO_NATIVE.native2js.execCallback('%@', [%@])"

#define DELETE_CALLBACK_JS @"EXPOSED_TO_NATIVE.native2js.deleteCallback(%@)"

#define REGISTER_MODULE_WITH_METHODS @"EXPOSED_TO_NATIVE.native2js.loadProxyForModule('%@', %@)"

#define UNREGISTER_MODULE @"EXPOSED_TO_NATIVE.native2js.unloadProxyForModule('%@')"

@protocol JSExecutor <NSObject>
- (void) execJS: (NSString*) js;
@end

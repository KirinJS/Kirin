//
//  KirinExtensionStub.m
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import "KirinExtensionStub.h"
#import <KirinKit/Kirin.h>

@implementation KirinExtensionStub

@synthesize kirinHelper;
@synthesize moduleName;

- (id) initWithModuleName: (NSString*) moduleName_ {
    self = [super init];
    if (self) {
        self.moduleName = moduleName_;
    }
    return self;
}

- (void) onLoad {
    [self bindExtension];
}

- (void) onStart {
    [self.kirinHelper onStart];
}

- (void) onStop {
    [self.kirinHelper onStop];
}

- (void) onUnload {
    [self.kirinHelper onUnload];
}

- (void) dealloc {
    self.moduleName = nil;
    self.kirinHelper = nil;
    
    [super dealloc];
}

#pragma mark -
#pragma mark Utility methods


- (id) bindRequestDictionary: (NSDictionary*) request withProtocol: (Protocol*) protocol {
    return [self.kirinHelper proxyForJavascriptRequest:protocol andDictionary:request];
}


- (id) bindEmptyDictionaryWithProtocol: (Protocol*) protocol {
    return [self.kirinHelper proxyForJavascriptResponse:protocol];
}


- (void) bindExtension {
    if (!self.kirinHelper) {
        self.kirinHelper = [KIRIN bindService:self toModule:self.moduleName];
        [self.kirinHelper onLoad];
    }
}

- (id) bindExtensionWithProtocol: (Protocol*) protocol {
    [self bindExtension];
    return [self.kirinHelper proxyForJavascriptModule:protocol];
}

@end

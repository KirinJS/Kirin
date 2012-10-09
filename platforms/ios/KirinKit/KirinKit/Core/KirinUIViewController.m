//
//  KirinUIViewControllerViewController.m
//  KirinKit
//
//  Created by James Hugman on 26/04/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinUIViewController.h"

@interface KirinUIViewController ()

@end

@implementation KirinUIViewController
@synthesize kirinHelper = kirinHelper_;

- (void) bindScreenWithoutLoading: (NSString*) moduleName {
    self.kirinHelper = [KIRIN bindScreen:self toModule:moduleName];
}

- (void) bindScreen:(NSString *)moduleName {
    [self bindScreenWithoutLoading:moduleName];
    [self.kirinHelper onLoad];
}

- (id) bindScreen:(NSString *)moduleName withProtocol: (Protocol*) protocol {
    [self bindScreen:moduleName];
    return [self.kirinHelper proxyForJavascriptModule:protocol];
}

- (id) bindRequestDictionary: (NSDictionary*) request withProtocol: (Protocol*) protocol {
    return [self.kirinHelper proxyForJavascriptRequest:protocol andDictionary:request];
}


- (id) bindEmptyDictionaryWithProtocol: (Protocol*) protocol {
    return [self.kirinHelper proxyForJavascriptResponse:protocol];
}


- (void) viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    [self.kirinHelper onResume];
}

- (void) viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    [self.kirinHelper onPause];
    
}

- (void)viewDidUnload
{
    [self.kirinHelper onUnload];

    [super viewDidUnload];
    self.kirinHelper = nil;
}

@end

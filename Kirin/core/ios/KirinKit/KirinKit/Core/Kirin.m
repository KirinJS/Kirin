/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/




#import "Kirin.h"

#import "KirinWebViewHolder.h"
#import "DebugConsole.h"

@interface Kirin (private)

- (void) ensureStarted;

@end



@implementation Kirin 

@synthesize dropbox;
@synthesize kirinServices = kirinServices_;


@synthesize jsContext;
@synthesize nativeContext;

SYNTHESIZE_SINGLETON_FOR_CLASS(Kirin)

- (id) init {
    UIWebView* aWebView = [[[UIWebView alloc] init] autorelease];
	return [self initWithWebView:aWebView];
}

- (id) initWithWebView: (UIWebView*) aWebView {
    self = [super init];
	if (self) {

        self.nativeContext = [[[NativeContext alloc] init] autorelease];

        [self.nativeContext registerNativeObject:[[[DebugConsole alloc] init] autorelease] asName:@"DebugConsole"];
        
        self.dropbox = [[[KirinDropbox alloc] init] autorelease];
        // the webview needs to be able to call out to native using the nativeContext.
        KirinWebViewHolder* webViewHolder = [[[KirinWebViewHolder alloc] initWithWebView:aWebView andNativeContext: self.nativeContext] autorelease];
        
        self.jsContext = [[[JSContext alloc] initWithJSExecutor: webViewHolder] autorelease];       
	}
	return self;
}   

- (KirinHelper*) bindObject: (id) nativeObject toModule:(NSString*) moduleName {
    [self ensureStarted];
    return [[[KirinHelper alloc] initWithModuleName:moduleName 
                                   andNativeObject:nativeObject 
                                      andJsContext:self.jsContext 
                                  andNativeContext:self.nativeContext
                                        andDropbox:dropbox] autorelease];
}

- (KirinUiFragmentHelper*) bindUiFragment: (id) nativeObject toModule:(NSString*) moduleName {
    [self ensureStarted];
    return [[[KirinUiFragmentHelper alloc] initWithModuleName:moduleName 
                                              andNativeObject:nativeObject 
                                                 andJsContext:self.jsContext 
                                             andNativeContext:self.nativeContext
                                                   andDropbox:dropbox] autorelease];
    
}

- (KirinScreenHelper*) bindScreen: (id) nativeObject toModule:(NSString*) moduleName {
    [self ensureStarted];
    return [[[KirinScreenHelper alloc] initWithModuleName:moduleName 
                                              andNativeObject:nativeObject 
                                                 andJsContext:self.jsContext 
                                             andNativeContext:self.nativeContext
                                                   andDropbox:dropbox] autorelease];

}

- (KirinServiceHelper*) bindService: (id) nativeObject toModule:(NSString*) moduleName {
    // we don't want to ensureStarted here, because this will be adding services, 
    // and services is what we're starting.
    return [[[KirinServiceHelper alloc] initWithModuleName:moduleName 
                                          andNativeObject:nativeObject 
                                             andJsContext:self.jsContext 
                                         andNativeContext:self.nativeContext
                                               andDropbox:dropbox] autorelease];
}

#pragma mark -
#pragma mark Managing Services

- (void) ensureStarted {
    NSLog(@"Make sure services are registered");
    [self.kirinServices ensureStarted];
}

- (void) setKirinServices:(KirinServices *) services {
    NSLog(@"Kirin.setKirinServices");
    if (services != nil && kirinServices_ != nil) {
        [NSException raise:@"KirinServicesException" 
                    format:@"Cannot change KirinServices contained once the first service has been added"];
    }
    
    [kirinServices_ release];
    kirinServices_ = services;
    [kirinServices_ retain];
}


- (KirinServices*) kirinServices {
        NSLog(@"Kirin.getKirinServices");
    if (kirinServices_ == nil) {
        self.kirinServices = [KirinServices coreServices];
    }
    return kirinServices_;
}

#pragma mark -
#pragma mark Memory managment
- (void)dealloc
{
    self.jsContext = nil;
    self.nativeContext = nil;
    [dropbox release];
	[super dealloc];
}

	

@end

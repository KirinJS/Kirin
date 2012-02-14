//
//  KirinWebViewHolder.m
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import "KirinWebViewHolder.h"

#import <UIKit/UIApplication.h>
#import <KirinKit/KirinPaths.h>

@interface KirinWebViewHolder ()

@property(retain) UIWebView* webView;
@property(retain) id<NativeExecutor> nativeExecutor;

- (void) _initializeWebView: (UIWebView*) webView;

@end


@implementation KirinWebViewHolder

@synthesize webView = webView_;
@synthesize nativeExecutor = nativeExecutor_;


- (id) init {
	return [self initWithWebView:[[[UIWebView alloc] init] autorelease] andNativeContext:nil];
}

- (id) initWithWebView: (UIWebView*) aWebView andNativeContext: (id<NativeExecutor>) nativeExec {
    self = [super init];
	if (self) {
		self.webView = aWebView;
		[self _initializeWebView: aWebView];
		jsQueue = [[NSMutableArray alloc] init];
        self.nativeExecutor = nativeExec;
	}
	return self;
}





- (void) _initializeWebView: (UIWebView*) aWebView {
	aWebView.delegate = self;
	
	NSString* startPage = [KirinPaths indexFilename];
	NSURL *appURL = [NSURL URLWithString:startPage];
	if(![appURL scheme])
	{
        
		NSString* indexPath = [KirinPaths pathForResource:startPage];
        
		appURL = [NSURL fileURLWithPath: indexPath];
	}
	
    NSURLRequest *appReq = [NSURLRequest requestWithURL:appURL cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:20.0];
	NSLog(@"Loading %@", startPage);
	[aWebView loadRequest:appReq];
    
    
	
}

- (void) _execJSImmediately: (NSString*) js {
    if (DEBUG_JS) {
        NSLog(@"Javascript: %@", js);
    }
    [self.webView stringByEvaluatingJavaScriptFromString:js];
}

- (void) execJS: (NSString*) js; {
	if (webViewIsReady) {
		[self _execJSImmediately: js];
	} else {
		[jsQueue addObject:js];
	}
    
}

- (BOOL)webView:(UIWebView *)theWebView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    
	NSURL *url = [request URL];
    /*
     * Get Command and Options From URL
     * We are looking for URLS that match native://<Class>/<command>[?<arguments>]
     * We have to strip off the leading slash for the options.
     */
	if ([[url scheme] isEqualToString:@"native"]) {
    	
        // Tell the JS code that we've gotten this command, and we're ready for another
        [theWebView stringByEvaluatingJavaScriptFromString:@"EXPOSED_TO_NATIVE.js_ObjC_bridge.ready = true;"];
		
        NSArray* components = [[url host] componentsSeparatedByString:@"."];
        

        NSString* selectorName = nil;
        NSString* moduleName = nil;
        if (components.count == 2) {
            moduleName = [components objectAtIndex:0];
            selectorName = [components objectAtIndex:1];
        }               


        // Check to see if we are provided a class:method style command.
        [self.nativeExecutor executeCommandFromModule:moduleName
                                            andMethod:selectorName 
                                          andArgsList:[url query]];
		
		return NO;
	} else if (![[url scheme] isEqualToString:@"file"]) {
        /*
         * We don't have a native request, load it in the main Safari browser.
         * XXX Could be security hole.
         */
        
        NSLog(@"Kirin::shouldStartLoadWithRequest: Received Unhandled URL %@", url);
        [[UIApplication sharedApplication] openURL:url];
        return NO;
	}
	
	return YES;
}


- (void)webViewDidFinishLoad:(UIWebView *)awebView {
	
	if (!webViewIsReady) {
		NSLog(@"WebView is reported finished. %d commands to tell JS", [jsQueue count]);
		[self _execJSImmediately:@"console.log('Webview is loaded')"];
		for (int i=0; i < [jsQueue count]; i++) {
			[self _execJSImmediately:[jsQueue objectAtIndex:i]];
		}
		
		webViewIsReady = YES;
		[jsQueue removeAllObjects];
	}
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    NSLog(@"[ERROR] %@", error);
}

- (void)dealloc {
    [self.webView setDelegate:nil];
    [self.webView stopLoading];

    self.webView = nil;
    self.nativeExecutor = nil;
    [super dealloc];
}


@end

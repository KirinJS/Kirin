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
#import "InvokedUrlCommand.h"
#import "JSON.h"
#import <UIKit/UIApplication.h>

@interface Kirin (privates)

- (BOOL) execute:(InvokedUrlCommand*)command;

- (id) getCommandInstance:(NSString*)className;

+ (NSString*) pathForResource:(NSString*)resourcepath;

- (NSString*) methodsJSON: (id) t;

@end


@implementation Kirin 

SYNTHESIZE_SINGLETON_FOR_CLASS(Kirin)

@synthesize webView;

+ (NSString*) startPage {
	return @"index-ios.html";
}

+ (NSString*) wwwFolderName {
	return @"generated-javascript";
}

- (id) init {
	return [self initWithWebView:[[UIWebView alloc] init]];
}

- (id) initWithWebView: (UIWebView*) aWebView {
    self = [super init];
	if (self) {
		self.webView = aWebView;
		[self _initializeWebView: aWebView];
		commandObjects = [[NSMutableDictionary alloc] init];
		jsQueue = [[NSMutableArray alloc] init];
        dropbox = [[NSMutableDictionary alloc] init];
        dropboxCounter = 0;
	}
	return self;
}

+ (NSString*) pathForResource:(NSString*)resourcepath {
    NSBundle * mainBundle = [NSBundle mainBundle];
    NSMutableArray *directoryParts = [NSMutableArray arrayWithArray:[resourcepath componentsSeparatedByString:@"/"]];
    NSString       *filename       = [directoryParts lastObject];
    [directoryParts removeLastObject];
	
    NSString *directoryStr = [NSString stringWithFormat:@"%@%@", [self wwwFolderName], [directoryParts componentsJoinedByString:@"/"]];
    return [mainBundle pathForResource:filename ofType:@"" inDirectory:directoryStr];
}



- (void) _initializeWebView: (UIWebView*) aWebView {
	aWebView.delegate = self;
	
	NSString* startPage = [[self class] startPage];
	NSURL *appURL = [NSURL URLWithString:startPage];
	if(![appURL scheme])
	{
        
		NSString* indexPath = [[self class] pathForResource:startPage];
        
		appURL = [NSURL fileURLWithPath: indexPath];
	}
	
    NSURLRequest *appReq = [NSURLRequest requestWithURL:appURL cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:20.0];
	NSLog(@"Loading %@", startPage);
	[aWebView loadRequest:appReq];


	
}

- (void) _fireEventIntoJS: (NSString*) js {
		// XXX check for memory leak.
	js = [NSString stringWithFormat:@"EXPOSED_TO_NATIVE.%@;", js];
	NSLog(@"Javascript: %@", js);
    [webView stringByEvaluatingJavaScriptFromString:js];
}

- (void) fireEventIntoJS: (NSString*) js {
	if (webViewIsReady) {
		[self _fireEventIntoJS: js];
	} else {
		[jsQueue addObject:js];
	}

}

- (void) setAppDelegate: (NSObject*) appDelegate {
    [self addJavascriptInterface:appDelegate forName:@"NativeAppDelegate"];
}

- (void) setCurrentScreen: (UIViewController*) controller forName: (NSString*) name {
	[self addJavascriptInterface:controller forName:@"NativeScreenObject"];
	[self fireEventIntoJS:[NSString stringWithFormat:@"native2js.setCurrentScreenProxy('%@');", name]];
}

- (void) addJavascriptInterface: (id) object forName: name {
	[commandObjects setObject:object forKey:name];
	NSString* methodsJSON = [self methodsJSON:object];
	[self fireEventIntoJS:[NSString stringWithFormat:@"native2js.registerProxy('%@', %@);", name, methodsJSON]];
}

/**
 This is the whole invocation cycle to get JS invoking Obj-C. It's not pretty, but it's how PhoneGap does it.
 */




- (BOOL)webView:(UIWebView *)theWebView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    
	NSURL *url = [request URL];
    /*
     * Get Command and Options From URL
     * We are looking for URLS that match native://<Class>.<command>/[<arguments>][?<dictionary>]
     * We have to strip off the leading slash for the options.
     */
	if ([[url scheme] isEqualToString:@"native"]) {
		
        // I've assumed that since the method is 'newFromUrl' that it has the semantics of new - and that you
        // therefore don't need to retain it explicitly.
        // We seem to need to autorelease it here. If we release once execute has finished, we will release
        // commands reatained by an array too early, although it would work for these commands that are executed
        // immediately.
		InvokedUrlCommand* iuc = [[InvokedUrlCommand newFromUrl:url] autorelease];
		
        // Tell the JS code that we've gotten this command, and we're ready for another
        [theWebView stringByEvaluatingJavaScriptFromString:@"EXPOSED_TO_NATIVE.js_ObjC_bridge.ready = true;"];
		
        // Check to see if we are provided a class:method style command.
		[self execute:iuc];
		
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
		[self _fireEventIntoJS:@"console.log('Webview is loaded')"];
		for (int i=0; i < [jsQueue count]; i++) {
			[self _fireEventIntoJS:[jsQueue objectAtIndex:i]];
		}
		
		webViewIsReady = YES;
		[jsQueue removeAllObjects];
	}
}




/**
 Returns an instance of a Command object, based on its name.  If one exists already, it is returned.
 */
-(id) getCommandInstance:(NSString*)className
{
    id obj = [commandObjects objectForKey:className];
    if (!obj) {

		obj = [[NSClassFromString(className) alloc] init];
		
		if ([obj respondsToSelector:@selector(setKirin:)]) {
			[obj performSelector:@selector(setKirin:) withObject:self];
		}
		
        [commandObjects setObject:obj forKey:className];
		[obj release];
    }
    return obj;
}

// get a JSON string representing the methods available to JS, to call on the passed object t.
- (NSString*) methodsJSON: (id) t {
	NSMutableArray* selectorNames = [[NSMutableArray alloc] init];
	
	
	int i=0;
	unsigned int mc = 0;
	Method * mlist = class_copyMethodList(object_getClass(t), &mc);

	for(i=0;i<mc;i++) {

		[selectorNames addObject:[NSString stringWithFormat:@"%s", sel_getName(method_getName(mlist[i]))]];
	}
	
	/* note mlist needs to be freed */
	free(mlist);
	
	NSString* methodJSON = [selectorNames JSONRepresentation];
	
	[selectorNames release];
	NSString* ret = [[methodJSON componentsSeparatedByString:@":"] componentsJoinedByString:@"_"];
	
	return ret;
	
}




- (BOOL) execute:(InvokedUrlCommand*)command
{
	if (command.className == nil || command.methodName == nil) {
		return NO;
	}
	
        // Fetch an instance of this class
	id obj = [self getCommandInstance:command.className];
	
        // construct the fill method name to ammend the second argument.
	NSString* fullMethodName = command.methodName;
	SEL selector = NSSelectorFromString(fullMethodName);
	if ([obj respondsToSelector:selector]) {
		
		int len = [command.arguments count];
		if (len == 0) {
			[obj performSelector:selector];
		} else if (len == 1) {
			[obj performSelector:selector withObject:[command.arguments objectAtIndex:0]];
		} else if (len == 2) {
			[obj performSelector:selector withObject:[command.arguments objectAtIndex:0] withObject:[command.arguments objectAtIndex:1]];
		} 
	}
	else {                // There's no method to call, so throw an error.
		NSLog(@"Class method '%@' not defined in class '%@'", fullMethodName, command.className);
        
       // if (![command.className isEqualToString:@"NativeScreenObject"]) {
            [NSException raise:NSInternalInconsistencyException format:@"Class method '%@' not defined against class '%@'.", fullMethodName, command.className];
       // }
	}
	
	return YES;
}

#pragma mark -
#pragma mark Utility Methods

- (void)runCallback:(NSString *)token withArgument:(NSString *)arg
{
    
    if(token == nil || [token isKindOfClass: [NSNull class]]) return;
    
    if (arg == nil) {
        
        [self fireEventIntoJS:[NSString stringWithFormat:@"native2js.callCallback(\"%@\")", token]];
        [self fireEventIntoJS:[NSString stringWithFormat:@"native2js.deleteCallback(\"%@\")", token]];
        
    }
    else {
        
        [self fireEventIntoJS:[NSString stringWithFormat:@"native2js.callCallback(\"%@\", \"%@\")", token, arg]];
        [self fireEventIntoJS:[NSString stringWithFormat:@"native2js.deleteCallback(\"%@\")", token]];
        
    }
}

- (void)runCallbackWithoutDelete:(NSString *)token withArgument:(NSString *)arg
{
    
    if(token == nil || [token isKindOfClass: [NSNull class]]) return;
    
    if (arg == nil) {
        
        [self fireEventIntoJS:[NSString stringWithFormat:@"native2js.callCallback(\"%@\")", token]];
        
    }
    else {
        
        [self fireEventIntoJS:[NSString stringWithFormat:@"native2js.callCallback(\"%@\", %@)", token, arg]];
        
    }
}

- (void)deleteCallbackWithoutRun:(NSString *)token
{
    
    if(token == nil || [token isKindOfClass: [NSNull class]]) return;
    
    [self fireEventIntoJS:[NSString stringWithFormat:@"native2js.deleteCallback(\"%@\")", token]];
  
}

#pragma mark -
#pragma mark Dropbox methods

- (NSString*) dropboxPut:(id) object withTokenPrefix:(NSString*) tokenPrefix
{
    NSString* token = [NSString stringWithFormat:@"%@.%d", tokenPrefix, dropboxCounter];
    [dropbox setObject:object forKey:token];

    dropboxCounter++;
    NSLog(@"Token is %@", token);
    return token;
}

- (NSObject*) dropboxConsume:(NSString*) token
{
    NSObject* obj = [[[dropbox objectForKey:token] retain] autorelease];
    [dropbox removeObjectForKey:token];
    return obj;
}

- (void) dropboxDispose:(NSString*) token
{
    [dropbox removeObjectForKey:token];
}


#pragma mark -
#pragma mark Memory managment
- (void)dealloc
{
	self.webView = nil;
    [dropbox release];
    [commandObjects release];	
	[jsQueue release];
	[super dealloc];
}

	

@end

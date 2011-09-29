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



#import <Foundation/Foundation.h>
#import "SynthesizeSingleton.h"
#import <objc/runtime.h>
#import <UIKit/UIWebView.h>

@interface Kirin : NSObject <UIWebViewDelegate> {

	UIWebView* webView;
	
	@private
	NSMutableDictionary* commandObjects;
	
	@private
	NSMutableArray* jsQueue;
	
	@private
	BOOL webViewIsReady;
    
    @private
    NSMutableDictionary* dropbox;
    int dropboxCounter;
}

- (id) initWithWebView: (UIWebView*) aWebView;

- (void) fireEventIntoJS: (NSString*) js;

- (void) setCurrentScreen: (UIViewController*) controller forName: (NSString*) name;

- (void) setAppDelegate: (NSObject*) appDelegate;

- (void) _initializeWebView: (UIWebView*) webView;

- (void) addJavascriptInterface: (id) object forName: name;

+ (NSString*) startPage;

+ (NSString*) wwwFolderName;

+ (NSString*) pathForResource:(NSString*)resourcepath;

- (void)runCallback:(NSString *)code withArgument:(NSString *)arg;

- (void)runCallbackWithoutDelete:(NSString *)token withArgument:(NSString *)arg;

- (void)deleteCallbackWithoutRun:(NSString *)token;

- (NSString*) dropboxPut:(id) object withTokenPrefix:(NSString*) token;

- (NSObject*) dropboxConsume:(NSString*) token;

- (void) dropboxDispose:(NSString*) token;

SYNTHESIZE_SINGLETON_HEADER_FOR_CLASS(Kirin)

#define KIRIN [Kirin sharedKirin]

@property (nonatomic, retain) UIWebView* webView; 

@end

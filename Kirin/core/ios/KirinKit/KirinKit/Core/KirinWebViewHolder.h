//
//  KirinWebViewHolder.h
//  KirinKit
//
//  Created by James Hugman on 22/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIWebView.h>
#import <KirinKit/JSExecutor.h>
#import <KirinKit/NativeExecutor.h>

@interface KirinWebViewHolder : NSObject <UIWebViewDelegate, JSExecutor> {
    
    id<NativeExecutor> nativeExecutor;

    @private
	NSMutableArray* jsQueue;
    UIWebView* webView;
    BOOL webViewIsReady;
}

@property(retain) UIWebView* webView;
@property(retain) id<NativeExecutor> nativeExecutor;

- (id) initWithWebView: (UIWebView*) aWebView andNativeContext: (id<NativeExecutor>) nativeExec;

+ (NSString*) startPage;

+ (NSString*) wwwFolderName;

+ (NSString*) pathForResource:(NSString*)resourcepath;

@end

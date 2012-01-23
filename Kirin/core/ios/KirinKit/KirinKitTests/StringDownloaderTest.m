//
//  StringDownloaderTest.m
//  KirinKit
//
//  Created by James Hugman on 20/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "StringDownloaderTest.h"
#import "StringDownloader.h"

@interface StringDownloaderTest()

@property(retain, nonatomic) StringDownloader* downloader;
@property(retain, nonatomic) NSMutableDictionary* config;

/*
 - (void) failWithError: (NSString*) errorMessage {
 [self.mTarget performSelector:self.errback withObject:errorMessage withObject:self];
 }
 
 - (void) succeed {
 [self.mTarget performSelector:self.callback withObject:self.mData withObject:self];
 }
*/

- (void) onSuccess: (NSData*) data withDownloader: downloader; 
- (void) onError: (NSString*) message withDownloader: downloader;

@end

@implementation StringDownloaderTest

@synthesize downloader = downloader_;
@synthesize config = config_;

- (void) setUp {
    
    self.downloader = [StringDownloader downloaderWithTarget:self andCallback:@selector(onSuccess:withDownloader:) andErrback: @selector(onError:withDownloader:)];
    
    self.config = [NSMutableDictionary dictionary];
}

- (void) tearDown {
    [NSThread sleepForTimeInterval:20.0];
    
}

- (void) testBasicGETConnection {
    [self.config setObject:@"http://fp-json.appspot.com/api/kirin-upload" forKey:@"url"];
    [self.config setObject:@"GET" forKey:@"method"];
    [self.downloader startDownloadWithConfig:self.config];
}

- (void) testBasicPOSTConnection {
    [self.config setObject:@"http://fp-json.appspot.com/api/kirin-upload" forKey:@"url"];
    [self.config setObject:@"POST" forKey:@"method"];
    [self.config setObject:@"application/x-www-form-urlencoded" forKey:@"contentType"];
    [self.config setObject:@"id=foo&name=bar" forKey:@"params"];
    [self.downloader startDownloadWithConfig:self.config];
}

- (void) onSuccess: (NSData*) data withDownloader: downloader {
    NSString* string = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
    NSLog(@"success: %@", string);    
}

- (void) onError: (NSString*) message withDownloader: downloader {
    NSLog(@"Error: %@", message);
}

@end

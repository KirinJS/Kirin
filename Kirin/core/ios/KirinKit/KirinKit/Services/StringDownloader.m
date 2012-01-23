//
//  StringDownloader.m
//  KirinKit
//
//  Created by James Hugman on 19/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "StringDownloader.h"


@interface StringDownloader ()

@property(nonatomic) SEL callback;
@property(nonatomic) SEL errback;

@property(retain, nonatomic) id<NSObject> mTarget;



@property(retain, nonatomic) NSURLConnection* mConnection;
@property(retain, nonatomic) NSMutableData* mData;

- (id) initWithTarget:(id<NSObject>) target andCallback:(SEL)callback andErrback:(SEL)errback;

- (void) failWithError: (NSString*) errorMessage;

@end


@implementation StringDownloader

@synthesize callback = callback_;
@synthesize errback = errback_;
@synthesize mTarget = mTarget_;
@synthesize mConfig = mConfig_;

@synthesize mConnection = mConnection_;
@synthesize mData = mData_;


+ (StringDownloader*) downloaderWithTarget:(id<NSObject>) target andCallback:(SEL)callback andErrback:(SEL)errback {
    return [[[StringDownloader alloc] initWithTarget:target andCallback:callback andErrback:errback] autorelease];
}

- (id) initWithTarget:(id<NSObject>) target andCallback:(SEL)callback andErrback:(SEL)errback {
    self = [super init];
    if (self) {
        self.callback = callback;
        self.errback = errback;
        self.mTarget = target;
    }
    return self;
}

- (void) dealloc {
    self.errback = nil;
    self.callback = nil;
    self.mTarget = nil;
    self.mData = nil;
    self.mConnection = nil;
    self.mConfig = nil;
    [super dealloc];
}

- (void) failWithError: (NSString*) errorMessage {
    [self.mTarget performSelector:self.errback withObject:errorMessage withObject:self];
}

- (void) succeed {
    [self.mTarget performSelector:self.callback withObject:self.mData withObject:self];
}

- (void)startDownloadWithConfig:(NSDictionary *)config {
    
    self.mConfig = config;
    
    NSURLRequest* request;
    
    NSURL* url = [NSURL URLWithString:[config objectForKey:@"url"] ];
    NSString* method = [config objectForKey:@"method"];
    
    if ([method isEqualToString:@"GET"]) {
        request = [NSURLRequest requestWithURL:url];
    } else {
        NSMutableURLRequest* r = [NSMutableURLRequest requestWithURL:url];
        NSLog(@"Method is %@, request is %@, url is %@", method, r, url);
        
        
        NSString* postDataString = [config objectForKey:@"params"];
        NSData* postData = [postDataString dataUsingEncoding:NSUTF8StringEncoding allowLossyConversion:YES];
        
        NSString *postLength = [NSString stringWithFormat:@"%d", [postData length]];  
        

        [r setHTTPMethod:method];
        [r setValue:postLength forHTTPHeaderField:@"Content-Length"];  
        [r setValue:[config objectForKey:@"contentType"] forHTTPHeaderField:@"Content-Type"];  
        [r setHTTPBody:postData];

        request = r;
    }

    NSLog(@"Method is %@, request is %@", method, request);
    
	self.mConnection= [[[NSURLConnection alloc] initWithRequest:request delegate:self] autorelease];
    
    if (self.mConnection) {
        self.mData = [NSMutableData data];
        [self.mConnection start];
    } else {
        [self failWithError:[NSString stringWithFormat: @"NetworkingBackend: Couldn't init connection: %@", request]];
    }
    
}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    // This method is called when the server has determined that it
    // has enough information to create the NSURLResponse.
    
    // It can be called multiple times, for example in the case of a
    // redirect, so each time we reset the data.
    
    // receivedData is an instance variable declared elsewhere.
    NSLog(@"- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response");
    self.mData.length = 0;
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    // Append the new data to receivedData.
    // receivedData is an instance variable declared elsewhere.
    NSLog(@"- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data");
    [self.mData appendData:data];
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    NSLog(@"- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error");
    // release the connection, and the data object
    self.mConnection = nil;
    // receivedData is declared as a method instance elsewhere
    self.mData = nil;
    
    // inform the user
    NSLog(@"NetworkingBackend Connection failed! Error - %@ %@",
          [error localizedDescription],
          [[error userInfo] objectForKey:NSURLErrorFailingURLStringErrorKey]);
    
    [self failWithError:[error localizedDescription]];
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    // do something with the data
    // receivedData is declared as a method instance elsewhere
    NSLog(@"NetworkingBackend Succeeded! Received %d bytes of data", self.mData.length);
    
    [self succeed];

    // release the connection, and the data object
    self.mConnection = nil;
    
    self.mData = nil;
    
}


@end

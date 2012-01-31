//
//  StringDownloader.m
//  KirinKit
//
//  Created by James Hugman on 19/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "StringDownloader.h"
#import <MobileCoreServices/MobileCoreServices.h>

@interface StringDownloader ()

@property(nonatomic) SEL callback;
@property(nonatomic) SEL errback;

@property(retain, nonatomic) id<NSObject> mTarget;



@property(retain, nonatomic) NSURLConnection* mConnection;
@property(retain, nonatomic) NSMutableData* mData;

- (id) initWithTarget:(id<NSObject>) target andCallback:(SEL)callback andErrback:(SEL)errback;

- (void) failWithError: (NSString*) errorMessage;

- (NSString*) mimeTypeForFileAtPath: (NSString *) path;

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

- (NSString*) mimeTypeForFileAtPath: (NSString *) path {
    if (![[[[NSFileManager alloc] init] autorelease] fileExistsAtPath:path]) {
        return nil;
    }
    // Borrowed from http://stackoverflow.com/questions/2439020/wheres-the-iphone-mime-type-database
    CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (CFStringRef)[path pathExtension], NULL);
    CFStringRef MIMEType = UTTypeCopyPreferredTagWithClass (UTI, kUTTagClassMIMEType);
    CFRelease(UTI);
    if (!MIMEType) {
        return @"application/octet-stream";
    }
    return NSMakeCollectable([(NSString *)MIMEType autorelease]);
}

- (void) failWithError: (NSString*) errorMessage {
    [self.mTarget performSelector:self.errback withObject:errorMessage withObject:self];
}

- (void) succeed {
    [self.mTarget performSelector:self.callback withObject:self.mData withObject:self];
}

- (NSData*) prepareRequest: (NSMutableURLRequest*) request withData: (NSDictionary*) config {
    NSString* postDataString = [config objectForKey:@"params"];
    NSArray* files = [config objectForKey:@"attachments"];
    NSString* contentType = [config objectForKey:@"contentType"];

    
    
    if (!files || [files count] == 0) {
        // so we're not doing file upload.
        NSData* postData = nil;
    
        if (postDataString && [postDataString length] > 0) {
            postData = [postDataString dataUsingEncoding:NSUTF8StringEncoding allowLossyConversion:YES];
        }
    
        [request setValue:contentType forHTTPHeaderField:@"Content-Type"];
        return postData;
    }
    

    
    NSString* boundary = [NSString stringWithFormat: @"----BOUNDARY_%d", [NSDate timeIntervalSinceReferenceDate]];


	[request setValue:[NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary] forHTTPHeaderField:@"Content-Type"];

    
    NSMutableData* bodyData = [NSMutableData data];

    void (^appendString)(NSString*) = ^(NSString* str) {
        [bodyData appendData:[str dataUsingEncoding:NSUTF8StringEncoding]];
    };

    void (^appendBoundary)(void) = ^() {
        appendString([NSString stringWithFormat:@"\r\n--%@\r\n", boundary]);
    };
    
    for (int i=0, max=[files count]; i<max; i++) {
        NSDictionary* file = [files objectAtIndex:i];
        
        NSString* fullPath = [file objectForKey:@"filename"];
        
        NSString* name = [file objectForKey:@"name"];
        if (!name) {
            name = [NSString stringWithFormat:@"upload-%d", i];
        }
        
        appendBoundary();
        
        NSString* headerPreamble = [NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"; filename=\"%@\"\r\n", name, fullPath];
        appendString(headerPreamble);
        
        NSString* mimeType = [file objectForKey:@"contentType"];
        if (!mimeType) {
            mimeType = [self mimeTypeForFileAtPath:fullPath];
        }
        
        appendString([NSString stringWithFormat:@"Content-Type: %@\r\n\r\n", mimeType]);

        [bodyData appendData:[NSData dataWithContentsOfFile:fullPath]];
    }
    
    NSDictionary* paramMap = [config objectForKey:@"paramMap"];
    if (paramMap) {
        for (NSString* key in paramMap) {
            id value = [paramMap objectForKey:key];
            appendBoundary();
            NSString* headerPreamble = [NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n", key];
            appendString(headerPreamble);
            
            appendString([NSString stringWithFormat:@"%@", value]);
        }
    }
    
    // final boundary.
    appendString([NSString stringWithFormat:@"\r\n--%@--\r\n", boundary]);
       
    return bodyData;
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

        NSData* postData = [self prepareRequest: r withData: config];
        NSString *postLength = [NSString stringWithFormat:@"%d", [postData length]];  
        
        [r setHTTPMethod:method];
        [r setValue:postLength forHTTPHeaderField:@"Content-Length"];  
 
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

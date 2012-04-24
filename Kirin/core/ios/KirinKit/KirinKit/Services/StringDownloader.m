//
//  StringDownloader.m
//  KirinKit
//
//  Created by James Hugman on 19/01/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "StringDownloader.h"
#import <UIKit/UIApplication.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import "JSON.h"

#import "KirinFileSystem.h"


@interface StringDownloader ()

- (void) failWithError: (NSString*) errorMessage;

- (NSString*) mimeTypeForFileAtPath: (NSString *) path;

@end


@implementation StringDownloader


@synthesize successBlock = successBlock_;
@synthesize errorBlock = errorBlock_;

@synthesize statusCode = statusCode_;


- (void) dealloc {
    self.successBlock = nil;
    self.errorBlock = nil;
    [super dealloc];
}

- (NSString*) mimeTypeForFileAtPath: (NSString *) path {
    if (![[NSFileManager defaultManager] fileExistsAtPath:path]) {
        return nil;
    }
    // Borrowed from http://stackoverflow.com/questions/5996797/determine-mime-type-of-nsdata-loaded-from-a-file
    // itself, derived from  http://stackoverflow.com/questions/2439020/wheres-the-iphone-mime-type-database
    CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, (CFStringRef)[path pathExtension], NULL);
    CFStringRef mimeType = UTTypeCopyPreferredTagWithClass (UTI, kUTTagClassMIMEType);
    CFRelease(UTI);
    if (!mimeType) {
        return @"application/octet-stream";
    }
    return [NSMakeCollectable((NSString *)mimeType) autorelease];
}

- (void) failWithError: (NSString*) errorMessage {
    self.errorBlock(errorMessage);
}

- (void) succeed: (NSData*) data {
    self.successBlock(data);
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
    

    
    NSString* boundary = [NSString stringWithFormat: @"-_-_-_-_-_-_-_-_%d", [NSDate timeIntervalSinceReferenceDate]];


	[request setValue:[NSString stringWithFormat:@"multipart/form-data; boundary=%@", boundary] forHTTPHeaderField:@"Content-Type"];

    
    NSMutableData* bodyData = [NSMutableData data];

    void (^appendString)(NSString*) = ^(NSString* str) {
        [bodyData appendData:[str dataUsingEncoding:NSUTF8StringEncoding]];
    };

    void (^appendCR)(void) = ^ {
        appendString(@"\r\n");
    };

    void (^appendBoundary)(void) = ^() {
        appendString([NSString stringWithFormat:@"--%@\r\n", boundary]);
    };
    
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    for (int i=0, max=[files count]; i<max; i++) {
        NSDictionary* file = [files objectAtIndex:i];
        
        NSString* fullPath = [fs filePathFromConfig:file];
        
        NSString* name = [file objectForKey:@"name"];
        if (!name) {
            name = [NSString stringWithFormat:@"upload-%d", i];
        }
        
        appendBoundary();
        
        NSString* headerPreamble = 
            [NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"; filename=\"%@\"\r\n", name, fullPath];
        appendString(headerPreamble);
        
        NSString* mimeType = [file objectForKey:@"contentType"];
        if (!mimeType) {
            mimeType = [self mimeTypeForFileAtPath:fullPath];
        }
        
        appendString([NSString stringWithFormat:@"Content-Type: %@\r\n\r\n", mimeType]);

        [bodyData appendData:[NSData dataWithContentsOfFile:fullPath]];
        appendCR();
    }
    
    NSDictionary* paramMap = [config objectForKey:@"paramMap"];
    if (paramMap) {
        for (NSString* key in paramMap) {
            NSObject* value = [paramMap objectForKey:key];
            appendBoundary();
            NSString* headerPreamble = [NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"\r\n\r\n", key];
            appendString(headerPreamble);
            if ([value isKindOfClass:[NSDictionary class]]) {
                appendString([(NSDictionary*) value JSONRepresentation]);
            } else if ([value isKindOfClass:[NSArray class]]) {
                appendString([(NSArray*) value JSONRepresentation]);
            } else {
                appendString([NSString stringWithFormat:@"%@", value]);
            }
            appendCR();
        }
    }
    
    // final boundary.
    appendString([NSString stringWithFormat:@"--%@--\r\n", boundary]);
       
    return bodyData;
}

- (void)startDownloadWithConfig:(NSDictionary *)config {
    UIBackgroundTaskIdentifier backgroundTaskId = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
        [self failWithError:@"Timeout"];
    }];
    
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

    NSURLResponse* response = nil;
    NSError* error = nil;
    NSData* data = (NSMutableData*) [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&error];

    int statusCode = 200;
    if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
        statusCode = [((NSHTTPURLResponse*) response) statusCode];
    }

    if (error) {
        NSLog(@"NetworkingBackend Connection failed! Error - %@ %@",
              [error localizedDescription],
              [[error userInfo] objectForKey:NSURLErrorFailingURLStringErrorKey]);
        [self failWithError:[error description]];
    } else if (data) {
        if (statusCode < 300) {
            [self succeed: data];
        } else {
            [self failWithError:[NSString stringWithFormat:@"%d", statusCode]];
        }
    } else {
        [self failWithError:@"noData"];
    }
        
    [[UIApplication sharedApplication] endBackgroundTask:backgroundTaskId];
}


@end

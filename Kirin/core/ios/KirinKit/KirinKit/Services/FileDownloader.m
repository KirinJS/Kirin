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



#import "FileDownloader.h"
#import "Kirin.h"
#import "JSON.h"

@implementation FileDownloader

@synthesize config;
@synthesize kirinHelper;

+ (FileDownloader*) downloaderWithHelper: (KirinHelper*) helper {
    FileDownloader* downloader = [[[FileDownloader alloc] init] autorelease];
    downloader.kirinHelper = helper;
    return downloader;
}

-(NSString*) destinationFilePath
{
    NSString* imageFile = [config objectForKey:@"filename"];
    NSString* docs = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents"];
    return [docs stringByAppendingPathComponent:imageFile];
}

-(void) startDownloadWithConfig: (NSDictionary*) _config {
    
    self.config = _config;
    
    NSString* imageFile = [_config objectForKey:@"filename"];
    
    NSString* fileName = [self destinationFilePath];
    if([[NSFileManager defaultManager] fileExistsAtPath:fileName]){
        [self.kirinHelper jsCallback:@"onFinish" 
                          fromConfig:self.config 
                        withArgsList:[NSString stringWithFormat:@"'%@'", imageFile]];

    }
    
    NSURLRequest* req = [NSURLRequest requestWithURL:[NSURL URLWithString:[config objectForKey:@"url"] ]];
    
	theConnection=[[NSURLConnection alloc] initWithRequest:req delegate:self];
    
    if (theConnection) {
        data = [[NSMutableData data] retain];
    } else {
        [self failWithError:[ NSString stringWithFormat: @"<NETWORKING BACKEND> Couldn't init connection: %@", req]];
    }
    
}

- (void) deleteFileWithConfig: (NSDictionary*) _config {
    self.config = _config;
    NSError* error = nil;
    NSString* imageFile = [config objectForKey:@"filename"];
    BOOL removeSuccess = [[NSFileManager defaultManager] removeItemAtPath:[self destinationFilePath] error:&error];
    if (removeSuccess) {
        [self.kirinHelper jsCallback:@"onFinish" 
                          fromConfig:self.config 
                        withArgsList:[NSString stringWithFormat:@"'%@'", imageFile]];
        
        [self cleanupCallbacks];
    } else {
        [self.kirinHelper jsCallback:@"onError" 
                          fromConfig:self.config 
                        withArgsList:[NSString stringWithFormat:@"'%@', '%@'", 
                                      [error description], 
                                      imageFile]];
        [self cleanupCallbacks];
    }

}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    // This method is called when the server has determined that it
    // has enough information to create the NSURLResponse.
    
    // It can be called multiple times, for example in the case of a
    // redirect, so each time we reset the data.
    
    // receivedData is an instance variable declared elsewhere.
    [data setLength:0];
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)_data
{
    // Append the new data to receivedData.
    // receivedData is an instance variable declared elsewhere.
    [data appendData:_data];
}

- (void)connection:(NSURLConnection *)connection
  didFailWithError:(NSError *)error
{
    // release the connection, and the data object
    [connection release];
    // receivedData is declared as a method instance elsewhere
    [data release];
    
    // inform the user
    NSLog(@"<NETWORKING BACKEND> Connection failed! Error - %@ %@",
          [error localizedDescription],
          [[error userInfo] objectForKey:NSURLErrorFailingURLStringErrorKey]);
    
    [self failWithError:[error localizedDescription]];
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    // do something with the data
    // receivedData is declared as a method instance elsewhere
    NSLog(@"<NETWORKING BACKEND> Succeeded! Received %d bytes of data",[data length]);
    
    [self writeToFile: data];
    
    // release the connection, and the data object
    [connection release];
    [data release];
}

-(void) cleanupCallbacks
{
    [self.kirinHelper cleanupCallback:self.config withNames:@"onError", @"onFinish", nil];    
}

-(void) failWithError: (NSString*) error{
    
    NSLog(@"<NETWORKING BACKEND> Error");

    [self.kirinHelper jsCallback:@"onError" 
                      fromConfig:self.config 
                    withArgsList:[NSString stringWithFormat:@"'%@', '%@'", 
                                  [error description], 
                                  [self.config objectForKey:@"filename"]]];
    
    [self cleanupCallbacks];
}

-(void) writeToFile: (NSData*) fileData {
    NSString* imageURL = [config objectForKey:@"url"];
    NSString* imageFile = [config objectForKey:@"filename"];
    NSString* fileName = [self destinationFilePath];
    
    NSLog(@"image: %@ // filename: %@", imageURL, fileName);
    
    if(![[NSFileManager defaultManager] fileExistsAtPath:fileName]){
        [fileData writeToFile:fileName atomically:YES];
    }
    
    [self.kirinHelper jsCallback:@"onFinish" 
                      fromConfig:self.config 
                    withArgsList:[NSString stringWithFormat:@"'%@'", imageFile]];
    
    [self cleanupCallbacks];
    
}

- (void)dealloc {
    self.kirinHelper = nil;
    self.config = nil;
    [super dealloc];
}

@end

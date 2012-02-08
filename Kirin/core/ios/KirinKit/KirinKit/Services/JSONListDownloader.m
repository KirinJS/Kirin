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



#import "JSONListDownloader.h"
#import "Kirin.h"
#import "JSON.h"

@implementation JSONListDownloader

@synthesize kirinHelper;

+ (JSONListDownloader*) downloaderWithHelper: (KirinHelper*) helper {
    JSONListDownloader* downloader = [[[JSONListDownloader alloc] init] autorelease];
    downloader.kirinHelper = helper;
    return downloader;
}

-(void) cleanupCallbacks {
    [self.kirinHelper cleanupCallback:config withNames:@"each", @"envelope", @"onError", @"onFinish", nil];
}

-(void) downloadJSONList: (NSDictionary *) _config{
    
    config = [_config retain];
    
    NSURLRequest* req = [NSURLRequest requestWithURL:[NSURL URLWithString:[config objectForKey:@"url"] ]];
    
	theConnection=[[NSURLConnection alloc] initWithRequest:req delegate:self];
    
    if (theConnection) {
        data = [[NSMutableData data] retain];
    } else {
        [self failWithError:[ NSString stringWithFormat: @"<NETWORKING BACKEND> Couldn't init connection: %@", req]];
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
    
    [self handleList:data withPath:[config objectForKey:@"path"]];
    [self cleanupCallbacks];
    // release the connection, and the data object
    [connection release];
    [data release];
}

-(void) failWithError: (NSString*) error{
    
    NSLog(@"<NETWORKING BACKEND> Error");
    
    [self.kirinHelper jsCallback:@"onError" 
                      fromConfig:config withArgsList:[NSString stringWithFormat:@"\"%@\"", error]];
    [self cleanupCallbacks];
}

-(void) handleList: (NSData*) d withPath: (NSArray*) path {
    
    if(!d) {
        
        return;
        
    }
    
    NSString* stringy = [[[NSString alloc] initWithData:d encoding:NSUTF8StringEncoding] autorelease];
    
    // Is path empty? If so, ignore envelope.
    // - is the JSON a list? If so, call back eachToken with each list element as the argument.
    // If not, extract (and remove) the element from the JSON that the path relates to.
    // Is the element a list?
    // -- If so call envelope with the rest of the JSON as the argument.
    // -- then call eachToken with each element of the list as the argument.
    
    NSObject *baseJson = [stringy JSONValue];
    
    int i = 0;
    
    if([baseJson isKindOfClass: [NSArray class]]) {
        
        NSObject* object;
        
        NSEnumerator* e = [((NSArray*)baseJson) objectEnumerator];
        
        while((object = [e nextObject])) {
            @try{
                
                [self.kirinHelper jsCallback:@"each" 
                                  fromConfig:config 
                                withArgsList:[((NSDictionary*)object)  JSONRepresentation]];

                ++i;
                
            } @catch(NSException* e) {
                
                NSLog(@"<NETWORKING BACKEND> failed to handle object %@", object);
                
            }
            
        }
        
        
    } else {
        // TODO. Not sure if this is the right thing to do. Check with Adrian.
        [self.kirinHelper jsCallback:@"each" 
                          fromConfig:config 
                        withArgsList:[NSString stringWithFormat:@"\"%@\"", stringy]];
        
        i = 1;
        
    }

    
    if ([path count] != 0) {
        
        [NSException raise:@"NETWORK BACKEND EXCEPTION" format:@"The iOS core does not yet support downloading json with paths."];
        
    }
    
    //NSLog(@"<NETWORKING BACKEND> OUTPUT: %@", stringy);
    
    [self.kirinHelper jsCallback:@"onFinish" 
                      fromConfig:config 
                    withArgsList:[NSString stringWithFormat:@"%d", i]];
    [self cleanupCallbacks];
}

- (void) dealloc
{
    self.kirinHelper = nil;
    [config release];
    [super dealloc];
}

@end

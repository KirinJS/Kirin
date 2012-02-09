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



#import "NetworkingBackend.h"
#import "FileDownloader.h"
#import "JSON.h"
#import "StringDownloader.h"
#import "KirinFileSystem.h"

@interface NetworkingBackend ()

- (void) cleanupCallbacks: (NSDictionary*) config;

// TODO check if these methods need to be declared in the .h file or here.
- (void) handleList: (NSData*) data withDownloader: (StringDownloader*) downloader;
- (void) handleError: (NSString*) errorMessage withDownloader: (StringDownloader*) downloader;
- (void) handleString: (NSData*) data withDownloader: (StringDownloader*) downloader;
- (void) handleJSONObject: (NSData*) data withDownloader: (StringDownloader*) downloader;
- (void) handleAsFile: (NSData*) data withDownloader: (StringDownloader*) downloader;
@end

@implementation NetworkingBackend

- (id) init {
    return [super initWithModuleName: @"Networking"];
}

- (void) cleanupCallbacks: (NSDictionary*) config {
    [self.kirinHelper cleanupCallback:config withNames:@"envelope", @"each", @"payload", @"onFinish", @"onError", nil];
}

- (void) handleError: (NSString*) errorMessage withDownloader: (StringDownloader*) downloader {
    NSDictionary* config = downloader.mConfig;
    [self.kirinHelper jsCallback:@"onError" fromConfig:config withArgsList:[NSString stringWithFormat:@"'%@'", errorMessage]];
    [self cleanupCallbacks:config];
    [downloader release];
}

#pragma mark -
#pragma mark Download JSON


-(void) downloadString: (NSDictionary *) config {
    NSLog(@"[NetworkingBackend] downloadJSON_: %@", config);
    StringDownloader* downloader = [StringDownloader downloaderWithTarget:self 
                                                              andCallback:@selector(handleString:withDownloader:) 
                                                               andErrback:@selector(handleError:withDownloader:)];
    
    [downloader retain];
    [downloader startDownloadWithConfig: config];
}

-(void) handleString: (NSData*) data withDownloader: (StringDownloader*) downloader {
    NSDictionary* config = downloader.mConfig;
    NSString* string = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
    [self.kirinHelper jsCallback:@"payload" 
                      fromConfig:config 
                    withArgsList:[NSString stringWithFormat:@"'%@'", string]];
    [self cleanupCallbacks:config];
    [downloader release];
}

#pragma mark -
#pragma mark Download JSON


-(void) downloadJSON: (NSDictionary *) config {
    StringDownloader* downloader = [StringDownloader downloaderWithTarget:self 
                                                              andCallback:@selector(handleJSONObject:withDownloader:) 
                                                               andErrback:@selector(handleError:withDownloader:)];

    [downloader retain];
    [downloader startDownloadWithConfig: config];
}

- (void) handleJSONObject: (NSData*) data withDownloader: (StringDownloader*) downloader {
    NSDictionary* config = downloader.mConfig;
    NSString* string = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
    [self.kirinHelper jsCallback:@"payload" 
                      fromConfig:config 
                    withArgsList:string];
    [self cleanupCallbacks:config];
    [downloader release];
}
    

#pragma mark -
#pragma mark Download JSON List

-(void) downloadJSONList: (NSDictionary *) config {
    StringDownloader* downloader = [StringDownloader downloaderWithTarget:self 
                               andCallback:@selector(handleList:withDownloader:) 
                                andErrback:@selector(handleError:withDownloader:)];
    [downloader retain];    
    [downloader startDownloadWithConfig: config];

}

- (void) handleList: (NSData*) data withDownloader: (StringDownloader*) downloader {
    NSDictionary* config = downloader.mConfig;    
    NSArray* path = [config objectForKey:@"path"];
    
    if(!data) {
        return;
    }
    

    
    NSString* string = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
    
    // Is path empty? If so, ignore envelope.
    // - is the JSON a list? If so, call back eachToken with each list element as the argument.
    // If not, extract (and remove) the element from the JSON that the path relates to.
    // Is the element a list?
    // -- If so call envelope with the rest of the JSON as the argument.
    // -- then call eachToken with each element of the list as the argument.
    
    NSObject *baseJson = [string JSONValue];
    
    int i = 0;
    
    // find the list.     
    NSDictionary* parent = nil;
    NSObject* object = baseJson;
    NSArray* list = nil;
    
    NSString* pathElement = nil;
    NSEnumerator* pathEnumerator = [path objectEnumerator];
    while ((pathElement = [pathEnumerator nextObject])) {
        
        if ([object isKindOfClass: [NSDictionary class]]) {
            parent = (NSDictionary*) object;
            object = [parent objectForKey:pathElement];
        }
        
        
        if ([object isKindOfClass: [NSArray class]]) {
            list = (NSArray*) object;
            if ([object isKindOfClass: [NSMutableDictionary class]]) {
                [((NSMutableDictionary*) parent) removeObjectForKey:pathElement];
            }
            break;
        }
        
    }
    
    if([list isKindOfClass: [NSArray class]]) {
        
        if (parent) {
            [self.kirinHelper jsCallback:@"envelope" fromConfig:config withArgsList:[parent JSONRepresentation]];
        }
        NSObject* object;
        
        NSEnumerator* e = [((NSArray*)list) objectEnumerator];
        
        while((object = [e nextObject])) {
            @try{
                [self.kirinHelper jsCallback:@"each" 
                                  fromConfig:config 
                                withArgsList:[((NSDictionary*)object)  JSONRepresentation]];
                
                ++i;
                
            } @catch(NSException* e) {
                
                NSLog(@"NetworkingBackend: failed to handle object %@", object);
                
            }
            
        }
        
        
    } else {
        // TODO. Not sure if this is the right thing to do. Check with Adrian.
        [self.kirinHelper jsCallback:@"each" 
                          fromConfig:config 
                        withArgsList:[NSString stringWithFormat:@"\"%@\"", string]];
        
        i = 1;
        
    }
    
    
    [self.kirinHelper jsCallback:@"onFinish" 
                      fromConfig:config 
                    withArgsList:[NSString stringWithFormat:@"%d", i]];
    [self cleanupCallbacks: config];
    [downloader release];
}




#pragma mark -
#pragma mark Download File

-(void) downloadFile: (NSDictionary *) config {
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    
    NSString* fullPath = [fs filePathFromConfig:config];
    
    // TODO make sure we don't want to overwrite this file. e.g. overwrite = true
    // TODO make sure we can be downloading in the background.
    
    
    
    if([[NSFileManager defaultManager] fileExistsAtPath:fullPath]){
        [self.kirinHelper jsCallback:@"onFinish" 
                          fromConfig:config 
                        withArgsList:[NSString stringWithFormat:@"'%@'", fullPath]];
        return;
    }
    
    StringDownloader* downloader = [StringDownloader downloaderWithTarget:self 
                                                              andCallback:@selector(handleAsFile:withDownloader:) 
                                                               andErrback:@selector(handleError:withDownloader:)];
    [downloader retain];
    [downloader startDownloadWithConfig: config];
}

- (void) handleAsFile: (NSData*) data withDownloader: (StringDownloader*) downloader {
    NSDictionary* config = downloader.mConfig;
    NSString* imageURL = [config objectForKey:@"url"];
    NSString* fileArea = [config objectForKey:@"fileArea"];
    NSString* filename = [config objectForKey:@"filename"];
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    
    NSString* fullPath = [fs filePath:filename inArea:fileArea];
    
    NSLog(@"image: %@ // filename: %@", imageURL, fullPath);
    
    if(![[NSFileManager defaultManager] fileExistsAtPath:fullPath]){
        [fs writeData:data toFile:fullPath];
    }
    
    [self.kirinHelper jsCallback: @"onFinish" 
                      fromConfig: config 
                    withArgsList: [NSString stringWithFormat:@"'%@'", fullPath]];
    
    [self cleanupCallbacks: config];
    [downloader release];
}

#pragma mark -
#pragma mark Delete file. 

// TODO put this in file utils.

-(void) deleteDownloadedFile: (NSDictionary *) config {
    NSLog(@"[NetworkingBackend] deleteDownloadedFile_: %@", config);
    FileDownloader* downloader = [FileDownloader downloaderWithHelper:self.kirinHelper];
    [downloader deleteFileWithConfig: config];    
    [self cleanupCallbacks:config];
}

@end

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

#import "JSON.h"
#import "StringDownloader.h"
#import <KirinKit/KirinFileSystem.h>
#import <KirinKit/KirinArgs.h>

@interface NetworkingBackend ()

- (void) cleanupCallbacks: (NSDictionary*) config;

// TODO check if these methods need to be declared in the .h file or here.

- (void) handleList: (NSData*) data withConfig: (NSDictionary*) config;
- (void) handleAsFile: (NSData*) data withConfig: (NSDictionary*) config;
@end

@implementation NetworkingBackend

- (id) init {
    return [super initWithModuleName: @"device-networking-alpha"];
}

- (void) cleanupCallbacks: (NSDictionary*) config {
    [self.kirinHelper cleanupCallback:config withNames:@"envelope", @"each", @"payload", @"onFinish", @"onError", nil];
}

- (void) handleError: (NSString*) errorMessage andConfig: (NSDictionary*) config {
    [self.kirinHelper jsCallback:@"onError" fromConfig:config withArgsList:[NSString stringWithFormat:@"'%@'", errorMessage]];
    [self cleanupCallbacks:config];    
}


#pragma mark -
#pragma mark Download JSON


-(void) downloadString: (NSDictionary *) config {
    StringDownloader* downloader = [[StringDownloader alloc] init];
    downloader.successBlock = ^(NSData* data) {
        NSString* string = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
        
        [self.kirinHelper jsCallback:@"payload" 
                          fromConfig:config 
                        withArgsList:[KirinArgs taintedForJs:string]];
        [self cleanupCallbacks:config];
        [downloader release];
    };
    
    downloader.errorBlock = ^(NSString* errorMessage) {
        [self handleError:errorMessage andConfig:config];
        [downloader release];
    };
    
    [downloader startDownloadWithConfig: config];
}

#pragma mark -
#pragma mark Download JSON


-(void) downloadJSON: (NSDictionary *) config {
    
    StringDownloader* downloader = [[StringDownloader alloc] init];
    downloader.successBlock = ^(NSData* data) {
        NSString* string = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
        [self.kirinHelper jsCallback:@"payload" 
                          fromConfig:config 
                        withArgsList:string];
        [self cleanupCallbacks:config];
        [downloader release];
    };
    
    downloader.errorBlock = ^(NSString* errorMessage) {
        [self handleError:errorMessage andConfig:config];
        [downloader release];
    };
    
    [downloader startDownloadWithConfig: config];
}
    

#pragma mark -
#pragma mark Download JSON List

-(void) downloadJSONList: (NSDictionary *) config {
    StringDownloader* downloader = [[StringDownloader alloc] init];
    downloader.successBlock = ^(NSData* data) {
        [self handleList:data withConfig:config];
        [self cleanupCallbacks:config];
        [downloader release];
    };
    
    downloader.errorBlock = ^(NSString* errorMessage) {
        [self handleError:errorMessage andConfig:config];
        [downloader release];
    };
    
    [downloader startDownloadWithConfig: config];
}

- (void) handleList: (NSData*) data withConfig: (NSDictionary*) config {

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
                        withArgsList:[KirinArgs string:string]];
        
        i = 1;
        
    }
    
    
    [self.kirinHelper jsCallback:@"onFinish" 
                      fromConfig:config 
                    withArgsList:[KirinArgs integer:i]];

}




#pragma mark -
#pragma mark Download File

-(void) downloadFile: (NSDictionary *) config {
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    
    NSString* fullPath = [fs filePathFromConfig:config];
    
    BOOL overwrite = [[config objectForKey:@"overwrite"] boolValue];

    if(!overwrite && [[NSFileManager defaultManager] fileExistsAtPath:fullPath]){
        [self.kirinHelper jsCallback:@"onFinish" 
                          fromConfig:config 
                        withArgsList:[KirinArgs string:fullPath]];
        return;
    }
    
    StringDownloader* downloader = [[StringDownloader alloc] init];
    downloader.successBlock = ^(NSData* data) {
        [self handleAsFile:data withConfig:config];
        [self cleanupCallbacks:config];
        [downloader release];
    };
    
    downloader.errorBlock = ^(NSString* errorMessage) {
        [self handleError:errorMessage andConfig:config];
        [downloader release];
    };
    
    [downloader startDownloadWithConfig: config];
}

- (void) handleAsFile: (NSData*) data withConfig: (NSDictionary*) config {
    KirinFileSystem* fs = [KirinFileSystem fileSystem];
    
    NSString* fullPath = [fs filePathFromConfig:config];
    
    if(![[NSFileManager defaultManager] fileExistsAtPath:fullPath]){
        [fs writeData:data toFile:fullPath];
    }
    
    [self.kirinHelper jsCallback: @"onFinish" 
                      fromConfig: config 
                    withArgsList: [KirinArgs string:fullPath]];
}

@end

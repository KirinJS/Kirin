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
#import "JSONListDownloader.h"
#import "FileDownloader.h"

@implementation NetworkingBackend


-(void) downloadJSON: (NSDictionary *) config{
    
    if(1) return;

}

-(void) downloadJSONList: (NSDictionary *) _config{
    
    NSLog(@"<NETWORKING BACKEND> downloadJSONList_: %@", _config);
    
    JSONListDownloader* downloader = [[[JSONListDownloader alloc] init] autorelease];
    [downloader downloadJSONList: _config];
}

-(void) downloadFile: (NSDictionary *) config {
    NSLog(@"<NETWORKING BACKEND> downloadFile_: %@", config);
    FileDownloader* downloader = [[[FileDownloader alloc] init] autorelease];
    [downloader startDownloadWithConfig: config];
}

-(void) deleteDownloadedFile: (NSDictionary *) config {
    NSLog(@"<NETWORKING BACKEND> deleteDownloadedFile_: %@", config);
    FileDownloader* downloader = [[[FileDownloader alloc] init] autorelease];
    [downloader deleteFileWithConfig: config];    
}

@end

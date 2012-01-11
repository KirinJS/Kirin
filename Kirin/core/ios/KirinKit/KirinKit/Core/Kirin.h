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





#import <KirinKit/KirinHelper.h>
#import <KirinKit/KirinUiFragmentHelper.h>
#import <KirinKit/KirinScreenHelper.h>
#import <KirinKit/KirinServiceHelper.h>
#import <KirinKit/KirinServices.h>

// NONE OF THESE SHOULD BE public. 
#import <KirinKit/JSContext.h>
#import <KirinKit/NativeContext.h>
#import <KirinKit/KirinDropbox.h>


#import <KirinKit/SynthesizeSingleton.h>
#import <UIKit/UIWebView.h>


@interface Kirin : NSObject {
}

// publicly available objects.
@property(retain) KirinDropbox* dropbox;

@property(nonatomic, retain) KirinServices* kirinServices;

- (id) initWithWebView: (UIWebView*) aWebView;

- (KirinHelper*) bindObject: (id) nativeObject toModule:(NSString*) moduleName;

- (KirinUiFragmentHelper*) bindUiFragment: (id) nativeObject toModule:(NSString*) moduleName;

- (KirinScreenHelper*) bindScreen: (id) nativeObject toModule:(NSString*) moduleName;

- (KirinServiceHelper*) bindService: (id) nativeObject toModule:(NSString*) moduleName;

SYNTHESIZE_SINGLETON_HEADER_FOR_CLASS(Kirin)

#define KIRIN [Kirin sharedKirin]



// TODO move these into class extensions in the .m file
@property(nonatomic, retain) JSContext* jsContext;
@property(nonatomic, retain) NativeContext* nativeContext;



@end

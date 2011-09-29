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



#import "InvokedUrlCommand.h"
#import "JSON.h"

@implementation InvokedUrlCommand

@synthesize arguments;
@synthesize options;
@synthesize command;
@synthesize className;
@synthesize methodName;

// I've left this returning a new object (i.e. not autoreleased) because the name seems to
// intend it to have the same semantics as [class new].
+ (InvokedUrlCommand*) newFromUrl:(NSURL*)url
{
	//NSLog(@"command: %@", url);
    /*
	 * Get Command and Options From URL
	 * We are looking for URLS that match native://<Class>.<command>/[<arguments>][?<dictionary>]
	 * We have to strip off the leading slash for the options.
	 *
	 * Note: We have to go through the following contortions because NSURL "helpfully" unescapes
	 * certain characters, such as "/" from their hex encoding for us. This normally wouldn't
	 * be a problem, unless your argument has a "/" in it, such as a file path.
	 */
	InvokedUrlCommand* iuc = [[InvokedUrlCommand alloc] init];
	
    iuc.command = [url host];
	NSString* argsJSON = [[url query] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
	NSMutableArray* arguments = [argsJSON JSONValue];

	iuc.arguments = arguments;

	NSArray* components = [iuc.command componentsSeparatedByString:@"."];
	if (components.count == 2) {
		iuc.className = [components objectAtIndex:0];

		iuc.methodName = [[[components objectAtIndex:1] componentsSeparatedByString:@"_"] componentsJoinedByString:@":"];
	}		
	
	return iuc;
}

- (void) dealloc
{
	[arguments release];
	[options release];
	[command release];
	[className release];
	[methodName release];
	
	[super dealloc];
}

@end

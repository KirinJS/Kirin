//
//  KirinHelper.h
//  KirinKit
//
//  Created by James Hugman on 21/12/2011.
//  Copyright 2011 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <KirinKit/JSContext.h>
#import <KirinKit/NativeContext.h>
#import <KirinKit/KirinDropbox.h>
#import <KirinKit/KirinState.h>


/**
 * KirinHelpers are the glue between native objects and Javascript modules, to create a single coherent piece of code.
 *
 * Typically, each native object that wants to talk to Javascript will have a KirinHelper to initialize a 
 * connection with its corresponding Javascript module. 
 *
 * They help: 
 *  * to manage the lifecycle of the object, such that it available when it is needed, and tidied away when it is not.
 *  * to maintain the bridge between native and javascript.
 *
 */
@interface KirinHelper : NSObject {
}

@property(retain) NSString* jsModuleName;
@property(retain) NSObject* nativeObject;

@property(retain) KirinState* state;


/**
 * This is called by the KIRIN. Client apps should never need to call this.
 */
- (id) initWithModuleName: (NSString*) moduleName 
          andNativeObject: (NSObject*) obj 
             andJsContext: (JSContext*) ctx 
         andNativeContext: (NativeContext*) nativeCtx
                 andState: (KirinState*) state;

/**
 * Call this in places where it makes sense to you lifecycle. 
 * e.g. [UIViewController viewDidLoad]
 */
- (void) onLoad;

/*
 * Called by the application implementor where it makes sense in the lifecycle.
 * e.g. [UIViewController viewDidUnload]
 */
- (void) onUnload;

/**
 * Several methods to call Javascript.
 */
- (void) jsMethod: (NSString*) methodName;

- (void) jsMethod:(NSString *)methodName withArgsList:(NSString*) argsList;

- (void) jsMethod:(NSString *)methodName withArgs:(NSObject *)arg, ...
    NS_REQUIRES_NIL_TERMINATION;

- (void) jsCallback: (NSString*) callbackId;

- (void) jsCallback: (NSString*) callbackId withArgsList:(NSString*) argsList;

- (void) jsCallback: (NSString*) callbackId withArgs:(NSObject *)arg, ...
    NS_REQUIRES_NIL_TERMINATION;

- (void) jsCallback: (NSString*) callbackName fromConfig: (NSDictionary*) config;

- (void) jsCallback: (NSString*) callbackName fromConfig: (NSDictionary*) config withArgsList:(NSString*) argsList;

- (void) jsCallback: (NSString*) callbackName fromConfig: (NSDictionary*) config withArgs:(NSObject *)arg, ...
    NS_REQUIRES_NIL_TERMINATION;


/**
 * The callbacks are managed within the JS context, so we will need to delete the callbacks when we're finished with them.
 */
- (void) cleanupCallback: (NSString*) callbackId, ...
    NS_REQUIRES_NIL_TERMINATION;

- (void) cleanupCallback: (NSDictionary*) config withNames: (NSString*) callbackName, ...
    NS_REQUIRES_NIL_TERMINATION;

- (void) cleanupCallbacks:(NSArray*) callbackIds;

- (KirinDropbox*) dropbox;

/**
 * Get an object that conforms to the given protocol. 
 *
 * Calling methods on this protocol will call a corresponding method on the javascript module this KirinHelper is 
 * bound to.
 */
- (id) proxyForJavascriptModule: (Protocol*) protocol;

/**
 * Get an object that conforms to the given protocol, and backed by the given dictionary.
 * 
 * Getter methods in the protocol will look for values in the backing dictionary and will (attempt to) coerce the 
 * resulting value into the return value.
 * 
 * Calling methods on the proxy object will look for a NSString in the backing dictionary with a corresponding key.
 * If a string is found it is taken to be the id of a callback object in Javascript. The callback is then invoked.
 * 
 */ 
- (id) proxyForJavascriptRequest:(Protocol*) protocol andDictionary: (NSDictionary*) dictionary;

- (id) proxyForJavascriptResponse:(Protocol*) protocol;

@end

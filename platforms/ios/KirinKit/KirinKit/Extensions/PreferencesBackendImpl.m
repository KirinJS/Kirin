//
//  PreferencesBackend.m
//  KirinKit
//
//  Created by James on 06/10/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "PreferencesBackendImpl.h"

#import "KirinPreferences.h"

@interface PreferencesBackendImpl ()

@property(nonatomic, retain) id<KirinPreferenceListener> preferenceListener;
@property(nonatomic, retain) id<KirinPreferences> kirinModule;


- (NSDictionary*) settingsAsDictionary;

@end

@implementation PreferencesBackendImpl

@synthesize preferenceListener = preferenceListener_;

+ (PreferencesBackendImpl*) instance {
    return [[[PreferencesBackendImpl alloc] init] autorelease];
}

- (id) init {
    return [super initWithModuleName:@"app-preferences-alpha"];
}

/*
 *
 */


#pragma mark -
#pragma mark Lifecycle methods

- (void) onLoad {
    [super onLoad];
    
    self.kirinModule = [self.kirinHelper proxyForJavascriptModule:@protocol(KirinPreferences)];
    [self.kirinModule mergeOrOverwrite:[self settingsAsDictionary]];
    [self.kirinModule resetEnvironment];
}

#pragma mark -
#pragma mark Internal Methods

- (NSDictionary*) settingsAsDictionary {
    // Returns a dictionary of all the pairs in NSUserDefaults
    // whose keys begin with "kirin-"
    NSDictionary* settings = [[NSUserDefaults standardUserDefaults] dictionaryRepresentation];
    NSMutableDictionary* kirinSettings = [NSMutableDictionary dictionary];
    
    for (id key in settings) {
        if ([key hasPrefix:@"kirin-"]) {
            [kirinSettings setValue:[settings objectForKey:key] forKey:[key substringFromIndex:6]];
        }
    }
    return kirinSettings;
}

- (NSString*) treatedKey: (NSString*) key {
    return [NSString stringWithFormat:@"kirin-%@", key];
}

#pragma mark -
#pragma mark External Interface Methods

- (void) updateStoreWithChanges: (NSDictionary*) adds andDeletes: (NSArray*) deletes {
    NSUserDefaults* userSettings = [NSUserDefaults standardUserDefaults];
    
    if([adds isKindOfClass:[NSDictionary class]]) {
        // Make a separate dictionary of all the keys with "kirin-"
        // stuck on the front.
        NSMutableDictionary* kirinAdds = [NSMutableDictionary dictionary];
        for (id key in adds) {
            id value = [adds objectForKey:key];
            [kirinAdds setValue:value forKey:[self treatedKey:key]];
        }
        
        [userSettings setValuesForKeysWithDictionary:kirinAdds];
    } else {
        NSLog(@"[PreferencesBackend] didn't expect a %@", [adds class]);
    }
    
    if([deletes isKindOfClass:[NSArray class]]) {
        for (id key in deletes) {
            // Ensure we stick "kirin-" on the front before removing keys
            [userSettings removeObjectForKey:[self treatedKey:key]];
        }
    } else {
        NSLog(@"[PreferencesBackend] didn't expect a %@", [deletes class]);
    }
    
    [userSettings synchronize];
}


/**
 * @param listener
 */
- (void) addPreferenceListener: (NSDictionary*) listenerDictionary {
    self.preferenceListener = [self.kirinHelper proxyForJavascriptRequest:@protocol(KirinPreferenceListener)
                                                            andDictionary: listenerDictionary];
}

- (void) removePreferenceListener {
    [self.preferenceListener onListeningEnding];
    self.preferenceListener = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

/**
 * @param preferenceName
 */
- (void) addInterestFor: (NSString*) key {
    [[NSUserDefaults standardUserDefaults] addObserver:self forKeyPath:[self treatedKey:key] options:NSKeyValueObservingOptionNew context:NULL];
}

/**
 * @param preferenceName
 */
- (void) removeInterestFor: (NSString*) key {
    [[NSUserDefaults standardUserDefaults] removeObserver:self forKeyPath:[self treatedKey:key]];
}

- (void) preferenceHasChanged: (NSNotification*) notification {
    
    [self.preferenceListener onPreferenceChange:@"foo" :@"yes" ];
}

- (void)dealloc {
    self.preferenceListener = nil;
    [super dealloc];
}

@end

//
//  Settings.h
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import <Foundation/Foundation.h>


@protocol Settings <NSObject>

/*
 * Updates settings, by running a javascript method against
 * the settings (as a javascript object with properties keyed by setting name).
 */
- (void) requestPopulateJSWithCallback:(NSString *)updateCallback;

/*
 * Deletes settings, also removing those that are no longer needed.
 * 
 * Arguments:
 * (NSDictionary *)keyValuePairs
 * (NSArray *)deletedKeys
 */
- (void) updateContents:(NSDictionary *)adds withDeletes:(NSArray *)deletes;
- (void) requestPopulateJSWithCallback:(NSString *)updateCallback;
@end

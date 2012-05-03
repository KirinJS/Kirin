//
//  KirinArgsTest.m
//  KirinKit
//
//  Created by James Hugman on 03/05/2012.
//  Copyright (c) 2012 Future Platforms. All rights reserved.
//

#import "KirinArgsTest.h"

#import <KirinKit/KirinArgs.h>

@implementation KirinArgsTest



- (void) testArgs {
    STAssertEqualObjects(@"", [KirinArgs args: nil], @"No args");
    
    
    NSString* args1 = [KirinArgs args: @"1", nil];
    STAssertEqualObjects(@"1", args1, @"One arg");
    
    NSString* args2 = [KirinArgs args: @"1", @"2", nil];
    STAssertEqualObjects(@"1, 2", args2, @"Two args");

    
    NSString* args3 = [KirinArgs args: @"1", @"2", @"3", nil];
    STAssertEqualObjects(@"1, 2, 3", args3, @"Three args");

}

@end

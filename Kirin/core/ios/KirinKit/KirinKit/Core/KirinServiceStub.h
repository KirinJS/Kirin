//
//  KirinServiceStub.h
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import <KirinKit/KirinServiceProtocol.h>
#import <KirinKit/KirinServiceHelper.h>


@interface KirinServiceStub : NSObject <KirinServiceProtocol> {
    
}

@property(retain, nonatomic) NSString* moduleName;
@property(retain, nonatomic) KirinServiceHelper* kirinHelper;

- (id) initWithModuleName: (NSString*) moduleName;

@end

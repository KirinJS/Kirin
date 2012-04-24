//
//  KirinExtensionStub.h
//  KirinKit
//
//  Created by James Hugman on 11/01/2012.
//  Copyright 2012 Future Platforms. All rights reserved.
//

#import <KirinKit/KirinExtensionProtocol.h>
#import <KirinKit/KirinExtensionHelper.h>


@interface KirinExtensionStub : NSObject <KirinExtensionProtocol> {
    
}

@property(retain, nonatomic) NSString* moduleName;
@property(retain, nonatomic) KirinExtensionHelper* kirinHelper;

- (id) initWithModuleName: (NSString*) moduleName;

@end

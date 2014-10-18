module.exports = {
  'dist-relative': {
    'android': './app/src/main/assets/generated-javascript'
  },

  'idl-dist': {
    'android': './app/src/main/java',
  },
  "ios": {
    "build": "xcodebuild -target KirinKit",
    "build.debug": "xcodebuild -sdk iphoneos -configuration Debug clean build",
    "build.release": "xcodebuild -sdk iphoneos -configuration Release clean build"
  },
  "android": {
    "build": "ant clean debug && ant clean release",
    "build.debug": "ant clean debug",
    "build.release": "ant clean release"
  }
};
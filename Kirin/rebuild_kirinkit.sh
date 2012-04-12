if [[ "$KIRIN_HOME" = "" ]] ; then 
	export KIRIN_HOME=`dirname $0`
fi
configuration=$1
if [[ "$configuration" = "" ]] ; then 
	configuration=Debug
fi
rm -Rf $KIRIN_HOME/core/ios/KirinKit/build 2>/dev/null
node $KIRIN_HOME/build.js --ios --ios-configuration $configuration --no-js-build --tests none

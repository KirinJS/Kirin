if [[ "$KIRIN_HOME" = "" ]] ; then 
	export KIRIN_HOME=`dirname $0`
fi
rm -Rf $KIRIN_HOME/core/ios/KirinKit/build 2>/dev/null
node $KIRIN_HOME/build.js --ios --ios-configuration Debug

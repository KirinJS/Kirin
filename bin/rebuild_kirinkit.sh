if [[ "$KIRIN_HOME" = "" ]] ; then 
	export KIRIN_HOME=`dirname $0`/..
fi
configuration=$1
if [[ "$configuration" = "" ]] ; then 
	configuration="debug release"
fi
rm -Rf $KIRIN_HOME/platforms/ios/KirinKit/build 2>/dev/null
for conf in $configuration ; do 
	$HOME/bin/kirin-build --src $KIRIN_HOME --platform ios --native  --target $conf --noJavascript
done

#!/bin/sh

dirname=$(dirname $0)
if [ "${KIRIN_HOME}" = "" ] ; then
	# assume we're in the demos directory.
	dir=$dirname/../../..
	export KIRIN_HOME=$(cd "$dir"; echo `pwd`);
fi
export KIRINJS_HOME=${KIRIN_HOME}/js

dist_path=$3
if [ "$3" = "" ] ; then 
	dist_path="-"
fi

export PROJECT_NAME=hello-kirin
export PROJECT_HOME=$(cd "${dirname}" ; echo `pwd`)

// we can also add a fourth argument which will specify a build file to run just after the kirin files have run through JSLint.
sh $KIRINJS_HOME/build/build.sh $1 $2 $dist_path 

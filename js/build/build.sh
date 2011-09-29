#!/bin/sh




######################################################################
#
######################################################################

dirname=`dirname $0`

platform=$1
build=$2
dist_path="$3"
project_build_script="$4"

function rel2abs {
	echo $(cd "`pwd`" ; cd $1 ; echo `pwd` );
}

function rel2absfile {
	my_file=$(basename $1)
	my_dir=$(dirname $1)
	echo $(rel2abs $my_dir)/$my_file;
}

function usage {
    echo Usage: build.sh platform [build_type [dist_directory project_build_script extra_build_step]]
    echo 
    echo "Build and test the Javascript project"
    echo
    echo The script:
    echo "\tIdentifies the correct files in shared/ relevant to the platform"
    echo "\truns tests found in test/test-all.js."
    echo "\truns JSLint on each of the files in turn."
    echo "\toptionally assembles a directory suitable for distribution."
    echo 
    echo "Options:" 
    echo "\tplatform           qt|ios|android"
    echo "\tbuild_type         developer|qa|stage|production"
    echo "\tdist_directory     the directory where the files will be copied."
    echo 
    echo Varying the platform or build-type will change the Javascript that is used. The suffixes used in the shared directory become 
    echo significant. 
    echo 
    echo Suffixes:
    echo "\t-android.js     Only included in Android builds."
    echo "\t-ios.js         Only included in iOS builds."
    echo "\t-qt.js          Only included in Qt builds."
    echo "\t-webview.js     Only included for platforms where the Javascript is to be run in a webview. e.g. Android, iOS"
    echo "\t-js.js          Only included for platforms where the Javascript is to be run in a webview. e.g. QML, WebOS"
    echo "\t-dev			Only included for development releases. " 
    echo "\t-qa				Only included for QA releases" 
    echo "\t-stage			Only included for Staging releases" 
    echo "\t-production		Only included for production releases"
    echo 
    echo These suffixes may be combined, e.g. for a javascript file to be included in both android and qt, use -android-qt.js as a suffix. 
    echo 
    echo Build-type:
    echo This will toggle minification, and the use of minified versions of library files.
    echo For this reason, for each external library, there must be two versions supplied: with and without a -min.js suffix.
    echo
    echo Build-type options: 
    echo "\tproduction    minify the Javascript in shared/ and use the -min.js files available in lib/"
    echo "\tstage         minify the Javascript in shared/ and use the -min.js files available in lib/"
    echo "\tqa            minify the Javascript in shared/ and use the -min.js files available in lib/"
    echo "\tdeveloper     uses unminified versions of files in lib/."
    echo 
    echo Distribution directory
    echo If one is specified, the platform specific file in index/ is used as a template. The value of %INCLUDED_SCRIPTS% is 
    echo replaced with the platform specific method of loading all relevant javascript files.
    echo 
    echo If a dir is not specified, then the tests and jsLint are still run.
    echo 
    echo A hyphen is used to specify an empty string.
    echo 
    echo Additional build step:
    echo This is a project specific build step, with access to various functions from this build script, including running the JS compiler, 
    echo running JSLint and path conversion utils.
    
    exit 1;
}

# command line processing. 

if [ "$platform" = "" ] ; then 
    usage   
fi

build_type=""
if [ "$build" = "developer" ] ; then 
    build_type="developer"
fi
if [ "$build" = "release" ] ; then 
    build_type="qa"
fi
if [ "$build" = "qa" ] ; then 
    build_type="qa"
fi
if [ "$build" = "stage" ] ; then 
    build_type="stage"
fi
if [ "$build" = "production" ] ; then 
    build_type="production"
fi

# if no dist path is used, then there is no point in minifying.
if [ "$dist_path" = "-" ] ; then 
	dist_path=""
fi
if [ "$dist_path" = "" ] ; then 
    build_type="developer"
else
	if [ -f $dist_path ] ; then 
		echo Path to destination directory is already a file.
		echo Path: $dist_path
		exit 1;
	fi

    rm -Rf $dist_path 2>/dev/null
    mkdir -p $dist_path/lib 
fi

if [ "$build_type" = "" ] ; then 
    usage
fi

if [ "$PROJECT_NAME" = "" ] ; then 
	echo "PROJECT_NAME should be defined"
	exit 1
fi

if [ "$PROJECT_HOME" = "" ] ; then 
	echo "PROJECT_HOME should be defined"
	exit 1
fi

export PROJECT_HOME=$(rel2abs "$PROJECT_HOME")
if [ "$PROJECT_HOME_SCRIPT" = "" ] ; then 
	export PROJECT_HOME_SCRIPT=${PROJECT_HOME}/scripts
fi
echo PROJECT_HOME=${PROJECT_HOME}
echo PROJECT_HOME_SCRIPT=${PROJECT_HOME_SCRIPT}

# configure some environment variables.
export node=`which node`
if [ "$node" = "" ] ; then 
    export node="/usr/local/bin/node"
fi

export java=`which java`
echo "which java is $java"
if [ "$java" = "" ] ; then
	if [ "$JAVA_HOME" = "" ] ; then 
		export java="$JAVA_HOME/bin/java"
	else 
    	export java="/usr/bin/java"
    fi
fi



export kirinjs_home=$(rel2abs "${dirname}/..")
kirinjs_home_script=${kirinjs_home}/scripts


export jslint=${dirname}/tools/jslint/bin/jslint.js
export compiler_jar="${dirname}/tools/closure/compiler.jar"
minified_js_file=${PROJECT_NAME}-min.js
minified_js="${dist_path}/${minified_js_file}"


######################################################################
# Run the tests.
######################################################################
if [ -f $node ] ; then
	kirinjs_test_all="${kirinjs_home}/test/test-all.js"
	project_test_all="${PROJECT_HOME}/test/test-all.js"
	
	$node $kirinjs_test_all
	if [ $? != 0 ]; then
	  echo "Not all Kirin.js tests passed. Exiting"
	  exit 1
	fi
	
	if [ -f $project_test_all ] ; then 
		$node $project_test_all "${kirinjs_home}"
		if [ $? != 0 ]; then
		  echo "Not all ${PROJECT_NAME} tests passed. Exiting"
		  exit 1
		fi
	fi 
else 
	echo node.js not found: NO TESTS WERE RUN
fi

######################################################################
# Set up some filters & the index file specific to the platform.
# Collect shared/ files. 
######################################################################
index_file=""
platform_filter=""
total_filter="-android|-ios|-qt|-webview|-javascript|-dev|-qa|-stage|-prod"
if [ "$platform" = "qt" ]; then
    platform_filter="-qt|-js"
    index_file="index-qt.js"
else if [ "$platform" = "ios" ]; then
    platform_filter="-ios|-webview"
    index_file="index-ios.html"
else if [ "$platform" = "android" ]; then
    platform_filter="-android|-webview"
    index_file="index-android.html"
fi
fi
fi

if [ "$build_type" = "developer" ] ; then 
    platform_filter="${platform_filter}|-dev"
else if [ "$build_type" = "qa" ] ; then 
    platform_filter="${platform_filter}|-qa"
else if [ "$build_type" = "stage" ] ; then 
    platform_filter="${platform_filter}|-stage"
else if [ "$build_type" = "production" ] ; then 
    platform_filter="${platform_filter}|-prod"
fi
fi
fi
fi 

function collectFiles {
    files="";

    for file in `find "$1" -name \*.$2 | egrep -v -- "${total_filter}" | egrep -v "$1/core/client-modules.js" | sort`; do 
        files="$files $file";
    done
    for file in `find "$1" -name \*.$2 | egrep -- "${platform_filter}" | egrep -v "$1/core/client-modules.js" | sort`; do 
        files="$files $file";
    done
    echo $files
}
jsFiles="$kirinjs_home_script/core/client-modules.js $(collectFiles $kirinjs_home_script js) $(collectFiles $PROJECT_HOME_SCRIPT js)"

######################################################################
# Run JSLint on the shared files.
######################################################################
function run_jslint {
	if [ -f $node ] ; then
		echo ================================ 1>&2
		echo JSLint output 1>&2
		okFiles=""
		failed=0
		for file in $1 ; do
			if [ "${file/generated-*.js/}" = "$file" ] ; then 
			    output=`$node $jslint $file`
			    
			    if [ "$output" = "OK" ] ; then
			        okFiles="${okFiles}."
			    else
			        if [ "${file##*Native-qt.js}" = "" ] ; then 
			            okFiles="${okFiles}."
			        else 
			            echo ------------------------------- 1>&2
			            echo $file 1>&2
			            $node $jslint $file 1>&2
			            failed=$((failed + 1))
			        fi
			    fi 
		    fi
		done
		echo 1>&2
		echo ================================ 1>&2
		if [ "$failed" != "0" ] ; then
		    echo "Too many files with lint warnings. Build failed." 1>&2 
		    exit 1;
		fi
	else 
		echo node.js not found: NO JSLINT WAS RUN 1>&2
	fi
	echo  
}
export -f run_jslint

$(run_jslint "$jsFiles")
if [ "$?" != "0" ] ; then 
	exit 1
fi

######################################################################
# Run project_build_script
######################################################################

function check_compiler {
	if [ ! -f "$java" ] ; then 
		if [ "$dist_path" != "" ] ; then
			echo Missing Java. Cannot run the closure compiler. &1>2
			exit 1;
		fi
	fi
}
export -f check_compiler

function compiler_command {
	compile_level=SIMPLE_OPTIMIZATIONS

    cmd="$java -jar $compiler_jar --manage_closure_dependencies true --compilation_level $compile_level"

    for file in `echo $1` ; do
        cmd="$cmd --js $file"
    done
    
    echo $cmd
}
export -f compiler_command

function windows2unix {
	# This ugly string replace is to help cygwin run Java programs with friendly windows paths
	cmd=$1
	cmd=${cmd//\/cygdrive\/c/c\:}
    cmd=${cmd//\/cygdrive\/d/d\:}
    cmd=${cmd//\/cygdrive\/e/e\:}
    cmd=${cmd//\/cygdrive\/f/f\:}
    echo $cmd
}
export -f windows2unix

if [ "$project_build_script" != "" ] ; then
	project_build_script=$(rel2absfile "$project_build_script")
	if [ -f $project_build_script ] ; then
		sh "$project_build_script"
		if [ $? != 0 ]; then
	      echo Additional build script ${project_build_script} exited abnormally. Failing build.
	      exit 1
	    fi
	else	 
			echo "Can't run additional build script at ${project_build_script}" 1>&2
	fi
fi

# we may have generated extra javascript files
jsFiles="$kirinjs_home_script/core/client-modules.js $(collectFiles $kirinjs_home_script js) $(collectFiles $PROJECT_HOME_SCRIPT js)"

######################################################################
# Based on the build type, collect the correct libraries 
# and optionally run the closure compiler on the shared/ files.
######################################################################
function collectLibFiles {
    files="";
    for file in `find "$1/lib" -name "*$2" | egrep -v "$3" | sort`; do 
        files="$files $file";
    done
    echo $files
}


if [ "$build_type" = "developer" ] ; then 
    libFiles=$(collectLibFiles "$kirinjs_home" "\.js" "min.js")
    libFiles="$libFiles $(collectLibFiles "$PROJECT_HOME" "\.js" "min.js")"
else 
    
    libFiles=$(collectLibFiles "$kirinjs_home" "-min\.js" "XXXXX")
    libFiles="$libFiles $(collectLibFiles "$PROJECT_HOME" "-min\.js" "XXXXX")"

	check_compiler

	compile_now="$(compiler_command "$jsFiles") --js_output_file $minified_js"

    echo "Compiling javascript with Closure"

    compile_now=$(windows2unix "$compile_now")
    echo $compile_now
    $compile_now
    
    if [ $? != 0 ]; then
      echo "Compilation finished with errors." 1>&2
      exit 1
    fi
    jsFiles="${minified_js_file}"
fi


######################################################################
# If no dist path is specified, we're done. 
# Otherwise, we need to
######################################################################
if [ "$dist_path" = "" ] ; then 
    echo OK
    exit 0
fi


######################################################################
# Generate the correct index file
######################################################################
echo "Generating ${index_file}"

function generateScript {
    for file in `echo $libFiles $jsFiles` ; do
    	f="${file/$kirinjs_home_script\//}"
	    f="${f/$kirinjs_home\//}"
	    f="${f/$PROJECT_HOME\//}"
        echo "$1${f}$2 "
    done
}

include_pre=""
include_post=""
if [ "$platform" = "qt" ]; then
    include_pre='Qt.include("'
    include_post='");'
else if [ "$platform" = "ios" ]; then
    include_pre="\t<script type='text/javascript' src='"
    include_post="'></script>"
else if [ "$platform" = "android" ]; then
    include_pre="\t<script type='text/javascript' src='"
    include_post="'></script>"
fi
fi
fi

included=`generateScript "$include_pre" "$include_post"`

kirinjs_index_file=${kirinjs_home}/index/${index_file}
project_index_file=${PROJECT_HOME}/index/${index_file}

index_contents=$(cat ${kirinjs_index_file})

contents="${index_contents/\%INCLUDED_SCRIPTS\%/$included}"
echo $contents > "${dist_path}/${index_file}"

if [ -f $project_index_file ] ; then
	cat "$project_index_file" >> "${dist_path}/${index_file}" 
fi


######################################################################
# And finally copy the javascript files into the dist dir.
######################################################################


echo Assembling files into $dist_path

function collectResourceFiles {
    file_types="$2"
    files="";
    for file in `find $1 | egrep -v -- "${total_filter}" | egrep $file_types | egrep -v ".svn|$1/build/|$1/index/|$1/test/|\.js" | sort`; do 
        files="$files $file";
    done
    for file in `find $1 | egrep -- "${platform_filter}" | egrep $file_types | egrep -v ".svn|$1/build/|$1/index/|$1/test/|\.js" | sort`; do 
        files="$files $file";
    done
    
    echo $files
}

resFiles=$(collectResourceFiles "$kirinjs_home_script" "\.sql|\.txt|\.json|\.css|\.properties|\.html")
resFiles="$resFiles $(collectResourceFiles "$PROJECT_HOME_SCRIPT" "\.sql|\.txt|\.json|\.css|\.properties|\.html")"
for file in `echo $libFiles $jsFiles $resFiles` ; do
    f="${file/$kirinjs_home_script\//}"
    f="${f/$kirinjs_home\//}"
    f="${f/$PROJECT_HOME\//}"
    d=`dirname $f`
    dir="${dist_path}/${d}"
    
    if [ "$d" = "$dist_path" ] ; then
        echo "No point copying $file" > /dev/null
    else 
        mkdir -p $dir 2>/dev/null
      
        echo Copying $f from $file to $dir
        cp $file $dir 2>/dev/null
    fi
done

echo Directory for $platform is at $dist_path
echo Done
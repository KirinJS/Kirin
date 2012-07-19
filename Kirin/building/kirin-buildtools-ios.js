var childProcess = require("child_process"), 
	path = require("path"),
	fileUtils = require("./fileUtils");

var verbose = fileUtils.verbose;
var iphoneSDK = null;

var _ = require("underscore");
function compileProject (environment, dir, callback, errback) {
	verbose = environment.verbose;
	var directory = path.join(dir, environment["ios.dir"] || "ios");
	if (!path.existsSync(directory)) {
		console.log("# cd " + directory + " # directory doesn't exist");
		callback();
		return;
	}

	if (!iphoneSDK) {
		childProcess.exec("xcodebuild -showsdks | grep -o 'iphoneos*.*' | tail -n 1", function (error, stdout, stderr) {
			if (!error) {
				iphoneSDK = stdout.toString().replace(/[\n\s]/g, "");
				compileProject (environment, dir, callback, errback);
			} else {
				errback(error);
			}
			
		});
		return;
	}

	var cwd = process.cwd();
	
	console.log("cd \"" + directory + "\"");
	var args = ["xcodebuild"];

	if (iphoneSDK) {
		args.push("-sdk " + iphoneSDK);
	}
	
	if (environment["ios.project"]) {
		args.push("-project " + environment["ios.project"]);		
	}
	
	if (environment["ios.code_sign_identity"]) {
		args.push("CODE_SIGN_IDENTITY=\"" + environment["ios.code_sign_identity"] + "\"");
	}

	if (environment["ios.other_code_sign_flags"]) {
		args.push("OTHER_CODE_SIGN_FLAGS=\"" + environment["ios.other_code_sign_flags"] + "\"");
	}

	if (environment["ios.provisioning_profile"]) {
		args.push("PROVISIONING_PROFILE=\"" + environment["ios.provisioning_profile"] + "\"");
	}
	
	if (environment["ios.workspace"]) {
		args.push("-workspace " + environment["ios.workspace"]);
	}
	
	if (environment["ios.target"]) {
		args.push("-target " + environment["ios.target"]);	
	}
	
	if (environment["ios.configuration"]) {
		args.push("-configuration " + environment["ios.configuration"]);	
	} else {
		environment["ios.configuration"] = "Release";
	}

	args.push("clean build");
	var cmd = args.join(" ");
	console.log(cmd);
	//process.chdir(directory);
	if (environment.dryRun) {
		console.log("cd -");
		callback();
		return;
	}
	childProcess.exec(cmd, {maxBuffer: 1024*1024, cwd: directory }, function (error, stdout, stderr) {
		console.log("cd -");
		if (error) {
			console.log("---------------------------------------");
			console.dir(error);
			console.log(stdout);
			console.log("---------------------------------------");
			console.log(stderr);
			if (errback) {
				errback(error);
			}
		} else {
			if (verbose) {
				console.log(stdout);
			}
			if (callback) {
				callback();
			}
		}
	});
}

function checkAndCompile (environment, dir, buildType, callback, errback) {

	var cb = callback;
	if (!environment["ios.isFramework"]) {
		cb = function () {
			var archiveFile = environment.appFile || path.join(process.cwd(), environment.name + "-" + environment["ios.configuration"] + "-" + buildType + ".zip");
			var appPath = path.join(dir, environment["ios.dir"] || "ios", "build", environment["ios.configuration"] + "-iphoneos");
			var zipCmd = "zip -r -T -y '" + archiveFile + "' *.app";
			console.log("cd " + appPath);
			console.log(zipCmd);
			if (environment.dryRun) {
				console.log("cd -");
				callback();
				return;
			}
			
			childProcess.exec(zipCmd, { cwd: appPath }, function (error, stdout, stderr) {
				if (!error) {
					console.log(stdout);
					if (callback) {
						console.log("cd -");
						callback();
					}
				}
			});
		}
	}
	
	compileProject(environment, dir, cb, errback);
}

/*
 * Native compiling methods.
 */
exports.compileApplication = function (environment, dir, buildType, callback, errback) {
	checkAndCompile(environment, dir, buildType, callback, errback);
};
exports.compileDependency = function (environment, dir, callback, errback) {
	checkAndCompile(environment, dir, null, callback, errback);
};

exports.deriveBuildPath = function (dir, environment) {
	return path.join(dir, (environment["ios.dir"] || "ios"), "generated-javascript");
}

exports.initializeProject = function (environment, subProjects) {
	
	console.dir(environment);
	console.log("-------------------------------------------");	
	var fileUtils = require("./fileUtils");
	var projects = _.map(subProjects, function (p) {
		var info = p.info;
		info.cwd = p.cwd;
		info['ios.dir'] = path.join(p.cwd, info['ios.dir']);
		return info;
	});
	
		
	_.each(projects, function (p) {
		console.dir(p);
			console.log("-------------------------------------------");	
	});
	
	var base = _.last(projects);
	var workspace = path.join(base.cwd, "ios", base.name + ".xcworkspace");
	fileUtils.mkdirs(workspace);

	var lines = [ 	'<?xml version="1.0" encoding="UTF-8"?>', 
					"<Workspace", 
					'   version = "1.0">' ];
	
	_.each(projects, function (p) {
		lines.push("   <FileRef");
		lines.push('      location = "absolute:' + path.join(p['ios.dir'], p['ios.project']) + '">');
		lines.push("   </FileRef>");
	});
	
	lines.push("</Workspace>");
	
	fileUtils.writeLines(path.join(workspace, "contents.xcworkspacedata"), lines);

};

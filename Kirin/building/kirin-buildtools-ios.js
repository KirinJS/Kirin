var childProcess = require("child_process"), path = require("path");
var iphoneSDK = null;

function compileProject (environment, dir, callback, errback) {

	var directory = path.join(dir, environment["ios.dir"] || "ios");
	if (!path.existsSync(directory)) {
		callback();
	}

	if (!iphoneSDK) {
		childProcess.exec("xcodebuild -showsdks | grep -o 'iphoneos*.*'", function (error, stdout, stderr) {
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
			console.dir(error);
			console.log(stderr);
			if (errback) {
				errback(error);
			}
		} else {
			console.log(stdout);
			if (callback) {
				callback();
			}
		}
	});
}

exports.compileApplication = function (environment, dir, callback, errback) {
	compileProject(environment, dir, function () {
		var archiveFile = environment.appFile || path.join(process.cwd(), environment.name + "-" + environment["ios.configuration"] + "-" + environment.buildType + ".zip");
		var appPath = path.join(dir, environment["ios.dir"] || "ios", "build", environment["ios.configuration"] + "-iphoneos");
		var zipCmd = "zip -r " + archiveFile + " *.app";
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
	
	}, errback);
};

exports.compileDependency = function (environment, dir, callback, errback) {
	compileProject(environment, dir, callback, errback);
};
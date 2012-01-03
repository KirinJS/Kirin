var kirin_home = process.env["KIRIN_HOME"] || __dirname + "/../../Kirin";
if (kirin_home) {
	process.env["KIRIN_HOME"] = kirin_home;
	require(kirin_home + "/build.js").build(process.argv, __dirname);
} else {
	console.error("Need to set environment variable KIRIN_HOME");
}

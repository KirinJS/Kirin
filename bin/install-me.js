#!/usr/bin/env node
var path = require("path"),
    fs = require("fs"),
    childProcess = require("child_process"),
    findit = require("findit"),
    _ = require("underscore"),
    kirinHomePath = path.resolve(__dirname, "..");

function finish() {
    console.log("Now tell Eclipse and XCode that KIRIN_HOME = " + kirinHomePath);        
}
    
console.log("Updating android projects with the android command");
childProcess.exec("android list | grep -o android-[0-9]* | sort | head -n 1", function (error, stdout, sterr) {
    
    if (sterr) {
        console.error("Cannot run the android command. You'll need to update the projects manually");
        console.error(sterr.toString());
        finish();
        return;
    }
    
    var target=stdout.toString(), 
        projectDirectories = _.filter(findit.sync(kirinHomePath), function (t) {
            return t.indexOf("android") > 0 && t.indexOf(".project") > 0; 
        }),
        counter = projectDirectories.length;
        
    _.each(projectDirectories, function (file) {
        var dir = path.dirname(file),
            projectProperties = path.join(dir, "project.properties");
            
            fileContents = fs.readFileSync(projectProperties).toString(),
            isLibraryProject = fileContents.indexOf("android.library=true") > 0,
            whatToUpdate = isLibraryProject ? "lib-project" : "project --subprojects",
            androidUpdateProjectCommand = "android update " + whatToUpdate + " --path " + dir + " --target " + stdout;

        childProcess.exec(androidUpdateProjectCommand, function(error, stdout, stderr) {
            if (error !== null) {
                console.error("Canot run android update project on the new android app", error);
            }
            counter --;
            if (counter == 0) {
                finish();                
            }

        });

    });
    
    

});


exports.getFileTypeFromExtension = function (name) {
    var re = /\.(png|jpg|jpeg)$/;
    var match = re.test(name);
    
    var type = "png";
    
    if (match) {
    
        switch (match[1]) {
    
            case "png":
                type = "png";
                break;
            case "jpeg":
            case "jpg":
                type = "jpeg";
                break;
        }
    }    
    return type;
};

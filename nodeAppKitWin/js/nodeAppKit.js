
(function () {
    "use strict";// Appends a line of text to logArea
    
    function loadJavascript(path) {
        var s = document.createElement("script");
        var text = nodeAppKitLib.natives.require(path).then(function (text) {
            s.innerText = text;
            document.head.appendChild(s);
        });

       /*( var url = new Windows.Foundation.Uri("ms-appx:///js/test.js");
        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).then(function (file) {
            Windows.Storage.FileIO.readTextAsync(file).then(function (text) {
                s.innerText = text;
               document.head.appendChild(s);
            });
        });*/
    }

    console.log("nodeAppKit Started");
    nodeAppKitLib.console.log("HELLO CAT");
    loadJavascript("test.js");
})();
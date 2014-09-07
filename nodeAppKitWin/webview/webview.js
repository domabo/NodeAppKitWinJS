
(function () {
    "use strict";

    var page = WinJS.UI.Pages.define("webview.html", {
        ready: function (element, options) {
             var webviewControl = document.getElementById("webview");
      
            var s = document.createElement("script");
            s.src = "/js/nodeAppKit.js";
           document.head.appendChild(s);

           goHome();
        }
    });

    function goToUrl() {
        var destinationUrl = document.getElementById("urlField").value;
        try {
            document.getElementById("webview").navigate(destinationUrl);
        } catch (error) {
            WinJS.log && WinJS.log("\"" + destinationUrl + "\" is not a valid absolute URL.\n", "sdksample", "error");
            return;
        }
    }

    function stopNavigation() {
        document.getElementById("webview").stop();
        updateNavigatingState(false);
    }

    function goHome() {
        var webviewControl = document.getElementById("webview");
        var contentUri = document.getElementById("webview").buildLocalStreamUri("NavigateToStream", "index.html");
        var uriResolver = new nodeAppKitLib.StreamUriResolver();
        document.getElementById("webview").navigateToLocalStreamUri(contentUri, uriResolver);
 
    }

    function goForward() {
        var webviewControl = document.getElementById("webview");
        if (webviewControl.canGoForward) {
            webviewControl.goForward();
        }
    }

    function goBack() {
        var webviewControl = document.getElementById("webview");
        if (webviewControl.canGoBack) {
            webviewControl.goBack();
        }
    }

      // Appends a line of text to logArea
    function appendLog(message) {
        var logArea = document.getElementById("logArea");
        logArea.value += message;
        logArea.scrollTop = logArea.scrollHeight;
    }

})();

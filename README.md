![nodeAppKit](https://raw.github.com/OwinJS/nodeAppKit/master/app-shared/owinjs-splash/images/nodeAppKit.png)

#Windows Version: A Native Web Application Kit

** not functional at this time, early port to WinRT **

**nodeAppKitWin** is a lean and mean app development kit for node.js-based desktop **and** mobile client applications;  it's based on node.js, but instead of using a separate embedded V8 engine or the blink chromium renderer, nodeAppKit just uses the native javascript and html5 engines of the host operating system, in this case Windows Metro WinRT Store Apps.

Most modern operatings systems (OSX 10.9+, Windows 8.1+, modern Linux distributions, ioS 5+, ANDROID) now contain a high performance HTML5 rendering and javascript engines, often based on the same open source WebKit origin of Blink and V8.   

In the past, version disparity made a framework like nodeAppKit impractic, but now it makes for very lean, fast loading modern apps, that are app-store compatible out of the box.

Check out the [/app](https://github.com/OwinJS/nodeAppKit/tree/master/app) folder or the [demo app](https://github.com/OwinJS/owinjs-demo) to see how to write an app.

### Screenshot
[![image](https://raw.githubusercontent.com/OwinJS/owinjs-demo/master/owinjs-demo.png)](https://github.com/OwinJS/owinjs-demo)

Write once, deploy anywhere: desktop, mobile: windows/RT/phone, OSX/iOS, linux, android, **AND tradititional node.js server/client browser**, all with the same code.  You no longer need to maintain separate server and client versions of modules, or package some with Browserify/Bower/Component.io and some with NPM.

Same application code on all these platforms without any conversion, compile switches etc.

Code in Javascript, with UI in HTML/CSS/javascript using your favorite template engine; Razor (JS) View Engine provided as preferred option, but we also enable space-pen as used by GitHub atom.   Coffeescript, Less, or whatever you want all will work. 

Continue to write your applications in server / browser paradigm, but both run embedded in same process on the device with no networking required;  access native functions (GPS, gyroscope, printing etc.) as available using a standards-based future proofed interface (OWIN/JS).

***EARLY PROOF OF CONCEPT ONLY***

Open source under Mozilla Public License.

### About


### License

Open source under Mozilla Public License 2.0.


### Author

nodeAppKit container framework hand-coded by OwinJS;  see frameworks above for respective authorship of the core components
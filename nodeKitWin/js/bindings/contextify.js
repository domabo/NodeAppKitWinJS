/*
 * Copyright 2014 Domabo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

function ContextifyScript(script,options) {
  options = options || {};

  var filename = options.filename || '<eval>';
  var displayErrors = options.displayErrors || false;

    try {
        this._script = document.createElement('script');
        this._script.type = 'text/javascript';
        this._script.appendChild(document.createTextNode(script));
       
    } catch (e) {
        if (displayErrors)
            console.log(e.message + " - " + filename);
    }
}

ContextifyScript.prototype.runInThisContext = function() {
    document.head.appendChild(this._script);
}

ContextifyScript.prototype.runInContext = function(context) {
    document.head.appendChild(this._script);
}

ContextifyScript.prototype.runInNewContext = function() {
    document.head.appendChild(this._script);
}

module.exports.isContext = function isContext(ctx) {
  return (global.obj = ctx);
}

module.exports.makeContext = function makeContext(ctx) {
    global.obj = new {};
    global.obj._hiddenContextify = ctx;
    return global.obj;
}

module.exports.ContextifyScript = ContextifyScript;

/*
 * Copyright 2014 Domabo; Portions Copyright 2014 Red Hat
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

console.log("ERROR: stat_watcher not yet implemented");

var util = require('util'),
    Handle = process.binding('handle_wrap').Handle;

function StatWatcher() {
  if (!(this instanceof StatWatcher)) return new StatWatcher();
  this._delegate = "TO DO: REGISTER DELEGATE";
  this._delegate.on('change', _onchange.bind(this));
  Handle.call( this, this._delegate );
}
util.inherits( StatWatcher, Handle );

StatWatcher.prototype.start = function (path, persistent, interval) {
    this._stat = "start";
    return new Error("Not Implemented");
};

StatWatcher.prototype.stop = function() {
    return new Error("Not Implemented");
};

function _onchange(result) {
  if (typeof this.onchange === 'function') {
    if (result.error) {
      return;
    }
    var stat = "new"
    this.onchange(stat, this._stat, -1);
    this._stat = stat;
  }
}

module.exports.StatWatcher = StatWatcher;

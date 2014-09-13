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

function HTTPParser() {
    this._parser = require('delegates/http_parser/http-parser.js').HTTPParser
    this._parser.onHeadersComplete = HTTPParser.prototype._onHeadersComplete.bind(this);
    this._parser.onBody = HTTPParser.prototype._onBody.bind(this);
    this._parser.OnMessageComplete = HTTPParser.prototype._onMessageComplete.bind(this);

    this.kOnHeaders = 0;
    this.kOnHeadersComplete = 1;
    this.kOnBody = 2;
    this.kOnMessageComplete = 3;

    this.REQUEST = 1;
    this.RESPONSE = 2;

    this.methods = this._parser.methods;
 }

HTTPParser.prototype._onHeadersComplete = function(result) {
  this.method          = result.method;
  this.url             = result.url;
  this.versionMajor = result.versionMajor;
  this.versionMinor = result.versionMinor;
  this.shouldKeepAlive = null;

  this.statusCode      = result.statusCode;
  this.statusMessage   = result.statusMsg;

  this.upgrade         = result.upgrade;

  this.headers = [];
  var jHeaders = result.headers;
  for ( var i = 0 ; i < jHeaders.length ; ++i ) {
    this.headers.push( jHeaders[i] );
  }

  return this[HTTPParser.kOnHeadersComplete].call(this, this);
}

HTTPParser.prototype._onBody = function(chunk, offset, length) {
  return this[HTTPParser.kOnBody].call(this, chunk, offset, length);
}

HTTPParser.prototype._onMessageComplete = function() {
  this._headers = [];
  this[HTTPParser.kOnMessageComplete].call(this);
}

HTTPParser.prototype.reinitialize = function(state) {
  delete this.method;
  delete this.url;
  delete this.versionMajor;
  delete this.versionMinor;
  delete this.headers;
  delete this.shouldKeepAlive;

  delete this.statusCode;
  delete this.statusMessage;

  delete this._headers;

  this._parser.reinitialize( state );
}

HTTPParser.prototype.execute = function(d) {
  return this._parser.execute( d, 0, d.length );
}

HTTPParser.prototype.finish = function() {
  this._parser.finish();
}

module.exports.HTTPParser = HTTPParser;
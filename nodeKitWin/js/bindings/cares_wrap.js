/*
 * Copyright 2014 Domabo;  Portions copyright 2014 Red Hat
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

console.log("ERROR: cares_wrap not yet implemented");

var util = require('util');

var cares = {};

cares.isIP = function(host) {
  if ( host.match( "^[0-9][0-9]?[0-9]?\\.[0-9][0-9]?[0-9]?\\.[0-9][0-9]?[0-9]?\\.[0-9][0-9]?[0-9]?$" ) ) {
    return 4;
  }

  return 0;
}

cares.getaddrinfo = function(req,name,family) {
    return new Error("Not Implemented");
}

cares.queryA = function(req,name) {
    return new Error("Not Implemented");
}

cares.queryAaaa = function(req,name) {
    return new Error("Not Implemented");
}

cares.queryMx = function(req,name) {
    return new Error("Not Implemented");
}

cares.queryTxt = function(req,name) {
    return new Error("Not Implemented");
}

cares.querySrv = function(req,name) {
    return new Error("Not Implemented");
}

cares.queryNs = function(req,name) {
    return new Error("Not Implemented");
}

cares.queryCname = function(req,name) {
    return new Error("Not Implemented");
}

cares.getHostByAddr = function(req,name) {
    return new Error("Not Implemented");
}

module.exports = cares;
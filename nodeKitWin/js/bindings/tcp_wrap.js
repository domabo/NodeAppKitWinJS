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

"use strict";

console.log("ERROR: tcp_wrap not yet implemented");

var util = require('util');
var Stream = process.binding('stream_wrap').Stream;

function TCP(tcp) {
    this._tcp = tcp;
  Stream.call( this, this._tcp );
}

util.inherits(TCP, Stream);

Object.defineProperty( TCP.prototype, '_fd', {
  get: function() {
    return this._tcp.fd;
  }
})

// ----------------------------------------
// Server
// ----------------------------------------
TCP.prototype._onConnection = function(result) {
    return new Error("Not Implemented");
}


// ----------------------------------------

TCP.prototype.getpeername = function(out) {
    return new Error("Not Implemented");
}

TCP.prototype.getsockname = function(out) {
    return new Error("Not Implemented");
}

TCP.prototype.bind6 = function(addr,port) {
  return new Error( "ipv6 not supported" );
}

TCP.prototype.bind = function(addr, port) {
    return new Error("Not Implemented");
}

TCP.prototype.listen = function(backlog) {
    return new Error("Not Implemented");
}

TCP.prototype.connect = function (req, addr, port) {
    var self = this;
    this._req = req;
    var clientSocket = new Windows.Networking.Sockets.StreamSocket();
    var remoteName = new Windows.Networking.HostName(addr);
    clientSocket.connectAsync(remoteName, port).then(function () {
        var status = 0;
        var handle = self;
        var readable = true;
        var writable = true;
        self._writer = new Windows.Storage.Streams.DataWriter(socketsSample.clientSocket.outputStream);
        self._writer.unicodeEncoding = Windows.Storage.Streams.UnicodeEncoding.utf8;
        self._writer.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian;
        self._reader = new Windows.Storage.Streams.DataReader(streamSocket.inputStream);
        self._reader.inputStreamOptions = 1;

        var oncomplete = self._req.oncomplete;
        delete this._req.oncomplete;
        oncomplete(status, handle, self._req, readable, writable);
    });
}

TCP.prototype.readStart = function () {
    this._stream.readStart();
};

TCP.prototype.readStop = function () {
    this._stream.readStop();
};

TCP.prototype.writeUtf8String = function (req, data) {
    this._writer.writeString(data);
    req.oncomplete(0, this, req );
};

TCP.prototype.writeAsciiString = function (req, data) {
    this._writer.writeString(data);
    req.oncomplete(0, this, req);
};

TCP.prototype.writeBuffer = function (req, data) {
    this._writer.writeBytes(data);
    req.oncomplete(0, this, req);
};

TCP.prototype.shutdown = function (req) {
    this._writer.close();
};

module.exports.TCP = TCP;

/*
 * Copyright (C) 2014 Domabo.   Portions Copyright Red Hat, Inc.
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

var getSource = io.nodekit.natives.sources.getNative;
var getSourceReplacement = io.nodekit.natives.sources.getNativeReplacement;

var source = {};

/* BUILT-IN UNMODIFIED NODE.JS SOURCES */
[   '_debugger.js',
	'_http_agent.js',
	'_http_client.js',
	'_http_common.js',
	'_http_incoming.js',
	'_http_outgoing.js',
	'_http_server.js',
	'_linklist.js',
	'_stream_duplex.js',
	'_stream_passthrough.js',
	'_stream_readable.js',
	'_stream_transform.js',
	'_stream_writable.js',
	'_tls_legacy.js',
	'_tls_wrap.js',
	'assert.js',
	/* 'buffer.js', ** SEE REPLACEMENT SECTION BELOW ** */
	'child_process.js',
	'cluster.js',
	'console.js',
	'constants.js',
	/* 'crypto.js', ** SEE REPLACEMENT SECTION BELOW ** */
	'dgram.js',
	/* 'dns.js', ** SEE REPLACEMENT SECTION BELOW ** */
	'domain.js',
	'events.js',
	'freelist.js',
	'fs.js',
	'http.js',
	'https.js',
	'module.js',
	'net.js',
	'os.js',
	'path.js',
	'punycode.js',
	'querystring.js',
	'readline.js',
	'repl.js',
	'smalloc.js',
	'stream.js',
	'string_decoder.js',
	'sys.js',
	'timers.js',
	'tls.js',
	'tty.js',
	'url.js',
	'util.js',
	'vm.js',
	'zlib.js'
   ].forEach( function(name) {
  source[name] = getSource(name);
   });

/* CUSTOM NODE.JS API REPLACEMENTS*/
[
	'buffer',
    'crypto',
    'native-dns'
].forEach(function (name) {
    source[name] = getSourceReplacement(name);
});

source.config = "{}";

module.exports = source;
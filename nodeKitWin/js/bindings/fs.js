/*
 * Copyright 2014 Domabo;  Portions Copyright 2014 Red Hat, Inc.
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

var util        = require('util'),
    StatWatcher = process.binding('stat_watcher').StatWatcher,
    statsCtor   = null;

// Executes work asynchronously if async is provided and is a function -
// otherwise, just executes the work and returns the result. If executing
// async and successful, the callback function is executed on the next tick.
// If there is an error and the throws param is false just returns the
// result.err property, otherwise throw it.
function executeWork(work, async, throws) {
  if (typeof async === 'function') { // Async
    blocking.submit(function() {
      var result = work();
      result = result || {};
      blocking.unblock(async)( result.err, result.result );
    });
  } else { // Sync
    var result = work();
    result = result || {};
    if (result.err) {
      if (throws) throw result.err;
      else return result.err;
    }
    return result.result;
  }
}

module.exports.FSInitialize = function (stats) {
  // fs.js uses this in "native" node.js to inform the C++ in
  // node_file.cc what JS function is used to construct an fs.Stat
  // object. For now, we'll just construct ours in JS and see how it goes.
  statsCtor = stats;
};

function buildStat(path, statf) {
  var err, stats,
      delegate = posix.allocateStat(),
      result = statf(delegate);

  if (result !== -1) {
    stats = new statsCtor(
      delegate.dev(),
      delegate.mode(),
      delegate.nlink(),
      delegate.uid(),
      delegate.gid(),
      delegate.rdev(),
      delegate.blockSize(),
      delegate.ino(),
      delegate.st_size(),
      delegate.blocks(),
      delegate.atime(),
      delegate.mtime(),
      delegate.ctime(),
      delegate.ctime() // TODO: I don't know what birthtim_msec should be
    );
  } else err = posixError(path, 'stat');
  return {err:err, result:stats};
}

module.exports.StatWatcher = StatWatcher;

module.exports.stat = function (path, callback) {
  function work() {
    return buildStat(path, function(stat) { return posix.stat(path, stat); });
  }
  return executeWork(work.bind(this), callback, true);
};

module.exports.lstat = function (path, callback) {
  function work() {
    return buildStat(path, function(stat) { return posix.lstat(path, stat); });
  }
  return executeWork(work.bind(this), callback, true);
};

/// <summary>
/// Asynchronous fstat(2). The callback gets two arguments (err, stats) where stats is a fs.Stats object. fstat() is identical to stat(), except that the file to be stat-ed is specified by the file descriptor JsNumber fd. 
/// </summary>
/// <param name="fd"></param>
/// <returns></returns>
module.exports.fstat = function (fd, callback) {
  function work() {
    return buildStat(fd, function(stat) { return posix.fstat(fd, stat); });
  }
  return executeWork(work.bind(this), callback, true);
};

/*
Asynchronous file open. See open(2). flags can be:

'r' - Open file for reading. An exception occurs if the file does not exist.
'r+' - Open file for reading and writing. An exception occurs if the file does not exist.
'rs' - Open file for reading in synchronous mode. Instructs the operating system to bypass the local file system cache.
This is primarily useful for opening files on NFS mounts as it allows you to skip the potentially stale local cache. It has a very real impact on I/O performance so don't use this flag unless you need it.

Note that this doesn't turn fs.open() into a synchronous blocking call. If that's what you want then you should be using fs.openSync()

'rs+' - Open file for reading and writing, telling the OS to open it synchronously. See notes for 'rs' about using this with caution.
'w' - Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
'wx' - Like 'w' but fails if path exists.
'w+' - Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
'wx+' - Like 'w+' but fails if path exists.
'a' - Open file for appending. The file is created if it does not exist.
'ax' - Like 'a' but fails if path exists.
'a+' - Open file for reading and appending. The file is created if it does not exist.
'ax+' - Like 'a+' but fails if path exists.
mode sets the file mode (permission and sticky bits), but only if the file was created. It defaults to 0666, readable and writeable.

The callback gets two arguments (err, fd).

The exclusive flag 'x' (O_EXCL flag in open(2)) ensures that path is newly created. On POSIX systems, path is considered to exist even if it is a symlink to a non-existent file. The exclusive flag may or may not work with network file systems.

On Linux, positional writes don't work when the file is opened in append mode. The kernel ignores the position argument and always appends the data to the end of the file.
*/
module.exports.open = function (path, flags, mode, callback) {
  function work() {
    var fd = posix.open(path, flags, mode), err;
    if (fd === -1) err = posixError(path, 'open');
    return {err:err, result:fd};
  }
  return executeWork(work.bind(this), callback, true);
};

module.exports.close = function (fd, callback) {
  function work() {
    if (fd === null || fd === undefined) {
      return {err: new Error("Don't know how to close null")};
    }
    var success = posix.close(fd), err;
    if (success === -1) err = posixError(null, 'close');
    return {err:err, result:undefined};
  }
  return executeWork(work.bind(this), callback);
};

module.exports.writeBuffer = function (fd, buffer, offset, length, position, callback) {
  function work() {
    // TODO: Error checking
    // e.g. https://github.com/joyent/node/blob/master/src/node_file.cc#L788-L795
    var toWrite = buffer.slice(offset, offset+length);
        var bytes   = toWrite._byteArray();
        var written = posix.write(fd, bytes, length), err;

    if (written === -1) err = posixError(path, 'write');
    return {err: err, result: written};
  }
  return executeWork(work.bind(this), callback);
};

module.exports.writeString = function (fd, str, position, enc, callback) {
  // TODO: Is this kosher?
  var buf = new Buffer(str, enc);
  return binding.writeBuffer(fd, buf, 0, buf.length, position, callback);
};

module.exports.mkdir = function (path, mode, callback) {
  function work() {
    var success = posix.mkdir(path, mode), err;
    if (success === -1) err = posixError(path, 'mkdir');
    return {err: err, result: success};
  }
  return executeWork(work.bind(this), callback);
};

module.exports.rmdir = function (path, callback) {
  function work() {
    var success = posix.rmdir(path), err;
    if (success === -1) err = posixError(path, 'rmdir');
    return {err: err, result: success};
  }
  return executeWork(work.bind(this), callback);
};

module.exports.rename = function (from, to, callback) {
  function work() {
    var fromFile = new File(from),
        toFile = new File(to), err;
    if (!fromFile.exists() || !fromFile.renameTo(toFile)) err = posixError(from, 'rename');
    return {err:err};
  }
  return executeWork(work.bind(this), callback);
};

module.exports.ftruncate = function (fd, len, callback) {
  function work() {
    var result = posix.ftruncate(fd, len), err;
    if (result === -1) {
      err = posixError(null, 'ftruncate');
    }
    return {err:err, result:result};
  }
  return executeWork(work.bind(this), callback);
};

//Reads the contents of a directory. The callback gets two arguments (err, files) where files is an array of the names of the files in the directory excluding '.' and '..'.
module.exports.readdir = function (path, callback) {
  function work() {
    var dir = new File( path ), err, files;
    if (!dir.isDirectory()) err = posixError(path, 'readdir');
    else files = dir.list();
    return {err:err, result:nodyn.arrayConverter(files)};
  }
  return executeWork(work.bind(this), callback);
};


// Read data from the file specified by fd.
// buffer is the buffer that the data will be written to.
// offset is the offset in the buffer to start writing at.
// length is an integer specifying the number of bytes to read.
// position is an integer specifying where to begin reading from in the file. 
// If position is null, data will be read from the current file position.
// The callback is given the three arguments, (err, bytesRead, buffer).
module.exports.read = function (fd, buffer, offset, length, position, callback) {
  var bytes;
  offset = offset || 0;
  // we can't use the executeWork function here because the read() callback
  // takes 3 parameters, and executeWork only works with cb(err, result)
  if (typeof callback === 'function') { // Async
    blocking.submit(function() {
      if ( position && position !== -1 ) {
        bytes = Fs.pread(posix, fd, buffer._nettyBuffer(), offset, length, position);
      } else {
        bytes = Fs.read(posix, fd, buffer._nettyBuffer(), offset, length);
      }
      blocking.unblock(function() {
        callback(undefined, bytes, buffer);
      })();
    }.bind(this));
  } else { // Sync
    if ( position && position !== -1 ) {
      bytes = Fs.pread(posix, fd, buffer._nettyBuffer(), offset, length, position);
    } else {
      bytes = Fs.read(posix, fd, buffer._nettyBuffer(), offset, length);
    }
    if (bytes === -1) throw posixError(fd, 'read');
    return bytes;
  }
};

//make a new name for a file
module.exports.link = function (srcpath, dstpath, callback) {
    return executeWork(function () {
        return new Error("Not Implemented");
    }.bind(this), callback);
};

//make a new name for a file
module.exports.symlink = function (srcpath, dstpath, type, callback) {
    return executeWork(function () {
        return new Error("Not Implemented");
    }.bind(this), callback);
};

// read value of a symbolic link
module.exports.readlink = function (path, callback) {
    return executeWork(function () {
        return new Error("Not Implemented");
    }.bind(this), callback);
};

// delete a name and possibly the file it refers to
module.exports.unlink = function (path, callback) {
    return executeWork(function () {
        return new Error("Not Implemented");
    }.bind(this), callback);
};

module.exports.chmod = function (path, mode, callback) {
    return executeWork(function () {
        return new Error("Not Implemented");
    }.bind(this), callback);
};

//change permissions of a file
module.exports.fchmod = function (fd, mode, callback) {
    return executeWork(function () {
        return new Error("Not Implemented");
    }.bind(this), callback);
};

//change ownership of a file
module.exports.chown = function (path, uid, gid, callback) {
    return executeWork(function () {
        return new Error("Not Implemented");
    }.bind(this), callback);
};

//change ownership of a file
module.exports.fchown = function (fd, uid, gid, callback) {
  return executeWork(function() {
      return new Error("Not Implemented");
  }.bind(this), callback);
};

//Change file timestamps of the file referenced by the supplied path.
module.exports.utimes = function (path, atime, mtime, callback) {
  return executeWork(function() {
      return new Error("Not Implemented");
  }.bind(this), callback);
};

//Change the file timestamps of a file referenced by the supplied file descriptor.
module.exports.futimes = function (fd, atime, mtime, callback) {
  return executeWork(function() {
      return new Error("Not Implemented");
  }.bind(this), callback);
};

//synchronize a file's in-core state with storage device
module.exports.fsync = function (fd) {
  return executeWork(function() {
      return new Error("Not Implemented");
  });
};

//synchronize a file's in-core state with storage device
module.exports.fdatasync = function (fd) {
   return executeWork(function() {
      return new Error("Not Implemented");
  });
};

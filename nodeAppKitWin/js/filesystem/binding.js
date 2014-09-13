var path = require('path');

var File = require('./file');
var FileDescriptor = require('./descriptor');
var Directory = require('./directory');
var SymbolicLink = require('./symlink');
var FSError = require('./error');

var constants = process.binding('constants');


/**
 * Call the provided function and either return the result or call the callback
 * with it (depending on if a callback is provided).
 * @param {function()} callback Optional callback.
 * @param {Object} thisArg This argument for the following function.
 * @param {function()} func Function to call.
 * @return {*} Return (if callback is not provided).
 */
function maybeCallback(callback, thisArg, func) {
  if (callback) {
    var err = null;
    var val;
    try {
      val = func.call(thisArg);
    } catch (e) {
      err = e;
    }
    process.nextTick(function() {
      if (val === undefined) {
        callback(err);
      } else {
        callback(err, val);
      }
    });
  } else {
    return func.call(thisArg);
  }
}


function notImplemented() {
  throw new Error('Method not implemented');
}

/**
 * Create a new stats object.
 * @param {Object} config Stats properties.
 * @constructor
 */
function Stats(config) {
  for (var key in config) {
    this[key] = config[key];
  }
}


/**
 * Check if mode indicates property.
 * @param {number} property Property to check.
 * @return {boolean} Property matches mode.
 */
Stats.prototype._checkModeProperty = function(property) {
  return ((this.mode & constants.S_IFMT) === property);
};


/**
 * @return {Boolean} Is a directory.
 */
Stats.prototype.isDirectory = function() {
  return this._checkModeProperty(constants.S_IFDIR);
};


/**
 * @return {Boolean} Is a regular file.
 */
Stats.prototype.isFile = function() {
  return this._checkModeProperty(constants.S_IFREG);
};


/**
 * @return {Boolean} Is a block device.
 */
Stats.prototype.isBlockDevice = function() {
  return this._checkModeProperty(constants.S_IFBLK);
};


/**
 * @return {Boolean} Is a character device.
 */
Stats.prototype.isCharacterDevice = function() {
  return this._checkModeProperty(constants.S_IFCHR);
};


/**
 * @return {Boolean} Is a symbolic link.
 */
Stats.prototype.isSymbolicLink = function() {
  return this._checkModeProperty(constants.S_IFLNK);
};


/**
 * @return {Boolean} Is a named pipe.
 */
Stats.prototype.isFIFO = function() {
  return this._checkModeProperty(constants.S_IFIFO);
};


/**
 * @return {Boolean} Is a socket.
 */
Stats.prototype.isSocket = function() {
  return this._checkModeProperty(constants.S_IFSOCK);
};



/**
 * Create a new binding with the given file system.
 * @param {FileSystem} system Mock file system.
 * @constructor
 */
function Binding(system) {

  /**
   * Mock file system.
   * @type {FileSystem}
   */
  this._system = system;

  /**
   * Stats constructor.
   * @type {function}
   */
  this.Stats = Stats;

  /**
   * Lookup of open files.
   * @type {Object.<number, FileDescriptor>}
   */
  this._openFiles = {};

  /**
   * Counter for file descriptors.
   * @type {number}
   */
  this._counter = 0;

}

/**
 * Call the provided function and either return the result or call the callback
 * with it (depending on if a callback is provided).
 * @param {function()} callback Optional callback.
 * @param {Object} thisArg This argument for the following function.
 * @param {function()} func Function to call.
 * @return {*} Return (if callback is not provided).
 */
Binding.prototype.maybeCallbackPromise = function(callback, thisArg, func) {
    if (callback) {
        func.call(thisArg).then(function (val) {
            callback(null, val);
        }, function (e) { callback(e); });
    } else {
        return this._system.toSync(func.call(thisArg));
    }
}

/**
 * Get the file system underlying this binding.
 * @return {FileSystem} The underlying file system.
 */
Binding.prototype.getSystem = function() {
  return this._system;
};


/**
 * Reset the file system underlying this binding.
 * @param {FileSystem} system The new file system.
 */
Binding.prototype.setSystem = function(system) {
  this._system = system;
};


/**
 * Get a file descriptor.
 * @param {number} fd File descriptor identifier.
 * @return {FileDescriptor} File descriptor.
 */
Binding.prototype._getDescriptorById = function(fd) {
  if (!this._openFiles.hasOwnProperty(fd)) {
    throw new FSError('EBADF');
  }
  return this._openFiles[fd];
};


/**
 * Keep track of a file descriptor as open.
 * @param {FileDescriptor} descriptor The file descriptor.
 * @return {number} Identifier for file descriptor.
 */
Binding.prototype._trackDescriptor = function(descriptor) {
  var fd = ++this._counter;
  this._openFiles[fd] = descriptor;
  return fd;
};


/**
 * Stop tracking a file descriptor as open.
 * @param {number} fd Identifier for file descriptor.
 */
Binding.prototype._untrackDescriptorById = function(fd) {
  if (!this._openFiles.hasOwnProperty(fd)) {
    throw new FSError('EBADF');
  }
  delete this._openFiles[fd];
};


/**
 * Stat an item.
 * @param {string} filepath Path.
 * @param {function(Error, Stats)} callback Callback (optional).
 * @return {Stats|undefined} Stats or undefined (if sync).
 */
Binding.prototype.stat = function (filepath, callback) {
    return this.maybeCallbackPromise(callback, this, function () {
        return this._system.getItem(filepath).then(function (item) {
            if (!item) {
                throw new FSError('ENOENT', filepath);
            }
            return new Stats(item.getStats());
        });
    });
};

/**
 * Stat an item.
 * @param {number} fd File descriptor.
 * @param {function(Error, Stats)} callback Callback (optional).
 * @return {Stats|undefined} Stats or undefined (if sync).
 */
Binding.prototype.fstat = function (fd, callback) {
   return maybeCallback(callback, this, function() {
      var descriptor = this._getDescriptorById(fd);
      var item = descriptor.getItem();
      return new Stats(item.getStats());
  });
};

/**
 * Close a file descriptor.
 * @param {number} fd File descriptor.
 * @param {function(Error)} callback Callback (optional).
 */
Binding.prototype.close = function(fd, callback) {
  maybeCallback(callback, this, function() {
    this._untrackDescriptorById(fd);
  });
};


/**
 * Open and possibly create a file.
 * @param {string} pathname File path.
 * @param {number} flags Flags.
 * @param {number} mode Mode.
 * @param {function(Error, string)} callback Callback (optional).
 * @return {string} File descriptor (if sync).
 */
Binding.prototype.open = function(pathname, flags, mode, callback) {
    return this.maybeCallbackPromise(callback, this, function () {
        var descriptor = new FileDescriptor(flags);
        return this._system.getItem(filepath).then(function (item) {
            if (descriptor.isRead()) {
                if (!item) {
                    throw new FSError('ENOENT', pathname);
                }
                if (!item.canRead()) {
                    throw new FSError('EACCES', pathname);
                }
            }
            descriptor.setItem(item);
            return this._trackDescriptor(descriptor);
        });
    });
};

/**
 * Read from a file descriptor.
 * @param {string} fd File descriptor.
 * @param {Buffer} buffer Buffer that the contents will be written to.
 * @param {number} offset Offset in the buffer to start writing to.
 * @param {number} length Number of bytes to read.
 * @param {?number} position Where to begin reading in the file.  If null,
 *     data will be read from the current file position.
 * @param {function(Error, number, Buffer)} callback Callback (optional) called
 *     with any error, number of bytes read, and the buffer.
 * @return {number} Number of bytes read (if sync).
 */
Binding.prototype.read = function(fd, buffer, offset, length, position,
    callback) {
  return maybeCallback(callback, this, function() {
    var descriptor = this._getDescriptorById(fd);
    if (!descriptor.isRead()) {
      throw new FSError('EBADF');
    }
    var file = descriptor.getItem();
    if (!(file instanceof File)) {
      // deleted or not a regular file
      throw new FSError('EBADF');
    }
    if (typeof position !== 'number' || position < 0) {
      position = descriptor.getPosition();
    }
    var content = file.getContent();
    var start = Math.min(position, content.length);
    var end = Math.min(position + length, content.length);
    var read = (start < end) ? content.copy(buffer, offset, start, end) : 0;
    descriptor.setPosition(position + read);
    return read;
  });
};


/**
 * Write to a file descriptor given a buffer.
 * @param {string} fd File descriptor.
 * @param {Buffer} buffer Buffer with contents to write.
 * @param {number} offset Offset in the buffer to start writing from.
 * @param {number} length Number of bytes to write.
 * @param {?number} position Where to begin writing in the file.  If null,
 *     data will be written to the current file position.
 * @param {function(Error, number, Buffer)} callback Callback (optional) called
 *     with any error, number of bytes written, and the buffer.
 * @return {number} Number of bytes written (if sync).
 */
Binding.prototype.writeBuffer = function(fd, buffer, offset, length, position,
    callback) {
  return maybeCallback(callback, this, function() {
      return notImplemented();
  });
};

/**
 * Alias for writeBuffer (used in Node <= 0.10).
 * @param {string} fd File descriptor.
 * @param {Buffer} buffer Buffer with contents to write.
 * @param {number} offset Offset in the buffer to start writing from.
 * @param {number} length Number of bytes to write.
 * @param {?number} position Where to begin writing in the file.  If null,
 *     data will be written to the current file position.
 * @param {function(Error, number, Buffer)} callback Callback (optional) called
 *     with any error, number of bytes written, and the buffer.
 * @return {number} Number of bytes written (if sync).
 */
Binding.prototype.write = Binding.prototype.writeBuffer;


/**
 * Write to a file descriptor given a string.
 * @param {string} fd File descriptor.
 * @param {string} string String with contents to write.
 * @param {number} position Where to begin writing in the file.  If null,
 *     data will be written to the current file position.
 * @param {string} encoding String encoding.
 * @param {function(Error, number, string)} callback Callback (optional) called
 *     with any error, number of bytes written, and the string.
 * @return {number} Number of bytes written (if sync).
 */
Binding.prototype.writeString = function(fd, string, position, encoding,
    callback) {
    return maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Rename a file.
 * @param {string} oldPath Old pathname.
 * @param {string} newPath New pathname.
 * @param {function(Error)} callback Callback (optional).
 * @return {undefined}
 */
Binding.prototype.rename = function(oldPath, newPath, callback) {
    return maybeCallback(callback, this, function () {
        return notImplemented();
    });
};

/**
 * Read a directory.
 * @param {string} dirpath Path to directory.
 * @param {function(Error, Array.<string>)} callback Callback (optional) called
 *     with any error or array of items in the directory.
 * @return {Array.<string>} Array of items in directory (if sync).
 */
Binding.prototype.readdir = function(dirpath, callback) {
  return this.maybeCallbackPromise(callback, this, function () {
      return this._system.getDirList(filepath);
      });
};

/**
 * Create a directory.
 * @param {string} pathname Path to new directory.
 * @param {number} mode Permissions.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.mkdir = function(pathname, mode, callback) {
     maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Remove a directory.
 * @param {string} pathname Path to directory.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.rmdir = function(pathname, callback) {
     maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Truncate a file.
 * @param {number} fd File descriptor.
 * @param {number} len Number of bytes.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.ftruncate = function(fd, len, callback) {
     maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Legacy support.
 * @param {number} fd File descriptor.
 * @param {number} len Number of bytes.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.truncate = Binding.prototype.ftruncate;


/**
 * Change user and group owner.
 * @param {string} pathname Path.
 * @param {number} uid User id.
 * @param {number} gid Group id.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.chown = function(pathname, uid, gid, callback) {
    return maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Change user and group owner.
 * @param {number} fd File descriptor.
 * @param {number} uid User id.
 * @param {number} gid Group id.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.fchown = function(fd, uid, gid, callback) {
    return maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Change permissions.
 * @param {string} pathname Path.
 * @param {number} mode Mode.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.chmod = function(pathname, mode, callback) {
     maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Change permissions.
 * @param {number} fd File descriptor.
 * @param {number} mode Mode.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.fchmod = function(fd, mode, callback) {
     maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Delete a named item.
 * @param {string} pathname Path to item.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.unlink = function(pathname, callback) {
     maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Update timestamps.
 * @param {string} pathname Path to item.
 * @param {number} atime Access time (in seconds).
 * @param {number} mtime Modification time (in seconds).
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.utimes = function(pathname, atime, mtime, callback) {
    return maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Update timestamps.
 * @param {number} fd File descriptor.
 * @param {number} atime Access time (in seconds).
 * @param {number} mtime Modification time (in seconds).
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.futimes = function(fd, atime, mtime, callback) {
     maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Synchronize in-core state with storage device.
 * @param {number} fd File descriptor.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.fsync = function(fd, callback) {
     maybeCallback(callback, this, function () {
        //ignore
    });
};


/**
 * Synchronize in-core metadata state with storage device.
 * @param {number} fd File descriptor.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.fdatasync = function(fd, callback) {
    maybeCallback(callback, this, function () {
        //ignore
    });
};


/**
 * Create a hard link.
 * @param {string} srcPath The existing file.
 * @param {string} destPath The new link to create.
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.link = function(srcPath, destPath, callback) {
    maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Create a symbolic link.
 * @param {string} srcPath Path from link to the source file.
 * @param {string} destPath Path for the generated link.
 * @param {string} type Ignored (used for Windows only).
 * @param {function(Error)} callback Optional callback.
 */
Binding.prototype.symlink = function(srcPath, destPath, type, callback) {
    maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Read the contents of a symbolic link.
 * @param {string} pathname Path to symbolic link.
 * @param {function(Error, string)} callback Optional callback.
 * @return {string} Symbolic link contents (path to source).
 */
Binding.prototype.readlink = function(pathname, callback) {
    maybeCallback(callback, this, function () {
        return notImplemented();
    });
};


/**
 * Stat an item.
 * @param {string} filepath Path.
 * @param {function(Error, Stats)} callback Callback (optional).
 * @return {Stats|undefined} Stats or undefined (if sync).
 */
Binding.prototype.lstat = function(filepath, callback) {
  return this.maybeCallbackPromise(callback, this, function () {
      return this._system.getItem(filepath).then(function (item) {
          if (!item) {
              throw new FSError('ENOENT', filepath);
          }
          return new Stats(item.getStats());
      });
  });
};


/**
 * Not yet implemented.
 * @type {function()}
 */
Binding.prototype.StatWatcher = notImplemented;


/**
 * Export the binding constructor.
 * @type {function()}
 */
exports = module.exports = Binding;

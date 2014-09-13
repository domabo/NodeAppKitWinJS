var os = require('os');
var path = require('path');

var Directory = require('./directory');
var File = require('./file');
var FSError = require('./error');
var SymbolicLink = require('./symlink');

var isWindows = process.platform === 'win32';

function getPathParts(filepath) {
  var parts = path._makeLong(path.resolve(filepath)).split(path.sep);
  parts.shift();
  if (isWindows) {
    // parts currently looks like ['', '?', 'c:', ...]
    parts.shift();
    var q = parts.shift(); // should be '?'
    var base = '\\\\' + q + '\\' + parts.shift().toLowerCase();
    parts.unshift(base);
  }
  if (parts[parts.length - 1] === '') {
    parts.pop();
  }
  return parts;
}

/**
 * Create a new file system for WinRT bridge
 * @constructor
 */
function FileSystemWinRT() {

    var root = Windows.ApplicationModel.Package.Current.InstalledLocation;

  /**
   * Root directory.
   * @type {StorageFolder}
   */
  this._root = root;

}

FileSystemWinRT.prototype.toSync = function (promise) {
    return io.nodekit.natives.util.toSync(promise);
}

/**
 * Get a file system item.
 * @param {string} filepath Path to item.
 * @return {Promise<Item>} The item (or null if not found).
 */
FileSystemWinRT.prototype.getItem = function (filepath) {

    var stat = {};

    return _root.GetFolderAsync(System.IO.Path.GetDirectoryName(filepath))
        .then(function (pathFolder) {
            return pathFolder.TryGetItemAsync(System.IO.Path.GetFileName(filepath));
        })
    .then(function (storageItem) {
        if (item !== null) {
            stat.birthtime = storageItem.DateCreated;
            if (item.isOfType(Windows.Storage.StorageItemTypes.folder)
            {
                stat.size = 0;
                stat.mode = 0777;
                stat._isFolder = true;
                stat._isFile = false;
            }
            else    
            {
                stat.mode = 0666;
                stat._isFolder = false;
                stat._isFile = true;
            }
            return storageItem.GetBasicPropertiesAsync();
        }
        else
            throw new FSError('ENOENT');
    })
    .then(function (properties) {
        stat.mtime = properties.DateModified;
        stat.atime = stat.mtime;
        stat.ctime = stat.mtime;
        stat.uid = 0;
        stat.gid = 0;
        if (stat._isFile)
        {
            stat.size = properties.size;
            return new FileSystemWinRT.file(stat);
        }
        else
        {
            stat.size = properties.size;
            return new FileSystemWinRT.directory(stat);
        }
    });
};

/**
 * Get directory listing
 * @param {string} filepath Path to directory.
 * @return {Promise<[]>} The array of item names (or error if not found or not a directory).
 */
FileSystemWinRT.prototype.getDirList = function (filepath) {
    
    return _root.TryGetItemAsync(filepath)
        .then(function (storageItem) {
        if (item !== null) {
            if (item.isOfType(Windows.Storage.StorageItemTypes.folder))
            {
                return pathFolder.GetFilesAsync();
            }
            else    
            {
                throw new FSError('ENOTDIR');
            }
        }
        else
            throw new FSError('ENOENT');
    })
     .then(function (PathFiles) {
         var result = [];
         pathFiles.forEach(function (file) {
             result.push(file.Name);
         });
         return result;
     });
};


/**
 * Get a file system item.
 * @param {string} filepath Path to item.
 * @return {Promise<Item>} The item (or null if not found).
 */
FileSystemWinRT.prototype.getItemDirectory = function (filepath) {

    var stat = {};

    return _root.GetFolderAsync(filepath)
      .then(function (winRTfolder) {
          stat.ctime = winRTfolder.DateCreated.getTime() / 1000;
          return winRTfolder.GetBasicPropertiesAsync();
    })
    .then(function (properties) {
        stat.mtime = properties.DateModified.getTime() / 1000;
        stat.atime = stat.mtime;
        stat.size = 0;
        stat.mode = 0777;
        stat.uid = 0;
        stat.gid = 0;
        var item = new FileSystemWinRT.directory(stat);
        return item;
    });
};


/**
 * Generate a factory for new files.
 * @param {Object} config File config.
 * @return {function():File} Factory that creates a new file.
 */
FileSystemWinRT.file = function (config) {
  config = config || {};
  return function() {
    var file = new File();
    if (config.hasOwnProperty('content')) {
      file.setContent(config.content);
    }
    if (config.hasOwnProperty('mode')) {
      file.setMode(config.mode);
    } else {
      file.setMode(0666);
    }
    if (config.hasOwnProperty('uid')) {
      file.setUid(config.uid);
    }
    if (config.hasOwnProperty('gid')) {
      file.setGid(config.gid);
    }
    if (config.hasOwnProperty('atime')) {
      file.setATime(config.atime);
    }
    if (config.hasOwnProperty('ctime')) {
      file.setCTime(config.ctime);
    }
    if (config.hasOwnProperty('mtime')) {
      file.setMTime(config.mtime);
    }
    return file;
  };
};


/**
 * Generate a factory for new symbolic links.
 * @param {Object} config File config.
 * @return {function():File} Factory that creates a new symbolic link.
 */
FileSystemWinRT.symlink = function (config) {
  config = config || {};
  return function() {
    var link = new SymbolicLink();
    if (config.hasOwnProperty('mode')) {
      link.setMode(config.mode);
    } else {
      link.setMode(0666);
    }
    if (config.hasOwnProperty('uid')) {
      link.setUid(config.uid);
    }
    if (config.hasOwnProperty('gid')) {
      link.setGid(config.gid);
    }
    if (config.hasOwnProperty('path')) {
      link.setPath(config.path);
    } else {
      throw new Error('Missing "path" property');
    }
    if (config.hasOwnProperty('atime')) {
      link.setATime(config.atime);
    }
    if (config.hasOwnProperty('ctime')) {
      link.setCTime(config.ctime);
    }
    if (config.hasOwnProperty('mtime')) {
      link.setMTime(config.mtime);
    }
    return link;
  };
};


/**
 * Generate a factory for new directories.
 * @param {Object} config File config.
 * @return {function():Directory} Factory that creates a new directory.
 */
FileSystemWinRT.directory = function (config) {
  config = config || {};
  return function() {
    var dir = new Directory();
    if (config.hasOwnProperty('mode')) {
      dir.setMode(config.mode);
    }
    if (config.hasOwnProperty('uid')) {
      dir.setUid(config.uid);
    }
    if (config.hasOwnProperty('gid')) {
      dir.setGid(config.gid);
    }
    if (config.hasOwnProperty('atime')) {
      dir.setATime(config.atime);
    }
    if (config.hasOwnProperty('ctime')) {
      dir.setCTime(config.ctime);
    }
    if (config.hasOwnProperty('mtime')) {
      dir.setMTime(config.mtime);
    }
    return dir;
  };
};


/**
 * Module exports.
 * @type {function}
 */
module.exports = FileSystemWinRT;

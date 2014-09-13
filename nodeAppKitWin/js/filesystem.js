 /*
 * Copyright 2014 Domabo.  
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

/// <summary>
/// Asynchronous readdir(3). Reads the contents of a directory. 
/// The callback gets two arguments (err, files) where files is an array of the names of the files in the directory excluding '.' and '..'.
/// </summary>
/// <param name="path"></param>
/// <param name="callback"></param>
/// <returns></returns>
module.exports.readdir = function readdir(path) {
    var installedLocationFolder = Windows.ApplicationModel.Package.Current.InstalledLocation;
    return installedLocationFolder.GetFolderAsync(System.IO.Path.GetDirectoryName(path))
        .then(function (pathFolder) {
            return pathFolder.GetFilesAsync();
        })
        .then(function (PathFiles) {
            var result = [];
            pathFiles.forEach(function (file) {
                result.push(file.Name);
            });
            return result;
        });
}

/// <summary>
/// Asynchronous file open.
/// </summary>
/// <param name="path"></param>
/// <param name="flags">flags can be:
/// <list type="bullet">
/// <item>'r' - Open file for reading. An exception occurs if the file does not exist.</item>
/// <item>'r+' - Open file for reading and writing. An exception occurs if the file does not exist.</item>
/// <item>'rs' - Open file for reading in synchronous mode. Instructs the operating system to bypass the local file system cache.</item>
/// <item>'rs+' - Open file for reading and writing, telling the OS to open it synchronously. See notes for 'rs' about using this with caution.</item>
/// <item> 'w' - Open file for writing. The file is created (if it does not exist) or truncated (if it exists).</item>
/// <item> 'wx' - Like 'w' but opens the file in exclusive mode.</item>
/// <item> 'w+' - Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).</item>
/// <item> 'wx+' - Like 'w+' but opens the file in exclusive mode.</item>
/// <item> 'a' - Open file for appending. The file is created if it does not exist.</item>
/// <item> 'ax' - Like 'a' but opens the file in exclusive mode.</item>
/// <item> 'a+' - Open file for reading and appending. The file is created if it does not exist.</item>
/// <item> 'ax+' - Like 'a+' but opens the file in exclusive mode.</item>
/// <item> mode defaults to 0666. The callback gets two arguments (err, fd).</item>
/// <param name="mode"></param>
/// <param name="callback"></param>
/// <returns></returns>
module.exports.open = function (path, flags, mode) {

    if (!((flags =="r") || (flags == "rs")))
        throw new Error("only file read operations are implemented");
  
    var installedLocationFolder = Windows.ApplicationModel.Package.Current.InstalledLocation;

    return installedLocationFolder.GetFolderAsync(System.IO.Path.GetDirectoryName(path))
        .then(function (pathFolder) {
            return pathFolder.GetFileAsync(System.IO.Path.GetFileName(path));
        })
    .then(function (file) {
        return file.OpenSequentialReadAsync();
    });
}

module.exports.open = function (path, flags, mode) {

    if (!((flags == "r") || (flags == "rs")))
        throw new Error("only file read operations are implemented");

    var installedLocationFolder = Windows.ApplicationModel.Package.Current.InstalledLocation;

    return installedLocationFolder.GetFolderAsync(System.IO.Path.GetDirectoryName(path))
        .then(function (pathFolder) {
            return pathFolder.GetFileAsync(System.IO.Path.GetFileName(path));
        })
    .then(function (file) {
        return file.OpenSequentialReadAsync();
    });
}

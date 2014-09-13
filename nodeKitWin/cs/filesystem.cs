using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using Windows.Storage;
using Windows.Storage.Streams;
using Windows.ApplicationModel.Resources;
using System.IO;

namespace io.nodekit.filesystem
{
    public sealed class fs
    {
       public async static Task<IList<string>> readdir(string path)
       {
           var installedLocationFolder = Windows.ApplicationModel.Package.Current.InstalledLocation;
           StorageFolder pathFolder = await installedLocationFolder.GetFolderAsync(System.IO.Path.GetDirectoryName(path));
           foreach (var x in await pathFolder.GetFilesAsync())
           {
               var result = new List<string>();
               result.Add(x.Name);
           }
           return result;
       }

       public async static Task<IInputStream> open(string path)
       {
            var installedLocationFolder = Windows.ApplicationModel.Package.Current.InstalledLocation;

           StorageFolder pathFolder = await installedLocationFolder.GetFolderAsync(System.IO.Path.GetDirectoryName(path));
           StorageFile file = await pathFolder.GetFileAsync(System.IO.Path.GetFileName(path));
           IInputStream stream = await file.OpenSequentialReadAsync();
           return stream;
       }

       public async static Task<Stat> getItem(string path)
       {
           var installedLocationFolder = Windows.ApplicationModel.Package.Current.InstalledLocation;

           StorageFolder pathFolder = await installedLocationFolder.GetFolderAsync(System.IO.Path.GetDirectoryName(path));

           IStorageItem item = await pathFolder.TryGetItemAsync(System.IO.Path.GetFileName(path));
           if (item != null)
           {
               if (item.IsOfType(StorageItemTypes.File))
               {
                   StorageFile file = (StorageFile)item;
                   Windows.Storage.FileProperties.BasicProperties properties = await file.GetBasicPropertiesAsync();
                   Stat stat = new Stat();

                   stat.ctime = ConvertToUnixTimestamp(file.DateCreated.DateTime);
                   stat.mtime = ConvertToUnixTimestamp(properties.DateModified.DateTime);
                   stat.atime = stat.mtime;
                   stat.size = properties.Size;
                   return stat;
               }
               else
               {
                   StorageFolder folder = (StorageFolder)item;
                   Windows.Storage.FileProperties.BasicProperties properties = await folder.GetBasicPropertiesAsync();
                   Stat stat = new Stat();

                   stat.ctime = ConvertToUnixTimestamp(folder.DateCreated.DateTime);
                   stat.mtime = ConvertToUnixTimestamp(properties.DateModified.DateTime);
                   stat.atime = stat.mtime;
                   stat.size = 0;
                   return stat;
               }
           }

         }

       public async static Task<Stat> getFolderStat(string path)
       {
           var installedLocationFolder = Windows.ApplicationModel.Package.Current.InstalledLocation;

          
       }


       public static ulong ConvertToUnixTimestamp(DateTime date)
       {
           DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0);
           TimeSpan diff = date.ToUniversalTime() - origin;
           return (ulong)Math.Floor(diff.TotalSeconds);
       }
    }

    struct Stat
    {
        public ulong dev;
        uint offset1;
        public uint ino;
        public uint mode;
        public uint nlink;
        public uint uid;
        public uint gid;
        public ulong rdev;
        uint offset2;
        public ulong size;
        uint offset3;
        public int blksize;
        public int blkcnt;
        uint offset4;
        public ulong atime;
        public ulong mtime;
        public ulong ctime;

    }

    public sealed class sources
    {
        public static string getNative(string id)
        {
            Task<string> t = requireAsync(id + ".js", "lib");
            t.Wait();
            return t.Result;
        }

        public static string getJS(string id)
        {
            var t= requireAsync(id + ".js", "js");
            t.Wait();
            return t.Result;
        }

        public static string getBinding(string id)
        {
            var t= requireAsync(id + ".js", "js/binding");
            t.Wait();
            return t.Result;
        }

        private static async Task<string> requireAsync(string filename, string dirname)
        {
            var fs = await Windows.Storage.StorageFile.GetFileFromApplicationUriAsync(new Uri("ms-appx:///nodekit/" + dirname + "/" + filename));
           return await  Windows.Storage.FileIO.ReadTextAsync(fs);
        }
    }

}

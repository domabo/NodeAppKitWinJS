using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using Windows.Storage;
using Windows.Storage.Streams;
using Windows.ApplicationModel.Resources;

namespace nodeAppKitLib
{
    public sealed class console
    {
        public static void log(string text)
        {
            Debug.WriteLine(text);
        }
    }

    public sealed class natives
    {
        public static Windows.Foundation.IAsyncOperation<string> require(string path)
        {

            return requireAsync(path).AsAsyncOperation<string>();

        }

            private static async Task<string> requireAsync(string path)
        {

            //        var url = new Uri("ms-appx:///nodeAppKitLib/lib/" + path);

        //    var url = new Uri("ms-appx:///js/" + path);

            var file = await Windows.Storage.StorageFile.GetFileFromApplicationUriAsync(new Uri("ms-appx:///nodeAppKitLib/lib/" + path));
           return await  Windows.Storage.FileIO.ReadTextAsync(file);

        }
    }

}

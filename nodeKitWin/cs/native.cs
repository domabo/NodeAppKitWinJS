using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using Windows.Storage;
using Windows.Storage.Streams;
using Windows.ApplicationModel.Resources;
using Windows.Foundation;

namespace io.nodekit.natives
{
    public sealed class console
    {
        public static void log(string text)
        {
            Debug.WriteLine(text);
         
        }
    }

    public sealed class util
    {
        public static Object toSync(IAsyncOperation<Object> promise)
        {
            var d = promise.AsTask<Object>().ConfigureAwait(false);
            Object content = d.GetAwaiter().GetResult();
            return content;
        }
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

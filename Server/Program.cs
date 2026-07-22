using System.Net;
using System.Text;

namespace DungeonServer;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("==================================================");
        Console.WriteLine("🎮 DUNGEON RAMPAGE - SERVIDOR C# MULTIJUGADOR 🎮");
        Console.WriteLine("==================================================");

        var listener = new HttpListener();
        var port = 5000;
        var prefix = $"http://localhost:{port}/";
        listener.Prefixes.Add(prefix);

        try
        {
            listener.Start();
            Console.WriteLine($"[🚀] Servidor HTTP + WebSockets activo en {prefix}");
            Console.WriteLine($"[🌐] ABRE EN TU NAVEGADOR: http://localhost:{port}/");
            Console.WriteLine("==================================================");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[❌] Error iniciando el servidor en {prefix}: {ex.Message}");
            return;
        }

        var room = new GameRoom();
        room.StartGameLoop();

        // Directorio raíz donde están los archivos del juego (un nivel arriba de Server/)
        var baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));

        while (true)
        {
            try
            {
                var context = await listener.GetContextAsync();
                
                if (context.Request.IsWebSocketRequest)
                {
                    var wsContext = await context.AcceptWebSocketAsync(subProtocol: null);
                    _ = room.AddClientAsync(wsContext.WebSocket);
                }
                else
                {
                    _ = Task.Run(() => ServeStaticFile(context, baseDir));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[!] Error aceptando cliente: {ex.Message}");
            }
        }
    }

    private static void ServeStaticFile(HttpListenerContext context, string baseDir)
    {
        try
        {
            var rawPath = context.Request.Url?.AbsolutePath ?? "/";
            if (rawPath == "/") rawPath = "/index.html";

            // Eliminar query params si los hay
            var cleanPath = rawPath.Split('?')[0].TrimStart('/');
            var filePath = Path.Combine(baseDir, cleanPath);

            context.Response.Headers.Add("Access-Control-Allow-Origin", "*");

            if (File.Exists(filePath))
            {
                var extension = Path.GetExtension(filePath).ToLower();
                context.Response.ContentType = extension switch
                {
                    ".html" => "text/html; charset=utf-8",
                    ".js" => "text/javascript; charset=utf-8",
                    ".css" => "text/css; charset=utf-8",
                    ".png" => "image/png",
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".svg" => "image/svg+xml",
                    ".json" => "application/json",
                    _ => "application/octet-stream"
                };

                byte[] fileBytes = File.ReadAllBytes(filePath);
                context.Response.ContentLength64 = fileBytes.Length;
                context.Response.OutputStream.Write(fileBytes, 0, fileBytes.Length);
                context.Response.StatusCode = (int)HttpStatusCode.OK;
            }
            else
            {
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                byte[] notFoundBytes = Encoding.UTF8.GetBytes("404 - Archivo no encontrado");
                context.Response.OutputStream.Write(notFoundBytes, 0, notFoundBytes.Length);
            }
        }
        catch (Exception)
        {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        }
        finally
        {
            context.Response.Close();
        }
    }
}

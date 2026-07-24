using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace DungeonServer;

public class ClientConnection
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public WebSocket Socket { get; set; } = null!;
    public PlayerState State { get; set; } = new();
    public SemaphoreSlim SendLock { get; } = new(1, 1);

    public async Task SendPacketAsync(Packet packet)
    {
        if (Socket.State != WebSocketState.Open) return;
        var bytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(packet));

        try
        {
            await SendLock.WaitAsync();
            if (Socket.State == WebSocketState.Open)
            {
                await Socket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
        catch
        {
            // Capturar silenciosamente el cierre o aborto del socket
        }
        finally
        {
            try { SendLock.Release(); } catch { }
        }
    }
}

/// <summary>
/// Representa una sala del dungeon (sub-mapa). Cada sala tiene su propio estado de enemigos.
/// </summary>
public class DungeonRoom
{
    public string RoomId { get; }
    public ConcurrentDictionary<string, EnemyState> Enemies { get; } = new();
    public ConcurrentDictionary<int, BoxState> Boxes { get; } = new();
    public bool IsInitialized { get; set; }

    public DungeonRoom(string roomId)
    {
        RoomId = roomId;
    }

    /// <summary>
    /// Registra los enemigos de esta sala a partir de la config enviada por un cliente.
    /// Solo se inicializa una vez — los demás clientes reciben el estado existente.
    /// </summary>
    public void InitializeFromConfig(List<EnemyConfig> configs, int tileSize)
    {
        if (IsInitialized) return;
        IsInitialized = true;

        int enemyCounter = 1;
        var rnd = new Random();

        for (int i = 0; i < configs.Count; i++)
        {
            var cfg = configs[i];
            int count = cfg.Cantidad > 0 ? cfg.Cantidad : 1;

            for (int k = 0; k < count; k++)
            {
                string idStr = !string.IsNullOrEmpty(cfg.Id) && count == 1 ? cfg.Id : enemyCounter.ToString();
                enemyCounter++;

                float posX = cfg.GridX * tileSize + (tileSize / 2f);
                float posY = cfg.GridY * tileSize + (tileSize / 2f);

                if (count > 1)
                {
                    posX += ((float)rnd.NextDouble() - 0.5f) * 16f;
                    posY += ((float)rnd.NextDouble() - 0.5f) * 16f;
                }

                var enemy = new EnemyState
                {
                    Id = idStr,
                    Tipo = !string.IsNullOrEmpty(cfg.Tipo) ? cfg.Tipo : (!string.IsNullOrEmpty(cfg.Type) ? cfg.Type : "BASE"),
                    X = posX,
                    Y = posY,
                    Hp = cfg.Vida > 0 ? cfg.Vida : 100,
                    MaxHp = cfg.Vida > 0 ? cfg.Vida : 100,
                    Velocidad = cfg.Velocidad > 0 ? cfg.Velocidad : 80,
                    IsDead = false
                };
                Enemies[enemy.Id] = enemy;
            }
        }

        Console.WriteLine($"  [Sala '{RoomId}'] Inicializada con {Enemies.Count} enemigos.");
        Console.Out.Flush();
    }

    /// <summary>
    /// IA del servidor: mueve enemigos hacia el jugador más cercano de esta sala.
    /// </summary>
    public void UpdateEnemies(IEnumerable<ClientConnection> playersInRoom, float dt)
    {
        var activePlayers = playersInRoom.Where(c => !c.State.IsDead).ToList();
        if (activePlayers.Count == 0) return;

        foreach (var kvp in Enemies)
        {
            var enemy = kvp.Value;
            if (enemy.IsDead) continue;

            // Encontrar jugador más cercano
            ClientConnection? target = null;
            float minDist = float.MaxValue;

            foreach (var p in activePlayers)
            {
                float dx = p.State.X - enemy.X;
                float dy = p.State.Y - enemy.Y;
                float dist = MathF.Sqrt(dx * dx + dy * dy);
                if (dist < minDist)
                {
                    minDist = dist;
                    target = p;
                }
            }

            // Activar aggro si está cerca
            if (minDist < enemy.AggroRange)
            {
                enemy.HasAggro = true;
            }

            if (!enemy.HasAggro) continue;

            // Mover hacia el target
            if (target != null && minDist > 10)
            {
                float dx = target.State.X - enemy.X;
                float dy = target.State.Y - enemy.Y;
                float len = MathF.Sqrt(dx * dx + dy * dy);
                float speed = enemy.Velocidad * dt;

                enemy.X += (dx / len) * speed;
                enemy.Y += (dy / len) * speed;
            }
        }
    }
}

public class GameRoom
{
    private readonly ConcurrentDictionary<string, ClientConnection> _clients = new();
    private readonly ConcurrentDictionary<string, DungeonRoom> _dungeonRooms = new();
    private readonly int _tileSize = 32;
    private bool _isRunning;

    public void StartGameLoop()
    {
        if (_isRunning) return;
        _isRunning = true;

        Task.Run(async () =>
        {
            var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(100)); // 10 ticks/s
            while (await timer.WaitForNextTickAsync())
            {
                float dt = 0.1f; // 100ms

                // Actualizar IA de enemigos en cada sala que tenga jugadores
                foreach (var roomKvp in _dungeonRooms)
                {
                    var room = roomKvp.Value;
                    var playersInRoom = _clients.Values
                        .Where(c => c.State.RoomId == room.RoomId)
                        .ToList();

                    if (playersInRoom.Count > 0 && room.IsInitialized)
                    {
                        room.UpdateEnemies(playersInRoom, dt);
                    }
                }

                // Broadcast state sync por sala
                await BroadcastStateSyncAsync();
            }
        });
    }

    private DungeonRoom GetOrCreateRoom(string roomId)
    {
        return _dungeonRooms.GetOrAdd(roomId, id => new DungeonRoom(id));
    }

    public async Task AddClientAsync(WebSocket socket)
    {
        var conn = new ClientConnection
        {
            Socket = socket,
            State = new PlayerState
            {
                Id = Guid.NewGuid().ToString("N")[..6],
                RoomId = "lobby"
            }
        };
        conn.Id = conn.State.Id;

        _clients[conn.Id] = conn;
        Console.WriteLine($"[+] Jugador conectado: {conn.Id}. Total: {_clients.Count}");
        Console.Out.Flush();

        // Enviar respuesta INIT con ID asignado y jugadores únicamente de su sala
        var currentRoom = GetOrCreateRoom(conn.State.RoomId);
        var initPacket = new Packet
        {
            Type = "INIT",
            Id = conn.Id,
            RoomId = conn.State.RoomId,
            Enemies = currentRoom.IsInitialized ? currentRoom.Enemies.Values.ToList() : null,
            Boxes = currentRoom.Boxes.Values.ToList(),
            Players = GetPlayersInRoom(conn.State.RoomId),
            OnlineCount = _clients.Count
        };
        await conn.SendPacketAsync(initPacket);

        // Notificar a los miembros de la sala sobre la llegada del nuevo jugador
        var joinPacket = new Packet
        {
            Type = "PLAYER_JOIN",
            Id = conn.Id,
            Clase = conn.State.Clase,
            X = conn.State.X,
            Y = conn.State.Y,
            Hp = conn.State.Hp,
            OnlineCount = _clients.Count,
            RoomId = conn.State.RoomId
        };
        await BroadcastInRoomExceptAsync(conn.State.RoomId, conn.Id, joinPacket);

        // Iniciar loop de recepción para esta conexión
        await ReceiveLoopAsync(conn);
    }

    private async Task ReceiveLoopAsync(ClientConnection conn)
    {
        var buffer = new byte[16384];
        using var ms = new MemoryStream();

        try
        {
            while (conn.Socket.State == WebSocketState.Open)
            {
                ms.SetLength(0);
                WebSocketReceiveResult result;
                do
                {
                    result = await conn.Socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        break;
                    }
                    ms.Write(buffer, 0, result.Count);
                }
                while (!result.EndOfMessage);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    break;
                }

                if (ms.Length > 0)
                {
                    var jsonStr = Encoding.UTF8.GetString(ms.ToArray());
                    try
                    {
                        var packet = JsonSerializer.Deserialize<Packet>(jsonStr);
                        if (packet != null)
                        {
                            await ProcessPacketAsync(conn, packet);
                        }
                    }
                    catch (JsonException jsonEx)
                    {
                        Console.WriteLine($"[⚠️] Error parseando JSON de {conn.Id}: {jsonEx.Message}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[!] Error en socket de {conn.Id}: {ex.Message}");
        }
        finally
        {
            _clients.TryRemove(conn.Id, out _);
            Console.WriteLine($"[-] Jugador desconectado: {conn.Id}. Total: {_clients.Count}");

            var leavePacket = new Packet { Type = "PLAYER_LEAVE", Id = conn.Id, OnlineCount = _clients.Count };
            await BroadcastAsync(leavePacket);
        }
    }

    private async Task ProcessPacketAsync(ClientConnection conn, Packet packet)
    {
        switch (packet.Type)
        {
            case "REGISTER_ENEMIES":
                // El cliente registra los enemigos de una sala.
                // Solo el primer cliente que registra una sala la inicializa.
                if (packet.EnemyConfigs != null && !string.IsNullOrEmpty(packet.RoomId))
                {
                    var room = GetOrCreateRoom(packet.RoomId);
                    room.InitializeFromConfig(packet.EnemyConfigs, _tileSize);

                    // Enviar el estado actual de enemigos de esa sala al cliente
                    var enemySyncPacket = new Packet
                    {
                        Type = "ENEMY_SYNC",
                        RoomId = packet.RoomId,
                        Enemies = room.Enemies.Values.ToList()
                    };
                    await conn.SendPacketAsync(enemySyncPacket);
                }
                break;

            case "CHANGE_ROOM":
                // El jugador cambió de sala (cruzó un portal o entró a la mazmorra)
                var oldRoom = conn.State.RoomId;
                conn.State.RoomId = packet.RoomId;
                if (packet.X > 0 && packet.Y > 0)
                {
                    conn.State.X = packet.X;
                    conn.State.Y = packet.Y;
                }

                Console.WriteLine($"  [🚪] Jugador {conn.Id} en sala '{packet.RoomId}'");
                Console.Out.Flush();

                if (oldRoom != packet.RoomId)
                {
                    // Notificar a los miembros de la sala anterior que el jugador se retiró
                    var leaveOldPacket = new Packet
                    {
                        Type = "PLAYER_LEAVE",
                        Id = conn.Id,
                        RoomId = oldRoom,
                        OnlineCount = _clients.Count
                    };
                    await BroadcastInRoomExceptAsync(oldRoom, conn.Id, leaveOldPacket);

                    // Notificar a los miembros de la nueva sala que el jugador ingresó
                    var joinNewPacket = new Packet
                    {
                        Type = "PLAYER_JOIN",
                        Id = conn.Id,
                        Clase = conn.State.Clase,
                        X = conn.State.X,
                        Y = conn.State.Y,
                        Hp = conn.State.Hp,
                        RoomId = packet.RoomId,
                        OnlineCount = _clients.Count
                    };
                    await BroadcastInRoomExceptAsync(packet.RoomId, conn.Id, joinNewPacket);
                }

                // Enviarle el estado actual completo de la nueva sala
                var newRoom = GetOrCreateRoom(packet.RoomId);
                if (!newRoom.IsInitialized && packet.EnemyConfigs != null && packet.EnemyConfigs.Count > 0)
                {
                    newRoom.InitializeFromConfig(packet.EnemyConfigs, _tileSize);
                }

                var roomStatePacket = new Packet
                {
                    Type = "ROOM_STATE",
                    RoomId = packet.RoomId,
                    Players = GetPlayersInRoom(packet.RoomId),
                    Enemies = newRoom.IsInitialized ? newRoom.Enemies.Values.ToList() : null,
                    Boxes = newRoom.Boxes.Values.ToList(),
                    OnlineCount = _clients.Count
                };
                await conn.SendPacketAsync(roomStatePacket);
                break;

            case "MOVE":
                conn.State.X = packet.X;
                conn.State.Y = packet.Y;
                conn.State.Angle = packet.Angle;
                conn.State.Clase = packet.Clase;
                conn.State.Hp = packet.Hp;

                var moveNotice = new Packet
                {
                    Type = "MOVE",
                    Id = conn.Id,
                    X = packet.X,
                    Y = packet.Y,
                    Angle = packet.Angle,
                    Clase = packet.Clase,
                    Hp = packet.Hp,
                    RoomId = conn.State.RoomId
                };
                await BroadcastInRoomExceptAsync(conn.State.RoomId, conn.Id, moveNotice);
                break;

            case "SUMMON_ALLIED":
                packet.Id = conn.Id;
                packet.RoomId = conn.State.RoomId;
                await BroadcastInRoomExceptAsync(conn.State.RoomId, conn.Id, packet);
                break;

            case "SHOOT":
                packet.Id = conn.Id;
                packet.RoomId = conn.State.RoomId;
                // Preservar clase del jugador desde su estado guardado si el paquete no la trae
                if (string.IsNullOrEmpty(packet.Clase) || packet.Clase == "knight")
                    packet.Clase = !string.IsNullOrEmpty(conn.State.Clase) ? conn.State.Clase : "knight";
                await BroadcastInRoomExceptAsync(conn.State.RoomId, conn.Id, packet);
                break;

            case "SHOOT_UPDATE":
                // Actualización de rebote de proyectil: retransmitir a todos en la sala excepto al remitente
                packet.Id = conn.Id;
                packet.RoomId = conn.State.RoomId;
                await BroadcastInRoomExceptAsync(conn.State.RoomId, conn.Id, packet);
                break;

            case "BOX_MOVE":
                var boxRoom = GetOrCreateRoom(conn.State.RoomId);
                boxRoom.Boxes[packet.BoxId] = new BoxState
                {
                    Id = packet.BoxId,
                    GridX = packet.GridX,
                    GridY = packet.GridY
                };

                var boxNotice = new Packet
                {
                    Type = "BOX_MOVE",
                    BoxId = packet.BoxId,
                    GridX = packet.GridX,
                    GridY = packet.GridY,
                    RoomId = conn.State.RoomId
                };
                await BroadcastInRoomExceptAsync(conn.State.RoomId, conn.Id, boxNotice);
                break;

            case "SPAWN_ENEMY":
                packet.Id = conn.Id;
                var spawnConfig = packet.EnemyConfigData ?? (packet.EnemyConfigs != null && packet.EnemyConfigs.Count > 0 ? packet.EnemyConfigs[0] : null);
                if (spawnConfig != null)
                {
                    var spawnRoom = GetOrCreateRoom(conn.State.RoomId);
                    spawnRoom.IsInitialized = true;
                    string idStr = !string.IsNullOrEmpty(spawnConfig.Id) ? spawnConfig.Id : Guid.NewGuid().ToString("N")[..8];
                    var spawnedEnemy = new EnemyState
                    {
                        Id = idStr,
                        Tipo = !string.IsNullOrEmpty(spawnConfig.Tipo) ? spawnConfig.Tipo : (!string.IsNullOrEmpty(spawnConfig.Type) ? spawnConfig.Type : "BASE"),
                        X = spawnConfig.GridX * _tileSize + (_tileSize / 2f),
                        Y = spawnConfig.GridY * _tileSize + (_tileSize / 2f),
                        Hp = spawnConfig.Vida > 0 ? spawnConfig.Vida : 70,
                        MaxHp = spawnConfig.Vida > 0 ? spawnConfig.Vida : 70,
                        Velocidad = spawnConfig.Velocidad > 0 ? spawnConfig.Velocidad : 85,
                        IsDead = false
                    };
                    spawnRoom.Enemies[spawnedEnemy.Id] = spawnedEnemy;
                }
                await BroadcastInRoomExceptAsync(conn.State.RoomId, conn.Id, packet);
                break;

            case "ENEMY_HIT":
                var hitRoom = GetOrCreateRoom(conn.State.RoomId);
                float finalHp = packet.Hp >= 0 ? packet.Hp : 0;
                bool isDead = packet.IsDead || finalHp <= 0;
                string targetId = packet.TargetId ?? string.Empty;

                if (!string.IsNullOrEmpty(targetId) && hitRoom.Enemies.TryGetValue(targetId, out var enemyHit))
                {
                    if (packet.Damage > 0)
                    {
                        enemyHit.Hp = MathF.Max(0, enemyHit.Hp - packet.Damage);
                    }
                    if (packet.Hp >= 0) enemyHit.Hp = packet.Hp;
                    if (enemyHit.Hp <= 0) enemyHit.IsDead = true;
                    finalHp = enemyHit.Hp;
                    isDead = enemyHit.IsDead;
                }

                int remaining = hitRoom.Enemies.Values.Count(e => !e.IsDead);
                bool completed = hitRoom.IsInitialized && hitRoom.Enemies.Count > 0 && remaining == 0;

                // Broadcast a TODOS los jugadores de esta sala (incluyendo al remitente)
                var hitNotice = new Packet
                {
                    Type = "ENEMY_HIT_SYNC",
                    RoomId = conn.State.RoomId,
                    TargetId = targetId,
                    Damage = packet.Damage,
                    Hp = finalHp,
                    IsDead = isDead,
                    RemainingEnemies = remaining,
                    LevelCompleted = completed
                };
                await BroadcastInRoomAsync(conn.State.RoomId, hitNotice);
                break;
        }
    }

    private async Task BroadcastStateSyncAsync()
    {
        if (_clients.IsEmpty) return;

        // Agrupar jugadores por sala
        var playersByRoom = _clients.Values
            .GroupBy(c => c.State.RoomId)
            .ToDictionary(g => g.Key, g => g.ToList());

        foreach (var kvp in playersByRoom)
        {
            var roomId = kvp.Key;
            var playersInRoom = kvp.Value;
            var room = GetOrCreateRoom(roomId);

            int remaining = room.IsInitialized ? room.Enemies.Values.Count(e => !e.IsDead) : 0;
            bool completed = room.IsInitialized && room.Enemies.Count > 0 && remaining == 0;

            var syncPacket = new Packet
            {
                Type = "STATE_SYNC",
                RoomId = roomId,
                Players = GetPlayersInRoom(roomId),
                Enemies = room.IsInitialized ? room.Enemies.Values.ToList() : null,
                Boxes = room.Boxes.Values.ToList(),
                OnlineCount = _clients.Count,
                RemainingEnemies = remaining,
                LevelCompleted = completed
            };

            var tasks = playersInRoom.Select(c => c.SendPacketAsync(syncPacket));
            await Task.WhenAll(tasks);
        }
    }

    private List<PlayerState> GetPlayersInRoom(string roomId)
    {
        return _clients.Values.Where(c => c.State.RoomId == roomId).Select(c => c.State).ToList();
    }

    private List<PlayerState> GetPlayersList()
    {
        return _clients.Values.Select(c => c.State).ToList();
    }

    private async Task BroadcastAsync(Packet packet)
    {
        var tasks = _clients.Values.Select(c => c.SendPacketAsync(packet));
        await Task.WhenAll(tasks);
    }

    private async Task BroadcastExceptAsync(string senderId, Packet packet)
    {
        var tasks = _clients.Values
            .Where(c => c.Id != senderId)
            .Select(c => c.SendPacketAsync(packet));
        await Task.WhenAll(tasks);
    }

    /// <summary>
    /// Broadcast a TODOS los jugadores en una sala específica.
    /// </summary>
    private async Task BroadcastInRoomAsync(string roomId, Packet packet)
    {
        var tasks = _clients.Values
            .Where(c => c.State.RoomId == roomId)
            .Select(c => c.SendPacketAsync(packet));
        await Task.WhenAll(tasks);
    }

    /// <summary>
    /// Broadcast solo a jugadores en una sala específica, excluyendo al remitente.
    /// </summary>
    private async Task BroadcastInRoomExceptAsync(string roomId, string senderId, Packet packet)
    {
        var tasks = _clients.Values
            .Where(c => c.State.RoomId == roomId && c.Id != senderId)
            .Select(c => c.SendPacketAsync(packet));
        await Task.WhenAll(tasks);
    }
}

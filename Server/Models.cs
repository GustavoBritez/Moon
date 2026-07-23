using System.Text.Json.Serialization;

namespace DungeonServer;

public class Packet
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("clase")]
    public string Clase { get; set; } = "knight";

    [JsonPropertyName("x")]
    public float X { get; set; }

    [JsonPropertyName("y")]
    public float Y { get; set; }

    [JsonPropertyName("hp")]
    public float Hp { get; set; } = 100;

    [JsonPropertyName("maxHp")]
    public float MaxHp { get; set; } = 100;

    [JsonPropertyName("vx")]
    public float Vx { get; set; }

    [JsonPropertyName("vy")]
    public float Vy { get; set; }

    [JsonPropertyName("angle")]
    public float Angle { get; set; }

    [JsonPropertyName("weapon")]
    public string Weapon { get; set; } = string.Empty;

    [JsonPropertyName("players")]
    public List<PlayerState>? Players { get; set; }

    [JsonPropertyName("enemies")]
    public List<EnemyState>? Enemies { get; set; }

    [JsonPropertyName("damage")]
    public float Damage { get; set; }

    [JsonPropertyName("targetId")]
    public string TargetId { get; set; } = string.Empty;

    [JsonPropertyName("boxId")]
    public int BoxId { get; set; }

    [JsonPropertyName("gridX")]
    public int GridX { get; set; }

    [JsonPropertyName("gridY")]
    public int GridY { get; set; }

    [JsonPropertyName("isDead")]
    public bool IsDead { get; set; }

    [JsonPropertyName("boxes")]
    public List<BoxState>? Boxes { get; set; }

    [JsonPropertyName("onlineCount")]
    public int OnlineCount { get; set; }

    // --- Campos para sistema de salas ---
    [JsonPropertyName("roomId")]
    public string RoomId { get; set; } = string.Empty;

    // Para SPAWN_ENEMY / REGISTER_ENEMIES: configuraciones de enemigos
    [JsonPropertyName("enemyConfigs")]
    public List<EnemyConfig>? EnemyConfigs { get; set; }

    [JsonPropertyName("enemyData")]
    public EnemyConfig? EnemyConfigData { get; set; }

    [JsonPropertyName("remainingEnemies")]
    public int RemainingEnemies { get; set; }

    [JsonPropertyName("levelCompleted")]
    public bool LevelCompleted { get; set; }
}

public class PlayerState
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("clase")]
    public string Clase { get; set; } = "knight";

    [JsonPropertyName("x")]
    public float X { get; set; }

    [JsonPropertyName("y")]
    public float Y { get; set; }

    [JsonPropertyName("hp")]
    public float Hp { get; set; } = 100;

    [JsonPropertyName("maxHp")]
    public float MaxHp { get; set; } = 100;

    [JsonPropertyName("angle")]
    public float Angle { get; set; }

    [JsonPropertyName("isDead")]
    public bool IsDead { get; set; }

    [JsonPropertyName("roomId")]
    public string RoomId { get; set; } = "lobby";
}

public class EnemyState
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("tipo")]
    public string Tipo { get; set; } = "BASE";

    [JsonPropertyName("x")]
    public float X { get; set; }

    [JsonPropertyName("y")]
    public float Y { get; set; }

    [JsonPropertyName("hp")]
    public float Hp { get; set; } = 100;

    [JsonPropertyName("maxHp")]
    public float MaxHp { get; set; } = 100;

    [JsonPropertyName("isDead")]
    public bool IsDead { get; set; }

    // Velocidad de movimiento para la IA del servidor
    [JsonPropertyName("velocidad")]
    public float Velocidad { get; set; } = 80;

    // Rango de aggro en píxeles
    public float AggroRange { get; set; } = 240;
    public bool HasAggro { get; set; }
}

// Configuración inicial o dinámica de un enemigo
public class EnemyConfig
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = "BASE";

    [JsonPropertyName("tipo")]
    public string Tipo { get; set; } = "BASE";

    [JsonPropertyName("gridX")]
    public int GridX { get; set; }

    [JsonPropertyName("gridY")]
    public int GridY { get; set; }

    [JsonPropertyName("vida")]
    public float Vida { get; set; } = 100;

    [JsonPropertyName("velocidad")]
    public float Velocidad { get; set; } = 80;
}

public class BoxState
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("gridX")]
    public int GridX { get; set; }

    [JsonPropertyName("gridY")]
    public int GridY { get; set; }
}

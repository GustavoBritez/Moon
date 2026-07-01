using System.Collections.Generic;
using CreadorMapas;

namespace CreadorMapas.Config
{
    public static class EnemyConfig
    {
        // Solo te muestro dos de ejemplo, agrega el "colorEditor" al resto
        public static readonly Dictionary<string, EnemigoSpawn> ENEMY_DICT = new Dictionary<string, EnemigoSpawn>
        {
            {
                "Baku Básico", new EnemigoSpawn {
                    type = "BAKU",
                    vida = 200,
                    velocidad = 150,
                    colorEditor = 0x8B0000 // Rojo Oscuro
                }
            },
            {
                "Slime Divisible (Splitter)", new EnemigoSpawn {
                    type = "BASE",
                    vida = 50,
                    velocidad = 80,
                    decoradores = new string[] { "SPLITTER" },
                    colorEditor = 0x00FF00 // Verde
                }
            }
        };
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CreadorMapas
{
    public static class TileConfig
    {
        public static readonly Dictionary<int, TileData> TILE_DICT = new Dictionary<int, TileData>
        {
            { 0, new TileData { name = "Suelo", color = 0xFFFFFF, solido = false } },
            { 1, new TileData { name = "Pared_Base", color = 0x7f8c8d, solido = true } },
            { 2, new TileData { name = "Meta", color = 0xf1c40f, solido = false } },
            { 3, new TileData { name = "Spawn", color = 0x00ffff, solido = false } },
 
            // Hielo
            { 4, new TileData { name = "Hielo", color = 0xa4ebf3, solido = false } },
            { 5, new TileData { name = "Nieve", color = 0xffffff, solido = false } },
            { 6, new TileData { name = "Pared_Hielo", color = 0x2980b9, solido = true } },
            { 7, new TileData { name = "Agua_Congelada", color = 0x1abc9c, solido = false } },

            // Volcánico
            { 8, new TileData { name = "Piedra_Volcanica", color = 0x34495e, solido = false } },
            { 9, new TileData { name = "Lava", color = 0xe67e22, solido = false } },
            { 10, new TileData { name = "Ceniza", color = 0x111111, solido = false } },
            { 11, new TileData { name = "Muro_Obsidiana", color = 0x000000, solido = true } },

            // Pantano
            { 12, new TileData { name = "Pasto", color = 0x2ecc71, solido = false } },
            { 13, new TileData { name = "Pantano", color = 0x145a32, solido = false } },
            { 14, new TileData { name = "Tronco", color = 0x8e44ad, solido = true } },
            { 15, new TileData { name = "Veneno", color = 0x00ff00, solido = false } },

            // Tech
            { 16, new TileData { name = "Baldosa_Metal", color = 0xbdc3c7, solido = false } },
            { 17, new TileData { name = "Muro_Titanio", color = 0x2c3e50, solido = true } },
            { 18, new TileData { name = "Acido", color = 0x39ff14, solido = false } },
            { 19, new TileData { name = "Portal_Lab", color = 0x9b59b6, solido = false } }
        };
    }
}

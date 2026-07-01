using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreadorMapas
{
    public class EnemigoSpawn
    {
        public string type { get; set; }
        public int gridX { get; set; }
        public int gridY { get; set; }
        public int vida { get; set; }
        public int velocidad { get; set; }
        public string[] decoradores { get; set; }
        public int colorEditor { get; set; }
    }
}
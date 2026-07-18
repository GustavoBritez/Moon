using System.Collections.Generic;

namespace CreadorMapas
{
    public class ChestConfig
    {
        public int GridX { get; set; }
        public int GridY { get; set; }
        public Dictionary<string, int> Items { get; set; } = new Dictionary<string, int>();
    }
}

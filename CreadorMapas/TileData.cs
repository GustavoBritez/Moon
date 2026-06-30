using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreadorMapas
{
    public class TileData
    {
        public string name { get; set; }
        public int color { get; set; } // En C# los colores Hex son enteros
        public bool solido { get; set; }
    }
}

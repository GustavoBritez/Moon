namespace CreadorMapas
{
    public class EnemigoSpawn
    {
        public string type { get; set; }
        public int gridX { get; set; }
        public int gridY { get; set; }
        public int vida { get; set; }
        public int velocidad { get; set; }
        public int defensa { get; set; } = 10;
        public string[] decoradores { get; set; }
        public int colorEditor { get; set; }
        public double danioBase { get; set; } = 2;
        public string tipoDanio { get; set; } = "PORCENTAJE_BASE";
    }
}
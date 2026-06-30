using Microsoft.VisualBasic; // Asegúrate de tener esta referencia agregada al proyecto
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;

namespace CreadorMapas
{

    public partial class CreadorMapa : Form
    {
        public class TileItem
        {
            public int Id { get; set; }
            public string Nombre { get; set; }
        }
        public class EnemigoSpawn
        {
            public string tipo { get; set; }
            public int gridX { get; set; }
            public int gridY { get; set; }
            public int vida { get; set; }
        }

        private List<EnemigoSpawn> listaEnemigos = new List<EnemigoSpawn>();
        private bool modoColocarEnemigo = false;
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
        private bool isMouseDown = false;

        public CreadorMapa()
        {
            InitializeComponent();

            // Configuración del ComboBox (Lógica robusta)
            var lista = new List<object>();
            foreach (var tile in TILE_DICT)
            {
                lista.Add(new { Id = tile.Key, Nombre = tile.Value.name });
            }

            comboBox1.DataSource = lista;
            comboBox1.DisplayMember = "Nombre";
            comboBox1.ValueMember = "Id";
            // Eventos de Pincel
            dataGridView1.MouseDown += (s, e) => isMouseDown = true;
            dataGridView1.MouseUp += (s, e) => isMouseDown = false;


            // Optimización de rendimiento (Doble Buffer)
            typeof(DataGridView).InvokeMember("DoubleBuffered",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.SetProperty,
                null, dataGridView1, new object[] { true });
        }

        // EL MÉTODO PINCEL (Lógica central de pintado)
        private void PintarCelda(int fila, int columna)
        {
            if (comboBox1.SelectedValue != null)
            {
                // Forzamos la conversión de tipo (si usaste BindingSource, SelectedValue es un int)
                int idTile = (int)comboBox1.SelectedValue;

                if (TILE_DICT.ContainsKey(idTile))
                {
                    int colorInt = TILE_DICT[idTile].color;
                    Color color = Color.FromArgb(255,
                                    (colorInt >> 16) & 0xFF,
                                    (colorInt >> 8) & 0xFF,
                                    colorInt & 0xFF);

                    // IMPORTANTE: Asignamos el estilo a la celda específica, no a la fila o al grid
                    var celda = dataGridView1.Rows[fila].Cells[columna];
                    celda.Style.BackColor = color;
                    celda.Style.SelectionBackColor = color; // Para que no cambie al seleccionar
                    celda.Value = idTile;
                }
            }
        }

        private void GenerarGrilla(int tamano)
        {
            dataGridView1.Columns.Clear();
            dataGridView1.Rows.Clear();

            // 1. Crear columnas
            for (int i = 0; i < tamano; i++)
            {
                dataGridView1.Columns.Add(new DataGridViewTextBoxColumn { Width = 30 });
            }

            // 2. Crear filas (Bucle necesario)
            for (int i = 0; i < tamano; i++)
            {
                int index = dataGridView1.Rows.Add();
                dataGridView1.Rows[index].Height = 30;
            }

            // 3. Inicializar TODAS las celdas con el ID 0 (Suelo)
            // Esto es crucial para que luego GenerarCodigoJS() no encuentre valores nulos
            int colorSuelo = TILE_DICT[0].color;
            Color color = Color.FromArgb(255, (colorSuelo >> 16) & 0xFF, (colorSuelo >> 8) & 0xFF, colorSuelo & 0xFF);

            foreach (DataGridViewRow row in dataGridView1.Rows)
            {
                foreach (DataGridViewCell cell in row.Cells)
                {
                    cell.Value = 0; // ID del suelo
                    cell.Style.BackColor = color;
                }
            }

            dataGridView1.ClearSelection();
        }


        private void dataGridView1_CellClick_1(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0 && e.ColumnIndex >= 0)
            {
                PintarCelda(e.RowIndex, e.ColumnIndex);
            }
        }

        private void dataGridView1_KeyDown_1(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
            {
                e.Handled = true;
                if (dataGridView1.CurrentCell != null)
                {
                    PintarCelda(dataGridView1.CurrentCell.RowIndex, dataGridView1.CurrentCell.ColumnIndex);
                }
            }
        }

        private void BtnCrearMapa_Click(object sender, EventArgs e)
        {
            string input = Microsoft.VisualBasic.Interaction.InputBox("Ingresa el tamaño del mapa (ej: 20):", "Nuevo Mapa", "20");

            if (int.TryParse(input, out int tamano))
            {
                GenerarGrilla(tamano);
            }
        }

        private void DataGridView1_CellMouseEnter(object sender, DataGridViewCellEventArgs e)
        {
            if (isMouseDown && e.RowIndex >= 0 && e.ColumnIndex >= 0 && !modoColocarEnemigo)
            {
                PintarCelda(e.RowIndex, e.ColumnIndex);
            }
        }

        private void ColocarEnemigo(int fila, int columna)
        {
            // Verificamos si ya hay un enemigo en esa celda
            var existente = listaEnemigos.Find(en => en.gridX == columna && en.gridY == fila);

            if (existente != null)
            {
                listaEnemigos.Remove(existente); // Si ya hay uno, el clic lo borra
            }
            else
            {
                listaEnemigos.Add(new EnemigoSpawn
                {
                    tipo = "BAKU", // Por ahora estático, luego lo puedes elegir
                    gridX = columna,
                    gridY = fila,
                    vida = 200
                });
            }
            dataGridView1.InvalidateCell(columna, fila);
        }
        public string GenerarCodigoJS()
        {
            int filas = dataGridView1.RowCount;
            int cols = dataGridView1.ColumnCount;
            string js = "export const MATRIZ_NIVEL = [\n";

            for (int i = 0; i < filas; i++)
            {
                js += "    [";
                for (int j = 0; j < cols; j++)
                {
                    // Si la celda está vacía, asumimos tipo 0 (Suelo)
                    var val = dataGridView1.Rows[i].Cells[j].Value;
                    js += (val ?? 0).ToString() + (j < cols - 1 ? ", " : "");
                }
                js += "]" + (i < filas - 1 ? "," : "") + "\n";
            }
            js += "];";
            return js;
        }

        private void BtnCrearEnemigo_Click(object sender, EventArgs e)
        {
            modoColocarEnemigo = !modoColocarEnemigo;

            // Cambiamos el cursor al instante
            dataGridView1.Cursor = modoColocarEnemigo ? Cursors.Hand : Cursors.Default;

            // Feedback visual en el botón
            BtnCrearEnemigo.BackColor = modoColocarEnemigo ? Color.SeaGreen : Color.FromArgb(0, 122, 204);
        }

        private void dataGridView1_CellMouseDown(object sender, DataGridViewCellMouseEventArgs e)
        {
            if (e.RowIndex >= 0 && e.ColumnIndex >= 0)
            {
                if (modoColocarEnemigo)
                {
                    ColocarEnemigo(e.RowIndex, e.ColumnIndex);
                }
                else
                {
                    PintarCelda(e.RowIndex, e.ColumnIndex);
                }
            }
        }

        private void dataGridView1_CellMouseEnter(object sender, DataGridViewCellEventArgs e)
        {
            if (isMouseDown && e.RowIndex >= 0 && e.ColumnIndex >= 0 && !modoColocarEnemigo)
            {
                PintarCelda(e.RowIndex, e.ColumnIndex);
            }
        }
    }
}
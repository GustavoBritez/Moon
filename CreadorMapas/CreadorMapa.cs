using Microsoft.VisualBasic; // Asegúrate de tener esta referencia agregada al proyecto
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;

namespace CreadorMapas
{
    public partial class CreadorMapa : Form
    {
        public static readonly Dictionary<int, TileData> TILE_DICT = new Dictionary<int, TileData>
        {
    { 0, new TileData { name = "Suelo", color = 0x2c3e50, solido = false } },
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

            // 1. Configurar ComboBox
            comboBox1.DataSource = new BindingSource(TILE_DICT, null);
            comboBox1.DisplayMember = "Value.name";
            comboBox1.ValueMember = "Key";

            // 2. Eventos de ratón para el pincel
            dataGridView1.MouseDown += (s, e) => isMouseDown = true;
            dataGridView1.MouseUp += (s, e) => isMouseDown = false;
            dataGridView1.CellMouseEnter += DataGridView1_CellMouseEnter;
            dataGridView1.CellMouseDown += DataGridView1_CellMouseDown;

            // 3. Activar Doble Buffer para eliminar el lag/delay
            typeof(DataGridView).InvokeMember("DoubleBuffered",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.SetProperty,
                null, dataGridView1, new object[] { true });
        }

        // EL MÉTODO PINCEL (Lógica central de pintado)
        private void PintarCelda(int fila, int columna)
        {
            if (comboBox1.SelectedValue != null)
            {
                int idTile = (int)comboBox1.SelectedValue;

                if (TILE_DICT.ContainsKey(idTile))
                {
                    int colorInt = TILE_DICT[idTile].color;
                    // Convertir hex a Color de C#
                    Color color = Color.FromArgb(255,
                                  (colorInt >> 16) & 0xFF,
                                  (colorInt >> 8) & 0xFF,
                                  colorInt & 0xFF);

                    dataGridView1.Rows[fila].Cells[columna].Style.BackColor = color;
                    dataGridView1.Rows[fila].Cells[columna].Value = idTile;
                }
            }
        }

        private void GenerarGrilla(int tamano)
        {
            dataGridView1.Columns.Clear();
            dataGridView1.Rows.Clear();

            // Crear columnas
            for (int i = 0; i < tamano; i++)
            {
                dataGridView1.Columns.Add(new DataGridViewTextBoxColumn { Width = 30 });
            }

            // Crear filas
            dataGridView1.Rows.Add(tamano);
            foreach (DataGridViewRow row in dataGridView1.Rows)
            {
                row.Height = 30;
            }

            // Aplicar estilo inicial
            dataGridView1.DefaultCellStyle.BackColor = coloresPincel["Suelo (0)"];
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

        private void dataGridView1_CellMouseEnter(object sender, DataGridViewCellEventArgs e)
        {
            if (isMouseDown && e.RowIndex >= 0 && e.ColumnIndex >= 0)
            {
                PintarCelda(e.RowIndex, e.ColumnIndex);
            }
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
    }
}
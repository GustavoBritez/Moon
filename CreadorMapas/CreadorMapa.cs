using CreadorMapas.Config;
using Microsoft.VisualBasic; // Asegúrate de tener esta referencia agregada al proyecto
using System;
using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing;
using System.Windows.Forms;
using System.Windows.Forms;
using System.IO;

namespace CreadorMapas
{
    public partial class CreadorMapa : Form
    {
        // Estado de la aplicación
        private bool isMouseDown = false;
        private bool modoColocarEnemigo = false;

        // La lista de enemigos pertenece al estado del mapa actual
        private List<EnemigoSpawn> listaEnemigos = new List<EnemigoSpawn>();

        public CreadorMapa()
        {
            InitializeComponent();
            ConfigurarEditor();
        }

        private void ConfigurarEditor()
        {
            // --- 1. CONFIGURACIÓN DEL COMBOBOX DE BALDOSAS (TILES) ---
            // Usamos el diccionario de TileConfig para llenar comboBox1
            var listaTiles = new List<TileItem>();
            foreach (var tile in TileConfig.TILE_DICT)
            {
                listaTiles.Add(new TileItem { Id = tile.Key, Nombre = tile.Value.name });
            }

            comboBox1.DataSource = listaTiles;
            comboBox1.DisplayMember = "Nombre"; // Lo que ve el usuario
            comboBox1.ValueMember = "Id";       // El valor (int) que usamos para pintar y exportar


            // --- 2. CONFIGURACIÓN DEL COMBOBOX DE ENEMIGOS ---
            // Usamos el diccionario de EnemyConfig para llenar cmbEnemigos
            var listaEnemies = new List<KeyValuePair<string, EnemigoSpawn>>(EnemyConfig.ENEMY_DICT);

            cmbEnemigos.DataSource = listaEnemies;
            cmbEnemigos.DisplayMember = "Key";  // Lo que ve el usuario (ej: "Baku de Fuego")
            cmbEnemigos.ValueMember = "Value";  // El objeto EnemigoSpawn completo que copiamos al colocar


            // --- 3.  DE EVENTOS DE LA GRILLA ---
            dataGridView1.MouseDown += (s, e) => isMouseDown = true;
            dataGridView1.MouseUp += (s, e) => isMouseDown = false;

            dataGridView1.CellMouseDown += DataGridView1_CellMouseDown;
            dataGridView1.CellMouseEnter += DataGridView1_CellMouseEnter;
            dataGridView1.CellPainting += DataGridView1_CellPainting;
            dataGridView1.KeyDown += DataGridView1_KeyDown;


            typeof(DataGridView).InvokeMember("DoubleBuffered",
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance |
                System.Reflection.BindingFlags.SetProperty,
                null,
                dataGridView1,
                new object[] { true });
        }

        // --- SISTEMA DE PINTADO ---

        private void PintarCelda(int fila, int columna)
        {
            if (comboBox1.SelectedValue != null)
            {
                int idTile = (int)comboBox1.SelectedValue;

                if (TileConfig.TILE_DICT.ContainsKey(idTile))
                {
                    int colorInt = TileConfig.TILE_DICT[idTile].color;
                    Color color = Color.FromArgb(255, (colorInt >> 16) & 0xFF, (colorInt >> 8) & 0xFF, colorInt & 0xFF);

                    var celda = dataGridView1.Rows[fila].Cells[columna];
                    celda.Style.BackColor = color;
                    celda.Style.SelectionBackColor = color;
                    celda.Value = idTile;
                }
            }
        }

        private void ColocarEnemigo(int fila, int columna)
        {
            var existente = listaEnemigos.Find(en => en.gridX == columna && en.gridY == fila);

            if (existente != null)
            {
                listaEnemigos.Remove(existente);
            }
            else
            {
                if (cmbEnemigos.SelectedValue is EnemigoSpawn plantilla)
                {
                    listaEnemigos.Add(new EnemigoSpawn
                    {
                        type = plantilla.type,
                        gridX = columna,
                        gridY = fila,
                        vida = plantilla.vida,
                        velocidad = plantilla.velocidad,
                        decoradores = plantilla.decoradores,
                        colorEditor = plantilla.colorEditor // <--- Pasamos el color
                    });
                }
            }
            dataGridView1.InvalidateCell(columna, fila);
        }

        // --- EVENTOS DE LA INTERFAZ ---

        private void DataGridView1_CellMouseDown(object sender, DataGridViewCellMouseEventArgs e)
        {
            if (e.RowIndex >= 0 && e.ColumnIndex >= 0)
            {
                if (modoColocarEnemigo) ColocarEnemigo(e.RowIndex, e.ColumnIndex);
                else PintarCelda(e.RowIndex, e.ColumnIndex);
            }
        }

        private void DataGridView1_CellMouseEnter(object sender, DataGridViewCellEventArgs e)
        {
            if (isMouseDown && e.RowIndex >= 0 && e.ColumnIndex >= 0 && !modoColocarEnemigo)
            {
                PintarCelda(e.RowIndex, e.ColumnIndex);
            }
        }

        private void DataGridView1_CellPainting(object sender, DataGridViewCellPaintingEventArgs e)
        {
            if (e.RowIndex >= 0 && e.ColumnIndex >= 0)
            {
                // 1. Dibuja el color normal de la baldosa de fondo
                e.Paint(e.CellBounds, DataGridViewPaintParts.All);

                // 2. Buscamos si hay un enemigo en esta coordenada
                var enemigoEnCelda = listaEnemigos.Find(en => en.gridX == e.ColumnIndex && en.gridY == e.RowIndex);

                if (enemigoEnCelda != null)
                {
                    // Convertimos el Hexadecimal a un Color de C#
                    int c = enemigoEnCelda.colorEditor;
                    Color colorEnemigo = Color.FromArgb(255, (c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF);

                    // Creamos un pincel dinámico con ese color
                    using (Brush pincel = new SolidBrush(colorEnemigo))
                    {
                        Rectangle rect = new Rectangle(e.CellBounds.X + 5, e.CellBounds.Y + 5, e.CellBounds.Width - 10, e.CellBounds.Height - 10);
                        e.Graphics.FillEllipse(pincel, rect);
                    }
                }

                e.Handled = true;
            }
        }

        private void DataGridView1_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
            {
                e.Handled = true;
                if (dataGridView1.CurrentCell != null && !modoColocarEnemigo)
                {
                    PintarCelda(dataGridView1.CurrentCell.RowIndex, dataGridView1.CurrentCell.ColumnIndex);
                }
            }
        }

        // --- CREACIÓN Y EXPORTACIÓN ---

        private void BtnCrearMapa_Click(object sender, EventArgs e)
        {
            string input = Microsoft.VisualBasic.Interaction.InputBox("Ingresa el tamaño del mapa (ej: 20):", "Nuevo Mapa", "20");

            if (int.TryParse(input, out int tamano))
            {
                listaEnemigos.Clear(); // Limpiar enemigos al crear mapa nuevo
                GenerarGrilla(tamano);
            }
        }
        private void GenerarGrilla(int tamano)
        {
            // Limpiamos cualquier grilla anterior
            dataGridView1.Columns.Clear();
            dataGridView1.Rows.Clear();

            // 1. Crear columnas
            for (int i = 0; i < tamano; i++)
            {
                dataGridView1.Columns.Add(new DataGridViewTextBoxColumn { Width = 30 });
            }

            // 2. Crear filas
            for (int i = 0; i < tamano; i++)
            {
                int index = dataGridView1.Rows.Add();
                dataGridView1.Rows[index].Height = 30;
            }

            // 3. Inicializar TODAS las celdas con el ID 0 (Suelo)
            int colorSuelo = TileConfig.TILE_DICT[0].color;
            Color color = Color.FromArgb(255, (colorSuelo >> 16) & 0xFF, (colorSuelo >> 8) & 0xFF, colorSuelo & 0xFF);

            foreach (DataGridViewRow row in dataGridView1.Rows)
            {
                foreach (DataGridViewCell cell in row.Cells)
                {
                    cell.Value = 0; // Guardamos el ID del suelo
                    cell.Style.BackColor = color; // Pintamos la celda
                    cell.Style.SelectionBackColor = color; // Evitamos el fondo azul nativo al seleccionar
                }
            }

            // Quitamos el foco de la primera celda para que se vea limpio
            dataGridView1.ClearSelection();
        }
        private void BtnCrearEnemigo_Click(object sender, EventArgs e)
        {
            modoColocarEnemigo = !modoColocarEnemigo;
            dataGridView1.Cursor = modoColocarEnemigo ? Cursors.Hand : Cursors.Default;
            // Opcional: btnCrearEnemigo.BackColor = modoColocarEnemigo ? Color.SeaGreen : Color.FromArgb(0, 122, 204);
        }

        public string GenerarCodigoJS()
        {
            int filas = dataGridView1.RowCount;
            int cols = dataGridView1.ColumnCount;

            // --- 1. CONSTRUIR LA MATRIZ DE BALDOSAS ---
            string js = "export const MATRIZ_NIVEL = [\n";

            for (int i = 0; i < filas; i++)
            {
                js += "    [";
                for (int j = 0; j < cols; j++)
                {
                    // Leemos el ID guardado en la celda. Si es null, por seguridad ponemos 0 (Suelo)
                    var val = dataGridView1.Rows[i].Cells[j].Value;
                    js += (val != null ? val.ToString() : "0");

                    // Agrega coma si no es la última columna
                    if (j < cols - 1) js += ", ";
                }

                js += "]";
                // Agrega coma y salto de línea si no es la última fila
                if (i < filas - 1) js += ",\n";
                else js += "\n";
            }
            js += "];\n\n";

            // --- 2. CONSTRUIR LOS ENEMIGOS ---
            js += "export const ENEMIGOS_NIVEL = [\n";

            for (int i = 0; i < listaEnemigos.Count; i++)
            {
                var en = listaEnemigos[i];

                // Formatear array de decoradores si existe (ej: ['FIRE', 'SPEED'])
                string decoradoresStr = "null";
                if (en.decoradores != null && en.decoradores.Length > 0)
                {
                    decoradoresStr = "['" + string.Join("', '", en.decoradores) + "']";
                }

                js += $"    {{ type: '{en.type}', gridX: {en.gridX}, gridY: {en.gridY}, vida: {en.vida}, velocidad: {en.velocidad}, decoradores: {decoradoresStr} }}";

                // Agrega coma y salto de línea si no es el último enemigo
                if (i < listaEnemigos.Count - 1) js += ",\n";
                else js += "\n";
            }
            js += "];\n";

            return js;
        }

        private void btnExportar_Click(object sender, EventArgs e)
        {
            if (dataGridView1.RowCount == 0)
            {
                MessageBox.Show("Primero debes crear un mapa.", "Atención", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            using (SaveFileDialog dialog = new SaveFileDialog())
            {
                dialog.Filter = "Archivos JavaScript (*.js)|*.js"; 
                dialog.Title = "Guardar nivel exportado";
                dialog.FileName = "Nivel_Nuevo.js"; 

                if (dialog.ShowDialog() == DialogResult.OK)
                {
                    string codigoJS = GenerarCodigoJS();

                    System.IO.File.WriteAllText(dialog.FileName, codigoJS);

                    MessageBox.Show("¡Nivel guardado correctamente en:\n" + dialog.FileName,
                                    "Exportación Exitosa",
                                    MessageBoxButtons.OK,
                                    MessageBoxIcon.Information);
                }
            }
        }


    }
}
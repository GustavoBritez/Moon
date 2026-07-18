using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace CreadorMapas
{
    public partial class CreadorMapa : Form
    {
        private bool isMouseDown = false;
        private bool modoColocarEnemigo = false;

        // Estructura para contener los datos de cada mapa individual
        private class MapaData
        {
            public string Nombre { get; set; }
            public DataGridView Grid { get; set; }
            public List<EnemigoSpawn> Enemigos { get; set; } = new List<EnemigoSpawn>();
            public List<PortalConfig> Portales { get; set; } = new List<PortalConfig>();
            public List<ChestConfig> Cofres { get; set; } = new List<ChestConfig>();
        }

        private Dictionary<TabPage, MapaData> mapaProyectos = new Dictionary<TabPage, MapaData>();
        
        // Mantener las selecciones de modificadores activas sin importar el filtro de texto
        private HashSet<string> decoradoresSeleccionados = new HashSet<string>();
        private List<string> todosLosDecoradores = new List<string>();

        // Colores automáticos por tipo de clase base
        private static readonly Dictionary<string, int> COLORES_CLASE = new Dictionary<string, int>
        {
            { "BASE", 0xFF6584 },
            { "BAKU", 0x9B59B6 },
            { "EXPLOSIVE_SHOOTER", 0xE67E22 },
            { "SHOOTER_CHILD", 0xF1C40F }
        };

        public CreadorMapa()
        {
            InitializeComponent();
            ConfigurarEditor();
        }

        // =======================
        //  PARSER DE EnemigoBase.js
        // =======================
        private List<string> ParsearClasesEnemigo()
        {
            var clases = new List<string>();
            string ruta = BuscarArchivo("EnemigoBase.js");

            if (string.IsNullOrEmpty(ruta) || !File.Exists(ruta))
            {
                clases.Add("BASE");
                return clases;
            }

            try
            {
                string contenido = File.ReadAllText(ruta);
                var matchClasses = Regex.Match(contenido, @"ENEMY_CLASSES\s*=\s*\{([^}]+)\}");
                if (matchClasses.Success)
                {
                    var regexKeys = new Regex(@"'(\w+)'\s*:");
                    foreach (Match m in regexKeys.Matches(matchClasses.Groups[1].Value))
                    {
                        clases.Add(m.Groups[1].Value);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error leyendo EnemigoBase.js: " + ex.Message,
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }

            if (clases.Count == 0) clases.Add("BASE");
            return clases;
        }

        private List<string> ParsearDecoradores()
        {
            var decoradores = new List<string>();
            string ruta = BuscarArchivo("EnemigoBase.js");

            if (string.IsNullOrEmpty(ruta) || !File.Exists(ruta))
                return decoradores;

            try
            {
                string contenido = File.ReadAllText(ruta);
                var regex = new Regex(@"export\s+class\s+(\w+)Decorator\s+extends\s+EnemigoDecorator");
                foreach (Match m in regex.Matches(contenido))
                {
                    decoradores.Add(m.Groups[1].Value.ToUpper());
                }
            }
            catch { }

            return decoradores;
        }

        private string BuscarArchivo(string nombreArchivo)
        {
            string dir = AppDomain.CurrentDomain.BaseDirectory;
            while (!string.IsNullOrEmpty(dir))
            {
                try
                {
                    var archivos = Directory.GetFiles(dir, nombreArchivo, SearchOption.AllDirectories);
                    if (archivos.Length > 0) return archivos[0];
                }
                catch { }

                dir = Path.GetDirectoryName(dir);
            }
            return null;
        }

        // =======================
        //  CONFIGURACIÓN INICIAL
        // =======================
        private void ConfigurarEditor()
        {
            // --- 1. TILES ---
            var listaTiles = new List<TileItem>();
            foreach (var tile in TileConfig.TILE_DICT)
            {
                listaTiles.Add(new TileItem { Id = tile.Key, Nombre = tile.Value.name });
            }
            comboBox1.DataSource = listaTiles;
            comboBox1.DisplayMember = "Nombre";
            comboBox1.ValueMember = "Id";

            // --- 2. CLASES ENEMIGOS ---
            cmbClaseBase.DataSource = ParsearClasesEnemigo();

            // --- 3. DECORADORES (Filtro y CheckedListBox) ---
            todosLosDecoradores = ParsearDecoradores();
            RepoblarDecoradores("");

            txtFiltroDecoradores.TextChanged += (s, e) => RepoblarDecoradores(txtFiltroDecoradores.Text);
            chkDecoradores.ItemCheck += ChkDecoradores_ItemCheck;

            // --- 4. CREAR MAPA BASE POR DEFECTO ---
            CrearNuevaPestañaMapa("principal", 20);

            // Estado inicial de controles
            SetEstadoControlesEnemigo(false);
        }

        private void ChkDecoradores_ItemCheck(object sender, ItemCheckEventArgs e)
        {
            string item = chkDecoradores.Items[e.Index].ToString();
            if (e.NewValue == CheckState.Checked)
            {
                decoradoresSeleccionados.Add(item);
            }
            else
            {
                decoradoresSeleccionados.Remove(item);
            }
        }

        private void RepoblarDecoradores(string filtro)
        {
            // Desasociar el evento temporalmente para evitar llamadas recursivas erróneas
            chkDecoradores.ItemCheck -= ChkDecoradores_ItemCheck;

            chkDecoradores.Items.Clear();
            foreach (var dec in todosLosDecoradores)
            {
                if (string.IsNullOrEmpty(filtro) || dec.Contains(filtro.ToUpper()))
                {
                    bool marcado = decoradoresSeleccionados.Contains(dec);
                    chkDecoradores.Items.Add(dec, marcado);
                }
            }

            chkDecoradores.ItemCheck += ChkDecoradores_ItemCheck;
        }

        private void SetEstadoControlesEnemigo(bool activo)
        {
            cmbClaseBase.Enabled = activo;
            chkDecoradores.Enabled = activo;
            txtFiltroDecoradores.Enabled = activo;
            nudVida.Enabled = activo;
            nudVelocidad.Enabled = activo;
            nudDefensaBase.Enabled = activo;
            nudDanioBase.Enabled = activo;
            cmbTipoDanio.Enabled = activo;
        }

        // ===================================
        //  MANEJO DE PESTAÑAS Y SUB-MAPAS
        // ===================================
        private void CrearNuevaPestañaMapa(string nombre, int tamano)
        {
            TabPage tab = new TabPage(nombre) { BackColor = Color.FromArgb(45, 45, 48) };

            DataGridView dgv = new DataGridView
            {
                AllowUserToAddRows = false,
                AllowUserToResizeColumns = false,
                AllowUserToResizeRows = false,
                BackgroundColor = Color.FromArgb(30, 30, 30),
                ColumnHeadersVisible = false,
                RowHeadersVisible = false,
                GridColor = Color.FromArgb(62, 62, 66),
                Dock = DockStyle.Fill
            };

            DataGridViewCellStyle cellStyle = new DataGridViewCellStyle
            {
                Alignment = DataGridViewContentAlignment.MiddleLeft,
                BackColor = SystemColors.Window,
                Font = new Font("Segoe UI", 9F),
                ForeColor = SystemColors.ControlText,
                SelectionBackColor = Color.FromArgb(150, 255, 255, 255),
                SelectionForeColor = SystemColors.HighlightText,
                WrapMode = DataGridViewTriState.False
            };
            dgv.DefaultCellStyle = cellStyle;

            // Registrar eventos de grilla
            dgv.MouseDown += (s, e) => isMouseDown = true;
            dgv.MouseUp += (s, e) => isMouseDown = false;
            dgv.CellMouseDown += DataGridView1_CellMouseDown;
            dgv.CellMouseEnter += DataGridView1_CellMouseEnter;
            dgv.CellPainting += DataGridView1_CellPainting;
            dgv.KeyDown += DataGridView1_KeyDown;

            // Activar doble buffer
            typeof(DataGridView).InvokeMember("DoubleBuffered",
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance |
                System.Reflection.BindingFlags.SetProperty,
                null,
                dgv,
                new object[] { true });

            tab.Controls.Add(dgv);
            tabMapas.TabPages.Add(tab);

            // Registrar datos del mapa en el proyecto
            var mapa = new MapaData
            {
                Nombre = nombre,
                Grid = dgv
            };
            mapaProyectos.Add(tab, mapa);

            // Generar grilla
            GenerarGrillaInterna(dgv, tamano);

            // Seleccionar la nueva pestaña
            tabMapas.SelectedTab = tab;
        }

        private void GenerarGrillaInterna(DataGridView dgv, int tamano)
        {
            dgv.Columns.Clear();
            dgv.Rows.Clear();

            for (int i = 0; i < tamano; i++)
            {
                dgv.Columns.Add(new DataGridViewTextBoxColumn { Width = 30 });
            }

            for (int i = 0; i < tamano; i++)
            {
                int index = dgv.Rows.Add();
                dgv.Rows[index].Height = 30;
            }

            int colorSuelo = TileConfig.TILE_DICT[0].color;
            Color color = Color.FromArgb(255, (colorSuelo >> 16) & 0xFF, (colorSuelo >> 8) & 0xFF, colorSuelo & 0xFF);

            foreach (DataGridViewRow row in dgv.Rows)
            {
                foreach (DataGridViewCell cell in row.Cells)
                {
                    cell.Value = 0;
                    cell.Style.BackColor = color;
                    cell.Style.SelectionBackColor = color;
                }
            }

            dgv.ClearSelection();
        }

        private MapaData GetMapaActual()
        {
            if (tabMapas.SelectedTab != null && mapaProyectos.ContainsKey(tabMapas.SelectedTab))
            {
                return mapaProyectos[tabMapas.SelectedTab];
            }
            return null;
        }

        // =======================
        //  PINTADO E INTERACCIÓN
        // =======================
        private void PintarCelda(int fila, int columna)
        {
            var mapaActual = GetMapaActual();
            if (mapaActual == null) return;

            if (comboBox1.SelectedValue != null)
            {
                int idTile = (int)comboBox1.SelectedValue;

                // Validación de Spawn único
                if (idTile == 3)
                {
                    if (ExisteSpawnEnMapa(mapaActual.Grid, out int filaVieja, out int colVieja))
                    {
                        if (filaVieja == fila && colVieja == columna) return;

                        MessageBox.Show(
                            "Solo puede existir un único Spawn de Kitty en cada mapa.\n\n" +
                            $"Ya existe uno en la posición ({colVieja}, {filaVieja}).\n" +
                            "Elimínalo primero pintando otro tile sobre él.",
                            "Spawn Duplicado",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Warning);
                        return;
                    }
                }

                // Si pintamos cualquier cosa arriba de un portal existente, eliminar portal
                if (idTile != 19)
                {
                    mapaActual.Portales.RemoveAll(p => p.GridX == columna && p.GridY == fila);
                }

                // Si pintamos cualquier cosa arriba de un cofre existente, eliminar cofre
                if (idTile != 20)
                {
                    mapaActual.Cofres.RemoveAll(c => c.GridX == columna && c.GridY == fila);
                }

                // Configurar portal si se selecciona Portal_Lab (19)
                if (idTile == 19)
                {
                    var celdaActual = mapaActual.Grid.Rows[fila].Cells[columna];
                    if (celdaActual.Value != null && celdaActual.Value.ToString() == "19")
                    {
                        // Ya es un portal. Solo ignoramos si estamos arrastrando para no re-abrir
                        if (isMouseDown) return;
                    }

                    var portalExistente = mapaActual.Portales.Find(p => p.GridX == columna && p.GridY == fila);
                    string etiqueta = portalExistente?.Etiqueta ?? $"Portal_{mapaActual.Nombre}_{columna}_{fila}";
                    string destMapa = portalExistente?.DestinoMapa ?? "";
                    string destPortal = portalExistente?.DestinoPortal ?? "";

                    // Obtener lista de mapas del proyecto excepto el actual
                    var mapasDisponibles = new List<string>();
                    foreach (var m in mapaProyectos.Values)
                    {
                        mapasDisponibles.Add(m.Nombre);
                    }

                    using (var formConfig = new FormConfigPortal(etiqueta, destMapa, destPortal, mapasDisponibles))
                    {
                        if (formConfig.ShowDialog() == DialogResult.OK)
                        {
                            if (portalExistente == null)
                            {
                                portalExistente = new PortalConfig { GridX = columna, GridY = fila };
                                mapaActual.Portales.Add(portalExistente);
                            }
                            portalExistente.Etiqueta = formConfig.Etiqueta;
                            portalExistente.DestinoMapa = formConfig.DestinoMapa;
                            portalExistente.DestinoPortal = formConfig.DestinoPortal;
                        }
                        else
                        {
                            // Si cancela la creación del primer portal, no lo colocamos
                            if (portalExistente == null) return;
                        }
                    }
                }

                // Configurar cofre si se selecciona Cofre (20)
                if (idTile == 20)
                {
                    var celdaActual = mapaActual.Grid.Rows[fila].Cells[columna];
                    if (celdaActual.Value != null && celdaActual.Value.ToString() == "20")
                    {
                        // Ya es un cofre. Solo ignoramos si estamos arrastrando para no re-abrir
                        if (isMouseDown) return;
                    }

                    var cofreExistente = mapaActual.Cofres.Find(c => c.GridX == columna && c.GridY == fila);
                    var itemsExistentes = cofreExistente?.Items ?? new Dictionary<string, int>();

                    using (var formConfig = new FormConfigCofre(itemsExistentes))
                    {
                        if (formConfig.ShowDialog() == DialogResult.OK)
                        {
                            if (cofreExistente == null)
                            {
                                cofreExistente = new ChestConfig { GridX = columna, GridY = fila };
                                mapaActual.Cofres.Add(cofreExistente);
                            }
                            cofreExistente.Items = formConfig.ConfiguredItems;
                        }
                        else
                        {
                            // Si cancela la creación del primer cofre, no lo colocamos
                            if (cofreExistente == null) return;
                        }
                    }
                }

                int colorInt = TileConfig.TILE_DICT.ContainsKey(idTile) ? TileConfig.TILE_DICT[idTile].color : 0xFFFFFF;
                Color color = Color.FromArgb(255, (colorInt >> 16) & 0xFF, (colorInt >> 8) & 0xFF, colorInt & 0xFF);

                var celda = mapaActual.Grid.Rows[fila].Cells[columna];
                celda.Style.BackColor = color;
                celda.Style.SelectionBackColor = color;
                celda.Value = idTile;
            }
        }

        private bool ExisteSpawnEnMapa(DataGridView dgv, out int filaExistente, out int colExistente)
        {
            filaExistente = -1;
            colExistente = -1;

            for (int i = 0; i < dgv.RowCount; i++)
            {
                for (int j = 0; j < dgv.ColumnCount; j++)
                {
                    var val = dgv.Rows[i].Cells[j].Value;
                    if (val != null && val.ToString() == "3")
                    {
                        filaExistente = i;
                        colExistente = j;
                        return true;
                    }
                }
            }
            return false;
        }

        private void ColocarEnemigo(int fila, int columna)
        {
            var mapaActual = GetMapaActual();
            if (mapaActual == null) return;

            // Restricción: No colocar en bloques sólidos
            var valCelda = mapaActual.Grid.Rows[fila].Cells[columna].Value;
            if (valCelda != null && int.TryParse(valCelda.ToString(), out int idTile))
            {
                if (TileConfig.TILE_DICT.ContainsKey(idTile) && TileConfig.TILE_DICT[idTile].solido)
                {
                    MessageBox.Show("No puedes colocar un enemigo sobre un bloque sólido.", "Bloque Sólido", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
            }

            var existente = mapaActual.Enemigos.Find(en => en.gridX == columna && en.gridY == fila);

            if (existente != null)
            {
                mapaActual.Enemigos.Remove(existente);
            }
            else
            {
                string claseSeleccionada = cmbClaseBase.SelectedItem as string ?? "BASE";

                // Recoger decoradores marcados desde el HashSet global
                var decs = new List<string>(decoradoresSeleccionados);

                int colorEnemigo = COLORES_CLASE.ContainsKey(claseSeleccionada)
                    ? COLORES_CLASE[claseSeleccionada]
                    : 0xFF6584;

                mapaActual.Enemigos.Add(new EnemigoSpawn
                {
                    type = claseSeleccionada,
                    gridX = columna,
                    gridY = fila,
                    vida = (int)nudVida.Value,
                    velocidad = (int)nudVelocidad.Value,
                    defensa = (int)nudDefensaBase.Value,
                    decoradores = decs.Count > 0 ? decs.ToArray() : null,
                    colorEditor = colorEnemigo,
                    danioBase = (double)nudDanioBase.Value,
                    tipoDanio = cmbTipoDanio.SelectedItem?.ToString() ?? "PORCENTAJE_BASE"
                });
            }
            mapaActual.Grid.InvalidateCell(columna, fila);
        }

        // =======================
        //  EVENTOS DE GRILLAS
        // =======================
        private void DataGridView1_CellMouseDown(object sender, DataGridViewCellMouseEventArgs e)
        {
            if (e.RowIndex >= 0 && e.ColumnIndex >= 0)
            {
                if (e.Button == MouseButtons.Right)
                {
                    // Borrar: Enemigos y Baldosas
                    var mapaActual = GetMapaActual();
                    if (mapaActual != null)
                    {
                        var enemigo = mapaActual.Enemigos.Find(en => en.gridX == e.ColumnIndex && en.gridY == e.RowIndex);
                        if (enemigo != null)
                        {
                            mapaActual.Enemigos.Remove(enemigo);
                            mapaActual.Grid.InvalidateCell(e.ColumnIndex, e.RowIndex);
                        }
                        else if (!modoColocarEnemigo)
                        {
                            // Borramos la celda (poner ID 0 - Suelo)
                            mapaActual.Portales.RemoveAll(p => p.GridX == e.ColumnIndex && p.GridY == e.RowIndex);
                            mapaActual.Cofres.RemoveAll(c => c.GridX == e.ColumnIndex && c.GridY == e.RowIndex);
                            var celda = mapaActual.Grid.Rows[e.RowIndex].Cells[e.ColumnIndex];
                            celda.Value = 0;
                            int colorSuelo = TileConfig.TILE_DICT[0].color;
                            Color c = Color.FromArgb(255, (colorSuelo >> 16) & 0xFF, (colorSuelo >> 8) & 0xFF, colorSuelo & 0xFF);
                            celda.Style.BackColor = c;
                            celda.Style.SelectionBackColor = c;
                        }
                    }
                }
                else if (e.Button == MouseButtons.Left)
                {
                    if (modoColocarEnemigo) ColocarEnemigo(e.RowIndex, e.ColumnIndex);
                    else PintarCelda(e.RowIndex, e.ColumnIndex);
                }
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
            var mapaActual = GetMapaActual();
            if (mapaActual == null) return;

            if (e.RowIndex >= 0 && e.ColumnIndex >= 0)
            {
                var valCelda = e.Value;
                bool esPortal = valCelda != null && valCelda.ToString() == "19";

                if (esPortal)
                {
                    // Dibuja el fondo
                    e.PaintBackground(e.CellBounds, true);

                    // Buscar si tiene destino para elegir color de portal
                    var portal = mapaActual.Portales.Find(p => p.GridX == e.ColumnIndex && p.GridY == e.RowIndex);
                    bool huerfano = portal == null || string.IsNullOrEmpty(portal.DestinoMapa) || string.IsNullOrEmpty(portal.DestinoPortal);

                    // Color: Violeta Fluorescente si es huérfano (Fucsia/Magenta), Violeta normal si tiene enlace
                    Color colorPortal = huerfano ? Color.Magenta : Color.FromArgb(155, 89, 182);

                    using (Brush brush = new SolidBrush(colorPortal))
                    {
                        e.Graphics.FillRectangle(brush, e.CellBounds);
                    }
                    e.Paint(e.CellBounds, DataGridViewPaintParts.Border);
                }
                else
                {
                    e.Paint(e.CellBounds, DataGridViewPaintParts.All);
                }

                // Pintar los enemigos
                var enemigoEnCelda = mapaActual.Enemigos.Find(en => en.gridX == e.ColumnIndex && en.gridY == e.RowIndex);
                if (enemigoEnCelda != null)
                {
                    int c = enemigoEnCelda.colorEditor;
                    Color colorEnemigo = Color.FromArgb(255, (c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF);

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
                var mapaActual = GetMapaActual();
                if (mapaActual != null && mapaActual.Grid.CurrentCell != null && !modoColocarEnemigo)
                {
                    PintarCelda(mapaActual.Grid.CurrentCell.RowIndex, mapaActual.Grid.CurrentCell.ColumnIndex);
                }
            }
        }

        // =======================
        //  BOTONES PANEL DERECHO
        // =======================
        private void BtnCrearMapa_Click(object sender, EventArgs e)
        {
            // Reiniciar el mapa base "principal"
            string input = Microsoft.VisualBasic.Interaction.InputBox("Ingresa el tamaño del mapa principal:", "Nuevo Mapa", "20");
            if (int.TryParse(input, out int tamano))
            {
                var principalTab = tabMapas.TabPages[0];
                if (mapaProyectos.ContainsKey(principalTab))
                {
                    var mapa = mapaProyectos[principalTab];
                    mapa.Enemigos.Clear();
                    mapa.Portales.Clear();
                    mapa.Cofres.Clear();
                    GenerarGrillaInternal(mapa.Grid, tamano);
                }
            }
        }

        private void GenerarGrillaInternal(DataGridView dgv, int tamano)
        {
            GenerarGrillaInterna(dgv, tamano);
        }

        private void BtnNuevoMapa_Click(object sender, EventArgs e)
        {
            string nombre = Microsoft.VisualBasic.Interaction.InputBox("Nombre del sub-mapa (ej: cueva):", "Nuevo Sub-Mapa", "cueva").Trim();
            if (string.IsNullOrEmpty(nombre)) return;

            // Validar que no exista
            foreach (var m in mapaProyectos.Values)
            {
                if (m.Nombre.Equals(nombre, StringComparison.OrdinalIgnoreCase))
                {
                    MessageBox.Show("Ya existe un mapa con ese nombre.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
            }

            string tamanoInput = Microsoft.VisualBasic.Interaction.InputBox("Tamaño del sub-mapa:", "Tamaño", "15");
            if (int.TryParse(tamanoInput, out int tamano))
            {
                CrearNuevaPestañaMapa(nombre, tamano);
            }
        }

        private void BtnEliminarMapa_Click(object sender, EventArgs e)
        {
            var tab = tabMapas.SelectedTab;
            if (tab == null) return;
            if (tab.Text.Equals("principal", StringComparison.OrdinalIgnoreCase))
            {
                MessageBox.Show("No puedes eliminar el mapa principal.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            if (MessageBox.Show($"¿Estás seguro de que deseas eliminar el mapa '{tab.Text}'?", "Confirmar", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
            {
                if (mapaProyectos.ContainsKey(tab))
                {
                    mapaProyectos.Remove(tab);
                }
                tabMapas.TabPages.Remove(tab);
            }
        }

        private void BtnCrearEnemigo_Click(object sender, EventArgs e)
        {
            modoColocarEnemigo = !modoColocarEnemigo;
            var mapaActual = GetMapaActual();

            if (mapaActual != null)
            {
                mapaActual.Grid.Cursor = modoColocarEnemigo ? Cursors.Hand : Cursors.Default;
            }

            if (modoColocarEnemigo)
            {
                BtnCrearEnemigo.BackColor = Color.FromArgb(220, 50, 50);
                BtnCrearEnemigo.Text = "✖ Salir Modo Enemigo";
                BtnCrearMapa.Enabled = false;
                BtnNuevoMapa.Enabled = false;
                comboBox1.Enabled = false;
                btnExportar.Enabled = false;
                SetEstadoControlesEnemigo(true);
            }
            else
            {
                BtnCrearEnemigo.BackColor = Color.FromArgb(0, 122, 204);
                BtnCrearEnemigo.Text = "Modo Enemigo";
                BtnCrearMapa.Enabled = true;
                BtnNuevoMapa.Enabled = true;
                comboBox1.Enabled = true;
                btnExportar.Enabled = true;
                SetEstadoControlesEnemigo(false);
            }
        }

        // ==============================
        //  EXPORTACIÓN DEL NIVEL PACK
        // ==============================
        public string GenerarCodigoJS()
        {
            string js = "export const NIVEL_PACK = {\n";

            int index = 0;
            foreach (var mapa in mapaProyectos.Values)
            {
                js += $"    {mapa.Nombre}: {{\n";

                // --- 1. MATRIZ ---
                js += "        matriz: [\n";
                int rows = mapa.Grid.RowCount;
                int cols = mapa.Grid.ColumnCount;
                for (int i = 0; i < rows; i++)
                {
                    js += "            [";
                    for (int j = 0; j < cols; j++)
                    {
                        var val = mapa.Grid.Rows[i].Cells[j].Value;
                        js += (val != null ? val.ToString() : "0");
                        if (j < cols - 1) js += ", ";
                    }
                    js += "]";
                    if (i < rows - 1) js += ",\n";
                    else js += "\n";
                }
                js += "        ],\n";

                // --- 2. ENEMIGOS (Coherencia total con EnemigoBase) ---
                js += "        enemigos: [\n";
                for (int i = 0; i < mapa.Enemigos.Count; i++)
                {
                    var en = mapa.Enemigos[i];
                    string decsStr = "null";
                    if (en.decoradores != null && en.decoradores.Length > 0)
                    {
                        decsStr = "['" + string.Join("', '", en.decoradores) + "']";
                    }

                    string danioStr = en.danioBase.ToString(System.Globalization.CultureInfo.InvariantCulture);

                    // Exportamos type, tipo, defensa y resistencias vacías para alineación con EnemigoBase.js
                    js += $"            {{ type: '{en.type}', tipo: '{en.type}', gridX: {en.gridX}, gridY: {en.gridY}, vida: {en.vida}, velocidad: {en.velocidad}, defensa: {en.defensa}, resistencias: {{}}, decoradores: {decsStr}, danioBase: {danioStr}, tipoDanio: '{en.tipoDanio}' }}";

                    if (i < mapa.Enemigos.Count - 1) js += ",\n";
                    else js += "\n";
                }
                js += "        ],\n";

                // --- 3. PORTALES ---
                js += "        portales: [\n";
                for (int i = 0; i < mapa.Portales.Count; i++)
                {
                    var p = mapa.Portales[i];
                    js += $"            {{ gridX: {p.GridX}, gridY: {p.GridY}, etiqueta: '{p.Etiqueta}', destinoMapa: '{p.DestinoMapa}', destinoPortal: '{p.DestinoPortal}' }}";

                    if (i < mapa.Portales.Count - 1) js += ",\n";
                    else js += "\n";
                }
                js += "        ],\n";

                // --- 4. COFRES ---
                js += "        cofres: [\n";
                for (int i = 0; i < mapa.Cofres.Count; i++)
                {
                    var c = mapa.Cofres[i];
                    var itemsList = new List<string>();
                    foreach (var kv in c.Items)
                    {
                        itemsList.Add($"'{kv.Key}': {kv.Value}");
                    }
                    string itemsStr = "{" + string.Join(", ", itemsList) + "}";
                    js += $"            {{ gridX: {c.GridX}, gridY: {c.GridY}, items: {itemsStr} }}";

                    if (i < mapa.Cofres.Count - 1) js += ",\n";
                    else js += "\n";
                }
                js += "        ]\n";

                js += "    }";
                if (index < mapaProyectos.Count - 1) js += ",\n";
                else js += "\n";

                index++;
            }

            js += "};\n";
            return js;
        }

        private void btnExportar_Click(object sender, EventArgs e)
        {
            // Validar que el mapa principal exista y tenga Spawn
            MapaData mapaPrincipal = null;
            foreach (var m in mapaProyectos.Values)
            {
                if (m.Nombre == "principal")
                {
                    mapaPrincipal = m;
                    break;
                }
            }

            if (mapaPrincipal == null)
            {
                MessageBox.Show("No se encontró el mapa principal en el proyecto.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            if (!ExisteSpawnEnMapa(mapaPrincipal.Grid, out _, out _))
            {
                MessageBox.Show(
                    "El mapa 'principal' debe tener un Spawn de Kitty (tile cian, ID 3) para poder iniciar el juego.\n\n" +
                    "Selecciona el tile 'Spawn' y colócalo en el mapa principal.",
                    "Falta Spawn",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
                return;
            }

            using (SaveFileDialog dialog = new SaveFileDialog())
            {
                dialog.Filter = "Archivos JavaScript (*.js)|*.js";
                dialog.Title = "Guardar nivel de aventura exportado";
                dialog.FileName = "Nivel_Aventura.js";

                if (dialog.ShowDialog() == DialogResult.OK)
                {
                    string codigoJS = GenerarCodigoJS();
                    System.IO.File.WriteAllText(dialog.FileName, codigoJS);

                    MessageBox.Show("¡Proyecto exportado con éxito en:\n" + dialog.FileName,
                                    "Exportación Exitosa",
                                    MessageBoxButtons.OK,
                                    MessageBoxIcon.Information);
                }
            }
        }
    }
}
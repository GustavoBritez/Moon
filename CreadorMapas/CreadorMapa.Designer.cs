using System.Windows.Forms;

namespace CreadorMapas
{
    partial class CreadorMapa
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        private void InitializeComponent()
        {
            panelPrincipal = new TableLayoutPanel();
            tabMapas = new TabControl();
            panelDerecho = new FlowLayoutPanel();
            BtnCrearMapa = new Button();
            BtnNuevoMapa = new Button();
            BtnEliminarMapa = new Button();
            comboBox1 = new ComboBox();
            BtnCrearEnemigo = new Button();
            lblClaseBase = new Label();
            cmbClaseBase = new ComboBox();
            lblFiltro = new Label();
            txtFiltroDecoradores = new TextBox();
            lblDecorador = new Label();
            chkDecoradores = new CheckedListBox();
            lblVida = new Label();
            nudVida = new NumericUpDown();
            lblVelocidad = new Label();
            nudVelocidad = new NumericUpDown();
            lblDefensa = new Label();
            nudDefensaBase = new NumericUpDown();
            lblDanio = new Label();
            nudDanioBase = new NumericUpDown();
            lblTipoDanio = new Label();
            cmbTipoDanio = new ComboBox();
            btnExportar = new Button();
            panelPrincipal.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)nudVida).BeginInit();
            ((System.ComponentModel.ISupportInitialize)nudVelocidad).BeginInit();
            ((System.ComponentModel.ISupportInitialize)nudDefensaBase).BeginInit();
            ((System.ComponentModel.ISupportInitialize)nudDanioBase).BeginInit();
            SuspendLayout();
            // 
            // panelPrincipal
            // 
            panelPrincipal.ColumnCount = 2;
            panelPrincipal.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            panelPrincipal.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 200F));
            panelPrincipal.Controls.Add(tabMapas, 0, 0);
            panelPrincipal.Controls.Add(panelDerecho, 1, 0);
            panelPrincipal.Dock = DockStyle.Fill;
            panelPrincipal.Location = new Point(0, 0);
            panelPrincipal.Name = "panelPrincipal";
            panelPrincipal.RowCount = 1;
            panelPrincipal.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));
            panelPrincipal.Size = new Size(1150, 650);
            panelPrincipal.TabIndex = 0;
            // 
            // tabMapas
            // 
            tabMapas.Dock = DockStyle.Fill;
            tabMapas.Location = new Point(3, 3);
            tabMapas.Name = "tabMapas";
            tabMapas.SelectedIndex = 0;
            tabMapas.Size = new Size(944, 644);
            tabMapas.TabIndex = 0;
            // 
            // panelDerecho
            // 
            panelDerecho.AutoScroll = true;
            panelDerecho.BackColor = Color.FromArgb(45, 45, 48);
            panelDerecho.Dock = DockStyle.Fill;
            panelDerecho.FlowDirection = FlowDirection.TopDown;
            panelDerecho.WrapContents = false;
            panelDerecho.Padding = new Padding(5);
            panelDerecho.Location = new Point(953, 3);
            panelDerecho.Name = "panelDerecho";
            panelDerecho.Size = new Size(194, 644);
            panelDerecho.TabIndex = 1;
            panelDerecho.Controls.Add(BtnCrearMapa);
            panelDerecho.Controls.Add(BtnNuevoMapa);
            panelDerecho.Controls.Add(BtnEliminarMapa);
            panelDerecho.Controls.Add(comboBox1);
            panelDerecho.Controls.Add(BtnCrearEnemigo);
            panelDerecho.Controls.Add(lblClaseBase);
            panelDerecho.Controls.Add(cmbClaseBase);
            panelDerecho.Controls.Add(lblFiltro);
            panelDerecho.Controls.Add(txtFiltroDecoradores);
            panelDerecho.Controls.Add(lblDecorador);
            panelDerecho.Controls.Add(chkDecoradores);
            panelDerecho.Controls.Add(lblVida);
            panelDerecho.Controls.Add(nudVida);
            panelDerecho.Controls.Add(lblVelocidad);
            panelDerecho.Controls.Add(nudVelocidad);
            panelDerecho.Controls.Add(lblDefensa);
            panelDerecho.Controls.Add(nudDefensaBase);
            panelDerecho.Controls.Add(lblDanio);
            panelDerecho.Controls.Add(nudDanioBase);
            panelDerecho.Controls.Add(lblTipoDanio);
            panelDerecho.Controls.Add(cmbTipoDanio);
            panelDerecho.Controls.Add(btnExportar);
            // 
            // BtnCrearMapa (Inicializar/Reiniciar Principal)
            // 
            BtnCrearMapa.BackColor = Color.FromArgb(0, 122, 204);
            BtnCrearMapa.FlatStyle = FlatStyle.Flat;
            BtnCrearMapa.ForeColor = Color.White;
            BtnCrearMapa.Size = new Size(180, 32);
            BtnCrearMapa.Margin = new Padding(3, 3, 3, 5);
            BtnCrearMapa.Text = "Reiniciar Mapa Base";
            BtnCrearMapa.UseVisualStyleBackColor = false;
            BtnCrearMapa.Click += BtnCrearMapa_Click;
            // 
            // BtnNuevoMapa (Agregar Sub-Mapa)
            // 
            BtnNuevoMapa.BackColor = System.Drawing.Color.SeaGreen;
            BtnNuevoMapa.FlatStyle = FlatStyle.Flat;
            BtnNuevoMapa.ForeColor = Color.White;
            BtnNuevoMapa.Size = new Size(180, 32);
            BtnNuevoMapa.Margin = new Padding(3, 3, 3, 10);
            BtnNuevoMapa.Text = "➕ Añadir Sub-Mapa";
            BtnNuevoMapa.UseVisualStyleBackColor = false;
            BtnNuevoMapa.Click += BtnNuevoMapa_Click;
            // 
            // BtnEliminarMapa
            // 
            BtnEliminarMapa.BackColor = System.Drawing.Color.IndianRed;
            BtnEliminarMapa.FlatStyle = FlatStyle.Flat;
            BtnEliminarMapa.ForeColor = Color.White;
            BtnEliminarMapa.Size = new Size(180, 32);
            BtnEliminarMapa.Margin = new Padding(3, 3, 3, 10);
            BtnEliminarMapa.Text = "🗑️ Eliminar Mapa";
            BtnEliminarMapa.UseVisualStyleBackColor = false;
            BtnEliminarMapa.Click += BtnEliminarMapa_Click;
            // 
            // comboBox1 (Selector de Baldozas)
            // 
            comboBox1.BackColor = Color.FromArgb(62, 62, 66);
            comboBox1.DropDownStyle = ComboBoxStyle.DropDownList;
            comboBox1.FlatStyle = FlatStyle.Flat;
            comboBox1.ForeColor = Color.White;
            comboBox1.Size = new Size(180, 23);
            comboBox1.Margin = new Padding(3, 3, 3, 10);
            // 
            // BtnCrearEnemigo
            // 
            BtnCrearEnemigo.BackColor = Color.FromArgb(0, 122, 204);
            BtnCrearEnemigo.FlatStyle = FlatStyle.Flat;
            BtnCrearEnemigo.ForeColor = Color.White;
            BtnCrearEnemigo.Size = new Size(180, 32);
            BtnCrearEnemigo.Margin = new Padding(3, 5, 3, 3);
            BtnCrearEnemigo.Text = "Modo Enemigo";
            BtnCrearEnemigo.UseVisualStyleBackColor = false;
            BtnCrearEnemigo.Click += BtnCrearEnemigo_Click;
            // 
            // lblClaseBase
            // 
            lblClaseBase.ForeColor = Color.White;
            lblClaseBase.Text = "Clase Base:";
            lblClaseBase.Size = new Size(180, 15);
            lblClaseBase.Margin = new Padding(3, 5, 3, 0);
            // 
            // cmbClaseBase
            // 
            cmbClaseBase.BackColor = Color.FromArgb(62, 62, 66);
            cmbClaseBase.DropDownStyle = ComboBoxStyle.DropDownList;
            cmbClaseBase.FlatStyle = FlatStyle.Flat;
            cmbClaseBase.ForeColor = Color.White;
            cmbClaseBase.Size = new Size(180, 23);
            cmbClaseBase.Margin = new Padding(3, 0, 3, 5);
            // 
            // lblFiltro
            // 
            lblFiltro.ForeColor = Color.White;
            lblFiltro.Text = "Buscar Modificador:";
            lblFiltro.Size = new Size(180, 15);
            lblFiltro.Margin = new Padding(3, 3, 3, 0);
            // 
            // txtFiltroDecoradores
            // 
            txtFiltroDecoradores.BackColor = Color.FromArgb(62, 62, 66);
            txtFiltroDecoradores.ForeColor = Color.White;
            txtFiltroDecoradores.BorderStyle = BorderStyle.FixedSingle;
            txtFiltroDecoradores.Size = new Size(180, 23);
            txtFiltroDecoradores.Margin = new Padding(3, 0, 3, 3);
            // 
            // lblDecorador
            // 
            lblDecorador.ForeColor = Color.White;
            lblDecorador.Text = "Modificadores:";
            lblDecorador.Size = new Size(180, 15);
            lblDecorador.Margin = new Padding(3, 3, 3, 0);
            // 
            // chkDecoradores
            // 
            chkDecoradores.BackColor = Color.FromArgb(62, 62, 66);
            chkDecoradores.ForeColor = Color.White;
            chkDecoradores.BorderStyle = BorderStyle.FixedSingle;
            chkDecoradores.Size = new Size(180, 80);
            chkDecoradores.Margin = new Padding(3, 0, 3, 5);
            // 
            // lblVida
            // 
            lblVida.ForeColor = Color.White;
            lblVida.Text = "Vida:";
            lblVida.Size = new Size(180, 15);
            lblVida.Margin = new Padding(3, 3, 3, 0);
            // 
            // nudVida
            // 
            nudVida.BackColor = Color.FromArgb(62, 62, 66);
            nudVida.ForeColor = Color.White;
            nudVida.Minimum = 1;
            nudVida.Maximum = 10000;
            nudVida.Value = 100;
            nudVida.Size = new Size(180, 23);
            nudVida.Margin = new Padding(3, 0, 3, 3);
            // 
            // lblVelocidad
            // 
            lblVelocidad.ForeColor = Color.White;
            lblVelocidad.Text = "Velocidad:";
            lblVelocidad.Size = new Size(180, 15);
            lblVelocidad.Margin = new Padding(3, 3, 3, 0);
            // 
            // nudVelocidad
            // 
            nudVelocidad.BackColor = Color.FromArgb(62, 62, 66);
            nudVelocidad.ForeColor = Color.White;
            nudVelocidad.Minimum = 10;
            nudVelocidad.Maximum = 1000;
            nudVelocidad.Value = 100;
            nudVelocidad.Size = new Size(180, 23);
            nudVelocidad.Margin = new Padding(3, 0, 3, 3);
            // 
            // lblDefensa
            // 
            lblDefensa.ForeColor = Color.White;
            lblDefensa.Text = "Defensa:";
            lblDefensa.Size = new Size(180, 15);
            lblDefensa.Margin = new Padding(3, 3, 3, 0);
            // 
            // nudDefensaBase
            // 
            nudDefensaBase.BackColor = Color.FromArgb(62, 62, 66);
            nudDefensaBase.ForeColor = Color.White;
            nudDefensaBase.Minimum = 0;
            nudDefensaBase.Maximum = 1000;
            nudDefensaBase.Value = 10;
            nudDefensaBase.Size = new Size(180, 23);
            nudDefensaBase.Margin = new Padding(3, 0, 3, 3);
            // 
            // lblDanio
            // 
            lblDanio.ForeColor = Color.White;
            lblDanio.Text = "Daño Base (%):";
            lblDanio.Size = new Size(180, 15);
            lblDanio.Margin = new Padding(3, 3, 3, 0);
            // 
            // nudDanioBase
            // 
            nudDanioBase.BackColor = Color.FromArgb(62, 62, 66);
            nudDanioBase.ForeColor = Color.White;
            nudDanioBase.Minimum = 1;
            nudDanioBase.Maximum = 100;
            nudDanioBase.Value = 2;
            nudDanioBase.DecimalPlaces = 1;
            nudDanioBase.Size = new Size(180, 23);
            nudDanioBase.Margin = new Padding(3, 0, 3, 3);
            // 
            // lblTipoDanio
            // 
            lblTipoDanio.ForeColor = Color.White;
            lblTipoDanio.Text = "Tipo Daño:";
            lblTipoDanio.Size = new Size(180, 15);
            lblTipoDanio.Margin = new Padding(3, 3, 3, 0);
            // 
            // cmbTipoDanio
            // 
            cmbTipoDanio.BackColor = Color.FromArgb(62, 62, 66);
            cmbTipoDanio.DropDownStyle = ComboBoxStyle.DropDownList;
            cmbTipoDanio.FlatStyle = FlatStyle.Flat;
            cmbTipoDanio.ForeColor = Color.White;
            cmbTipoDanio.Items.AddRange(new object[] { "PORCENTAJE_BASE", "PORCENTAJE_VIDA_TOTAL" });
            cmbTipoDanio.SelectedIndex = 0;
            cmbTipoDanio.Size = new Size(180, 23);
            cmbTipoDanio.Margin = new Padding(3, 0, 3, 10);
            // 
            // btnExportar
            // 
            btnExportar.BackColor = Color.FromArgb(0, 122, 204);
            btnExportar.FlatStyle = FlatStyle.Flat;
            btnExportar.ForeColor = Color.White;
            btnExportar.Size = new Size(180, 32);
            btnExportar.Margin = new Padding(3, 15, 3, 3);
            btnExportar.Text = "Exportar Proyecto";
            btnExportar.UseVisualStyleBackColor = false;
            btnExportar.Click += btnExportar_Click;
            // 
            // CreadorMapa
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.FromArgb(45, 45, 48);
            ClientSize = new Size(1150, 650);
            Controls.Add(panelPrincipal);
            Name = "CreadorMapa";
            Text = "Transformador de Mapas Multicapa";
            panelPrincipal.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)nudVida).EndInit();
            ((System.ComponentModel.ISupportInitialize)nudVelocidad).EndInit();
            ((System.ComponentModel.ISupportInitialize)nudDefensaBase).EndInit();
            ((System.ComponentModel.ISupportInitialize)nudDanioBase).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private TableLayoutPanel panelPrincipal;
        private TabControl tabMapas;
        private FlowLayoutPanel panelDerecho;
        private Button BtnCrearMapa;
        private Button BtnNuevoMapa;
        private Button BtnEliminarMapa;
        private ComboBox comboBox1;
        private Button BtnCrearEnemigo;
        private Label lblClaseBase;
        private ComboBox cmbClaseBase;
        private Label lblFiltro;
        private TextBox txtFiltroDecoradores;
        private Label lblDecorador;
        private CheckedListBox chkDecoradores;
        private Label lblVida;
        private NumericUpDown nudVida;
        private Label lblVelocidad;
        private NumericUpDown nudVelocidad;
        private Label lblDefensa;
        private NumericUpDown nudDefensaBase;
        private Label lblDanio;
        private NumericUpDown nudDanioBase;
        private Label lblTipoDanio;
        private ComboBox cmbTipoDanio;
        private Button btnExportar;
    }
}
using System.Windows.Forms;

namespace CreadorMapas
{
    partial class CreadorMapa
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            DataGridViewCellStyle dataGridViewCellStyle2 = new DataGridViewCellStyle();
            tableLayoutPanel1 = new TableLayoutPanel();
            dataGridView1 = new DataGridView();
            cmbEnemigos = new ComboBox();
            BtnCrearMapa = new Button();
            comboBox1 = new ComboBox();
            BtnCrearEnemigo = new Button();
            btnExportar = new Button();
            tableLayoutPanel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridView1).BeginInit();
            SuspendLayout();
            // 
            // tableLayoutPanel1
            // 
            tableLayoutPanel1.ColumnCount = 2;
            tableLayoutPanel1.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 83.33333F));
            tableLayoutPanel1.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 16.6666679F));
            tableLayoutPanel1.Controls.Add(btnExportar, 1, 4);
            tableLayoutPanel1.Controls.Add(dataGridView1, 0, 0);
            tableLayoutPanel1.Controls.Add(cmbEnemigos, 1, 3);
            tableLayoutPanel1.Controls.Add(BtnCrearMapa, 1, 0);
            tableLayoutPanel1.Controls.Add(comboBox1, 1, 1);
            tableLayoutPanel1.Controls.Add(BtnCrearEnemigo, 1, 2);
            tableLayoutPanel1.Dock = DockStyle.Fill;
            tableLayoutPanel1.Location = new Point(0, 0);
            tableLayoutPanel1.Name = "tableLayoutPanel1";
            tableLayoutPanel1.RowCount = 4;
            tableLayoutPanel1.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));
            tableLayoutPanel1.RowStyles.Add(new RowStyle(SizeType.Absolute, 37F));
            tableLayoutPanel1.RowStyles.Add(new RowStyle(SizeType.Absolute, 43F));
            tableLayoutPanel1.RowStyles.Add(new RowStyle(SizeType.Absolute, 37F));
            tableLayoutPanel1.RowStyles.Add(new RowStyle(SizeType.Absolute, 316F));
            tableLayoutPanel1.Size = new Size(951, 469);
            tableLayoutPanel1.TabIndex = 0;
            // 
            // dataGridView1
            // 
            dataGridView1.AllowUserToAddRows = false;
            dataGridView1.AllowUserToResizeColumns = false;
            dataGridView1.AllowUserToResizeRows = false;
            dataGridView1.BackgroundColor = Color.FromArgb(30, 30, 30);
            dataGridView1.ColumnHeadersVisible = false;
            dataGridViewCellStyle2.Alignment = DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle2.BackColor = SystemColors.Window;
            dataGridViewCellStyle2.Font = new Font("Segoe UI", 9F);
            dataGridViewCellStyle2.ForeColor = SystemColors.ControlText;
            dataGridViewCellStyle2.SelectionBackColor = Color.FromArgb(150, 255, 255, 255);
            dataGridViewCellStyle2.SelectionForeColor = SystemColors.HighlightText;
            dataGridViewCellStyle2.WrapMode = DataGridViewTriState.False;
            dataGridView1.DefaultCellStyle = dataGridViewCellStyle2;
            dataGridView1.Dock = DockStyle.Fill;
            dataGridView1.GridColor = Color.FromArgb(62, 62, 66);
            dataGridView1.Location = new Point(3, 3);
            dataGridView1.Name = "dataGridView1";
            dataGridView1.ReadOnly = true;
            dataGridView1.RowHeadersVisible = false;
            tableLayoutPanel1.SetRowSpan(dataGridView1, 5);
            dataGridView1.Size = new Size(786, 463);
            dataGridView1.TabIndex = 0;
            dataGridView1.CellMouseEnter += DataGridView1_CellMouseEnter;
            // 
            // cmbEnemigos
            // 
            cmbEnemigos.BackColor = Color.FromArgb(62, 62, 66);
            cmbEnemigos.Dock = DockStyle.Top;
            cmbEnemigos.DropDownStyle = ComboBoxStyle.DropDownList;
            cmbEnemigos.FlatStyle = FlatStyle.Flat;
            cmbEnemigos.ForeColor = Color.White;
            cmbEnemigos.Items.AddRange(new object[] { "Suelo (0)", "Pared Base (1)", "Lava (9)", "Pasto (12)" });
            cmbEnemigos.Location = new Point(795, 119);
            cmbEnemigos.Name = "cmbEnemigos";
            cmbEnemigos.Size = new Size(153, 23);
            cmbEnemigos.TabIndex = 4;
            // 
            // BtnCrearMapa
            // 
            BtnCrearMapa.BackColor = Color.FromArgb(0, 122, 204);
            BtnCrearMapa.Dock = DockStyle.Fill;
            BtnCrearMapa.FlatStyle = FlatStyle.Flat;
            BtnCrearMapa.ForeColor = Color.White;
            BtnCrearMapa.Location = new Point(795, 3);
            BtnCrearMapa.Name = "BtnCrearMapa";
            BtnCrearMapa.Size = new Size(153, 30);
            BtnCrearMapa.TabIndex = 1;
            BtnCrearMapa.Text = "Crear Mapa";
            BtnCrearMapa.UseVisualStyleBackColor = false;
            BtnCrearMapa.Click += BtnCrearMapa_Click;
            // 
            // comboBox1
            // 
            comboBox1.BackColor = Color.FromArgb(62, 62, 66);
            comboBox1.Dock = DockStyle.Top;
            comboBox1.DropDownStyle = ComboBoxStyle.DropDownList;
            comboBox1.FlatStyle = FlatStyle.Flat;
            comboBox1.ForeColor = Color.White;
            comboBox1.Items.AddRange(new object[] { "Suelo (0)", "Pared Base (1)", "Lava (9)", "Pasto (12)" });
            comboBox1.Location = new Point(795, 39);
            comboBox1.Name = "comboBox1";
            comboBox1.Size = new Size(153, 23);
            comboBox1.TabIndex = 2;
            // 
            // BtnCrearEnemigo
            // 
            BtnCrearEnemigo.Anchor = AnchorStyles.Top;
            BtnCrearEnemigo.BackColor = Color.FromArgb(0, 122, 204);
            BtnCrearEnemigo.FlatStyle = FlatStyle.Flat;
            BtnCrearEnemigo.ForeColor = Color.White;
            BtnCrearEnemigo.Location = new Point(795, 76);
            BtnCrearEnemigo.Name = "BtnCrearEnemigo";
            BtnCrearEnemigo.Size = new Size(153, 32);
            BtnCrearEnemigo.TabIndex = 3;
            BtnCrearEnemigo.Text = "Crear Enemigo";
            BtnCrearEnemigo.UseVisualStyleBackColor = false;
            BtnCrearEnemigo.Click += BtnCrearEnemigo_Click;
            // 
            // btnExportar
            // 
            btnExportar.Anchor = AnchorStyles.Top;
            btnExportar.BackColor = Color.FromArgb(0, 122, 204);
            btnExportar.FlatStyle = FlatStyle.Flat;
            btnExportar.ForeColor = Color.White;
            btnExportar.Location = new Point(795, 156);
            btnExportar.Name = "btnExportar";
            btnExportar.Size = new Size(153, 32);
            btnExportar.TabIndex = 5;
            btnExportar.Text = "Exportar";
            btnExportar.UseVisualStyleBackColor = false;
            btnExportar.Click += btnExportar_Click;
            // 
            // CreadorMapa
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.FromArgb(45, 45, 48);
            ClientSize = new Size(951, 469);
            Controls.Add(tableLayoutPanel1);
            Name = "CreadorMapa";
            Text = "Transformador Mapa";
            tableLayoutPanel1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)dataGridView1).EndInit();
            ResumeLayout(false);
        }
        TableLayoutPanel tableLayoutPanel1;
        DataGridView dataGridView1;
        Button BtnCrearMapa;
        ComboBox comboBox1;
        #endregion

        private ComboBox cmbEnemigos;
        private Button BtnCrearEnemigo;
        private Button btnExportar;
    }
}
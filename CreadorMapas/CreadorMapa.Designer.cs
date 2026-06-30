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
            DataGridViewCellStyle dataGridViewCellStyle1 = new DataGridViewCellStyle();
            tableLayoutPanel1 = new TableLayoutPanel();
            Lista_Enemigos = new ComboBox();
            dataGridView1 = new DataGridView();
            BtnCrearMapa = new Button();
            comboBox1 = new ComboBox();
            BtnCrearEnemigo = new Button();
            tableLayoutPanel1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)dataGridView1).BeginInit();
            SuspendLayout();
            // 
            // tableLayoutPanel1
            // 
            tableLayoutPanel1.ColumnCount = 2;
            tableLayoutPanel1.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 83.33333F));
            tableLayoutPanel1.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 16.6666679F));
            tableLayoutPanel1.Controls.Add(Lista_Enemigos, 1, 3);
            tableLayoutPanel1.Controls.Add(dataGridView1, 0, 0);
            tableLayoutPanel1.Controls.Add(BtnCrearMapa, 1, 0);
            tableLayoutPanel1.Controls.Add(comboBox1, 1, 1);
            tableLayoutPanel1.Controls.Add(BtnCrearEnemigo, 1, 2);
            tableLayoutPanel1.Dock = DockStyle.Fill;
            tableLayoutPanel1.Location = new Point(0, 0);
            tableLayoutPanel1.Name = "tableLayoutPanel1";
            tableLayoutPanel1.RowCount = 3;
            tableLayoutPanel1.RowStyles.Add(new RowStyle(SizeType.Percent, 100F));
            tableLayoutPanel1.RowStyles.Add(new RowStyle(SizeType.Absolute, 37F));
            tableLayoutPanel1.RowStyles.Add(new RowStyle(SizeType.Absolute, 43F));
            tableLayoutPanel1.RowStyles.Add(new RowStyle(SizeType.Absolute, 333F));
            tableLayoutPanel1.Size = new Size(951, 450);
            tableLayoutPanel1.TabIndex = 0;
            // 
            // Lista_Enemigos
            // 
            Lista_Enemigos.BackColor = Color.FromArgb(62, 62, 66);
            Lista_Enemigos.Dock = DockStyle.Top;
            Lista_Enemigos.DropDownStyle = ComboBoxStyle.DropDownList;
            Lista_Enemigos.FlatStyle = FlatStyle.Flat;
            Lista_Enemigos.ForeColor = Color.White;
            Lista_Enemigos.Items.AddRange(new object[] { "Suelo (0)", "Pared Base (1)", "Lava (9)", "Pasto (12)" });
            Lista_Enemigos.Location = new Point(795, 120);
            Lista_Enemigos.Name = "Lista_Enemigos";
            Lista_Enemigos.Size = new Size(153, 23);
            Lista_Enemigos.TabIndex = 4;
            // 
            // dataGridView1
            // 
            dataGridView1.AllowUserToAddRows = false;
            dataGridView1.AllowUserToResizeColumns = false;
            dataGridView1.AllowUserToResizeRows = false;
            dataGridView1.BackgroundColor = Color.FromArgb(30, 30, 30);
            dataGridView1.ColumnHeadersVisible = false;
            dataGridViewCellStyle1.Alignment = DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle1.BackColor = SystemColors.Window;
            dataGridViewCellStyle1.Font = new Font("Segoe UI", 9F);
            dataGridViewCellStyle1.ForeColor = SystemColors.ControlText;
            dataGridViewCellStyle1.SelectionBackColor = Color.FromArgb(150, 255, 255, 255);
            dataGridViewCellStyle1.SelectionForeColor = SystemColors.HighlightText;
            dataGridViewCellStyle1.WrapMode = DataGridViewTriState.False;
            dataGridView1.DefaultCellStyle = dataGridViewCellStyle1;
            dataGridView1.Dock = DockStyle.Fill;
            dataGridView1.GridColor = Color.FromArgb(62, 62, 66);
            dataGridView1.Location = new Point(3, 3);
            dataGridView1.Name = "dataGridView1";
            dataGridView1.ReadOnly = true;
            dataGridView1.RowHeadersVisible = false;
            tableLayoutPanel1.SetRowSpan(dataGridView1, 4);
            dataGridView1.Size = new Size(786, 444);
            dataGridView1.TabIndex = 0;
            //dataGridView1.CellMouseDown += DataGridView1_CellMouseDown;
            dataGridView1.CellMouseEnter += DataGridView1_CellMouseEnter;
            //dataGridView1.KeyDown += DataGridView1_KeyDown_1;
            // 
            // BtnCrearMapa
            // 
            BtnCrearMapa.BackColor = Color.FromArgb(0, 122, 204);
            BtnCrearMapa.Dock = DockStyle.Fill;
            BtnCrearMapa.FlatStyle = FlatStyle.Flat;
            BtnCrearMapa.ForeColor = Color.White;
            BtnCrearMapa.Location = new Point(795, 3);
            BtnCrearMapa.Name = "BtnCrearMapa";
            BtnCrearMapa.Size = new Size(153, 31);
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
            comboBox1.Location = new Point(795, 40);
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
            BtnCrearEnemigo.Location = new Point(795, 77);
            BtnCrearEnemigo.Name = "BtnCrearEnemigo";
            BtnCrearEnemigo.Size = new Size(153, 32);
            BtnCrearEnemigo.TabIndex = 3;
            BtnCrearEnemigo.Text = "Crear Enemigo";
            BtnCrearEnemigo.UseVisualStyleBackColor = false;
            BtnCrearEnemigo.Click += BtnCrearEnemigo_Click;
            // 
            // CreadorMapa
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.FromArgb(45, 45, 48);
            ClientSize = new Size(951, 450);
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

        private ComboBox Lista_Enemigos;
        private Button BtnCrearEnemigo;
    }
}
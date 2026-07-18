using System;
using System.Collections.Generic;
using System.Windows.Forms;

namespace CreadorMapas
{
    public class FormConfigCofre : Form
    {
        private Dictionary<string, NumericUpDown> controls = new Dictionary<string, NumericUpDown>();
        private Label lblTotal;
        private Button btnAceptar;
        private Button btnCancelar;

        public Dictionary<string, int> ConfiguredItems { get; private set; } = new Dictionary<string, int>();

        public FormConfigCofre(Dictionary<string, int> itemsExistentes)
        {
            InitializeComponent();

            // Cargar valores existentes si existen
            if (itemsExistentes != null)
            {
                foreach (var kv in itemsExistentes)
                {
                    if (controls.ContainsKey(kv.Key))
                    {
                        controls[kv.Key].Value = Math.Min(kv.Value, 10);
                    }
                }
            }
            ActualizarTotal();
        }

        private void InitializeComponent()
        {
            this.Text = "Configurar Recompensas del Cofre";
            this.Size = new System.Drawing.Size(340, 360);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.StartPosition = FormStartPosition.CenterParent;
            this.BackColor = System.Drawing.Color.FromArgb(45, 45, 48);
            this.ForeColor = System.Drawing.Color.White;

            var itemsList = new List<(string Key, string DisplayName)>
            {
                ("cafe", "☕ Café"),
                ("nube", "☁️ Nubes"),
                ("botiquin", "🧪 Botiquín"),
                ("escudo", "🛡️ Escudo"),
                ("arma_doble", "雙 Arma Doble"),
                ("arma_rebotadora", "🪃 Arma Rebotadora")
            };

            int startY = 20;
            int spacingY = 35;

            for (int i = 0; i < itemsList.Count; i++)
            {
                var item = itemsList[i];
                var lbl = new Label
                {
                    Text = item.DisplayName + ":",
                    Location = new System.Drawing.Point(20, startY + (i * spacingY)),
                    Size = new System.Drawing.Size(150, 20),
                    TextAlign = System.Drawing.ContentAlignment.MiddleLeft
                };
                this.Controls.Add(lbl);

                var nud = new NumericUpDown
                {
                    Location = new System.Drawing.Point(180, startY + (i * spacingY)),
                    Size = new System.Drawing.Size(120, 23),
                    Minimum = 0,
                    Maximum = 10,
                    Value = 0,
                    BackColor = System.Drawing.Color.FromArgb(62, 62, 66),
                    ForeColor = System.Drawing.Color.White,
                    BorderStyle = BorderStyle.FixedSingle
                };
                nud.ValueChanged += Nud_ValueChanged;
                this.Controls.Add(nud);
                controls.Add(item.Key, nud);
            }

            lblTotal = new Label
            {
                Text = "Total de ítems: 0/10 (Máx. 10)",
                Location = new System.Drawing.Point(20, startY + (itemsList.Count * spacingY) + 5),
                Size = new System.Drawing.Size(280, 20),
                Font = new System.Drawing.Font(this.Font, System.Drawing.FontStyle.Bold)
            };
            this.Controls.Add(lblTotal);

            btnAceptar = new Button
            {
                Text = "Aceptar",
                Location = new System.Drawing.Point(120, 280),
                Size = new System.Drawing.Size(80, 30),
                DialogResult = DialogResult.OK,
                BackColor = System.Drawing.Color.FromArgb(0, 122, 204),
                FlatStyle = FlatStyle.Flat
            };
            btnAceptar.Click += BtnAceptar_Click;

            btnCancelar = new Button
            {
                Text = "Cancelar",
                Location = new System.Drawing.Point(220, 280),
                Size = new System.Drawing.Size(80, 30),
                DialogResult = DialogResult.Cancel,
                BackColor = System.Drawing.Color.FromArgb(62, 62, 66),
                FlatStyle = FlatStyle.Flat
            };

            this.Controls.AddRange(new Control[] { btnAceptar, btnCancelar });
            this.AcceptButton = btnAceptar;
            this.CancelButton = btnCancelar;
        }

        private void Nud_ValueChanged(object sender, EventArgs e)
        {
            ActualizarTotal();
        }

        private int GetTotalItems()
        {
            int total = 0;
            foreach (var nud in controls.Values)
            {
                total += (int)nud.Value;
            }
            return total;
        }

        private void ActualizarTotal()
        {
            int total = GetTotalItems();
            lblTotal.Text = $"Total de ítems: {total}/10 (Máx. 10)";
            if (total > 10)
            {
                lblTotal.ForeColor = System.Drawing.Color.FromArgb(255, 100, 100);
                btnAceptar.Enabled = false;
            }
            else
            {
                lblTotal.ForeColor = System.Drawing.Color.White;
                btnAceptar.Enabled = true;
            }
        }

        private void BtnAceptar_Click(object sender, EventArgs e)
        {
            int total = GetTotalItems();
            if (total > 10)
            {
                MessageBox.Show("El cofre no puede contener más de 10 ítems en total.", "Límite Excedido", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                this.DialogResult = DialogResult.None;
                return;
            }

            ConfiguredItems.Clear();
            foreach (var kv in controls)
            {
                if (kv.Value.Value > 0)
                {
                    ConfiguredItems.Add(kv.Key, (int)kv.Value.Value);
                }
            }
        }
    }
}

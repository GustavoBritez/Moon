using System;
using System.Collections.Generic;
using System.Windows.Forms;

namespace CreadorMapas
{
    public class FormConfigPortal : Form
    {
        private Label lblEtiqueta;
        private TextBox txtEtiqueta;
        private Label lblMapaDestino;
        private ComboBox cmbMapaDestino;
        private Label lblPortalDestino;
        private TextBox txtPortalDestino;
        private Button btnAceptar;
        private Button btnCancelar;

        public string Etiqueta => txtEtiqueta.Text.Trim();
        public string DestinoMapa => cmbMapaDestino.SelectedItem?.ToString() == "Ninguno (Huérfano)" ? "" : cmbMapaDestino.SelectedItem?.ToString() ?? "";
        public string DestinoPortal => txtPortalDestino.Text.Trim();

        public FormConfigPortal(string etiquetaActual, string destinoMapaActual, string destinoPortalActual, List<string> mapasDisponibles)
        {
            InitializeComponent(mapasDisponibles);

            // Cargar valores actuales
            txtEtiqueta.Text = etiquetaActual;
            txtPortalDestino.Text = destinoPortalActual;

            int index = cmbMapaDestino.Items.IndexOf(destinoMapaActual);
            if (index >= 0)
            {
                cmbMapaDestino.SelectedIndex = index;
            }
            else
            {
                cmbMapaDestino.SelectedIndex = 0; // "Ninguno (Huérfano)"
            }
        }

        private void InitializeComponent(List<string> mapasDisponibles)
        {
            this.Text = "Configurar Portal_Lab";
            this.Size = new System.Drawing.Size(320, 240);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.StartPosition = FormStartPosition.CenterParent;
            this.BackColor = System.Drawing.Color.FromArgb(45, 45, 48);
            this.ForeColor = System.Drawing.Color.White;

            lblEtiqueta = new Label { Text = "Etiqueta Única del Portal:", Location = new System.Drawing.Point(20, 20), Size = new System.Drawing.Size(260, 20) };
            txtEtiqueta = new TextBox { Location = new System.Drawing.Point(20, 40), Size = new System.Drawing.Size(260, 23), BackColor = System.Drawing.Color.FromArgb(62, 62, 66), ForeColor = System.Drawing.Color.White, BorderStyle = BorderStyle.FixedSingle };

            lblMapaDestino = new Label { Text = "Mapa Destino:", Location = new System.Drawing.Point(20, 75), Size = new System.Drawing.Size(260, 20) };
            cmbMapaDestino = new ComboBox { Location = new System.Drawing.Point(20, 95), Size = new System.Drawing.Size(260, 23), DropDownStyle = ComboBoxStyle.DropDownList, BackColor = System.Drawing.Color.FromArgb(62, 62, 66), ForeColor = System.Drawing.Color.White, FlatStyle = FlatStyle.Flat };
            
            cmbMapaDestino.Items.Add("Ninguno (Huérfano)");
            foreach (var mapa in mapasDisponibles)
            {
                cmbMapaDestino.Items.Add(mapa);
            }

            lblPortalDestino = new Label { Text = "Etiqueta del Portal Destino:", Location = new System.Drawing.Point(20, 130), Size = new System.Drawing.Size(260, 20) };
            txtPortalDestino = new TextBox { Location = new System.Drawing.Point(20, 150), Size = new System.Drawing.Size(260, 23), BackColor = System.Drawing.Color.FromArgb(62, 62, 66), ForeColor = System.Drawing.Color.White, BorderStyle = BorderStyle.FixedSingle };

            btnAceptar = new Button { Text = "Aceptar", Location = new System.Drawing.Point(120, 190), Size = new System.Drawing.Size(80, 30), DialogResult = DialogResult.OK, BackColor = System.Drawing.Color.FromArgb(0, 122, 204), FlatStyle = FlatStyle.Flat };
            btnCancelar = new Button { Text = "Cancelar", Location = new System.Drawing.Point(205, 190), Size = new System.Drawing.Size(80, 30), DialogResult = DialogResult.Cancel, BackColor = System.Drawing.Color.FromArgb(62, 62, 66), FlatStyle = FlatStyle.Flat };

            this.Controls.AddRange(new Control[] { lblEtiqueta, txtEtiqueta, lblMapaDestino, cmbMapaDestino, lblPortalDestino, txtPortalDestino, btnAceptar, btnCancelar });

            this.AcceptButton = btnAceptar;
            this.CancelButton = btnCancelar;
        }
    }
}

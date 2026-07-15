export class UIManager {
    constructor(capaUI) {
        this.capaUI = capaUI;

        this.barraVidaFondo = null;
        this.barraVidaRelleno = null;
        this.textoVida = null;

        this.vidaCacheada = -1;
        this.parpadeoTimer = 0;

        this.inicializarElementos();
    }

    inicializarElementos() {
        // 1. Barra de vida - Fondo gris
        this.barraVidaFondo = new PIXI.Graphics();
        this.barraVidaFondo.beginFill(0x333333, 0.8);
        this.barraVidaFondo.drawRoundedRect(0, 0, 200, 22, 6);
        this.barraVidaFondo.endFill();
        this.barraVidaFondo.x = 20;
        this.barraVidaFondo.y = 20;
        this.capaUI.addChild(this.barraVidaFondo);

        // 2. Barra de vida - Relleno rojo
        this.barraVidaRelleno = new PIXI.Graphics();
        this.barraVidaRelleno.x = 20;
        this.barraVidaRelleno.y = 20;
        this.capaUI.addChild(this.barraVidaRelleno);

        // 3. Texto HP superpuesto
        this.textoVida = new PIXI.Text('HP: 100/100', {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 2,
            dropShadowDistance: 1
        });
        this.textoVida.x = 20 + 100;
        this.textoVida.y = 22;
        this.textoVida.anchor.set(0.5, 0);
        this.capaUI.addChild(this.textoVida);
    }

    actualizar(player) {
        if (!player) return;

        if (player.vidaActual !== this.vidaCacheada) {
            this.actualizarBarraVida(player);
            this.vidaCacheada = player.vidaActual;
        }
    }

    actualizarBarraVida(player) {
        this.barraVidaRelleno.clear();

        const porcentaje = Math.max(0, player.vidaActual / player.vidaMaxima);
        const anchoRelleno = porcentaje * 200;

        // Color progresivo: Verde > Amarillo > Rojo
        let colorBarra;
        if (porcentaje > 0.5) {
            colorBarra = 0xe74c3c; // Rojo estándar
        } else if (porcentaje > 0.25) {
            colorBarra = 0xc0392b; // Rojo más oscuro
        } else {
            colorBarra = 0x8b0000; // Rojo crítico
        }

        this.barraVidaRelleno.beginFill(colorBarra);
        this.barraVidaRelleno.drawRoundedRect(0, 0, anchoRelleno, 22, 6);
        this.barraVidaRelleno.endFill();

        // Brillito superior
        this.barraVidaRelleno.beginFill(0xffffff, 0.2);
        this.barraVidaRelleno.drawRoundedRect(2, 2, anchoRelleno - 4, 8, 4);
        this.barraVidaRelleno.endFill();

        // Texto
        const vidaRedondeada = Math.ceil(player.vidaActual);
        this.textoVida.text = `HP: ${vidaRedondeada}/${player.vidaMaxima}`;

        // Parpadeo si vida crítica (< 25%)
        if (porcentaje < 0.25 && porcentaje > 0) {
            this.barraVidaRelleno.alpha = 0.5 + Math.abs(Math.sin(performance.now() / 200)) * 0.5;
        } else {
            this.barraVidaRelleno.alpha = 1;
        }
    }

    mostrarMensajeFlotante(texto, x, y) {
        const mensaje = new PIXI.Text(texto, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xFFFF00,
            fontWeight: 'bold'
        });

        mensaje.x = x;
        mensaje.y = y;
        this.capaUI.addChild(mensaje);

        const animarMensaje = () => {
            mensaje.y -= 1;
            mensaje.alpha -= 0.02;

            if (mensaje.alpha <= 0) {
                PIXI.Ticker.shared.remove(animarMensaje);
                mensaje.destroy();
            }
        };

        PIXI.Ticker.shared.add(animarMensaje);
    }

    reajustarUI(ancho, alto) {
        // Los elementos ya usan posiciones absolutas, no necesitan ajuste extra
    }

    destroy() {
        if (this.barraVidaFondo) { this.barraVidaFondo.destroy(true); this.barraVidaFondo = null; }
        if (this.barraVidaRelleno) { this.barraVidaRelleno.destroy(true); this.barraVidaRelleno = null; }
        if (this.textoVida) { this.textoVida.destroy(true); this.textoVida = null; }

        if (this.capaUI) {
            this.capaUI.removeChildren();
            this.capaUI = null;
        }
    }
}
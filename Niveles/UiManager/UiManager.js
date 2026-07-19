export class UIManager {
    constructor(capaUI, capaEntidades) {
        this.capaUI = capaUI;
        this.capaEntidades = capaEntidades || capaUI;

        this.barraVidaFondo = null;
        this.barraVidaRelleno = null;
        this.textoVida = null;

        this.barraXpFondo = null;
        this.barraXpRelleno = null;
        this.textoXp = null;

        this.vidaCacheada = -1;
        this.xpCacheada = -1;
        this.lvlCacheada = -1;
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

        // 4. Barra de XP - Fondo gris
        this.barraXpFondo = new PIXI.Graphics();
        this.barraXpFondo.beginFill(0x333333, 0.8);
        this.barraXpFondo.drawRoundedRect(0, 0, 200, 14, 4);
        this.barraXpFondo.endFill();
        this.barraXpFondo.x = 20;
        this.barraXpFondo.y = 48; // Bajo la barra de salud (20 + 22 + 6 margen)
        this.capaUI.addChild(this.barraXpFondo);

        // 5. Barra de XP - Relleno azul
        this.barraXpRelleno = new PIXI.Graphics();
        this.barraXpRelleno.x = 20;
        this.barraXpRelleno.y = 48;
        this.capaUI.addChild(this.barraXpRelleno);

        // 6. Texto XP superpuesto
        this.textoXp = new PIXI.Text('LVL 1 - XP: 0.00/2.00', {
            fontFamily: 'Arial',
            fontSize: 10,
            fill: 0x00d2ff,
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 2,
            dropShadowDistance: 1
        });
        this.textoXp.x = 20 + 100;
        this.textoXp.y = 49;
        this.textoXp.anchor.set(0.5, 0);
        this.capaUI.addChild(this.textoXp);
    }

    actualizar(player) {
        if (!player) return;

        const lvl = window.playerState.nivel || 1;
        const xp = window.playerState.xpActual || 0.0;

        if (player.vidaActual !== this.vidaCacheada) {
            this.actualizarBarraVida(player);
            this.vidaCacheada = player.vidaActual;
        }

        if (xp !== this.xpCacheada || lvl !== this.lvlCacheada) {
            this.actualizarBarraXp(lvl, xp);
            this.xpCacheada = xp;
            this.lvlCacheada = lvl;
        }
    }

    actualizarBarraXp(lvl, xp) {
        this.barraXpRelleno.clear();

        const req = Math.pow(2, lvl);
        const porcentaje = Math.max(0, Math.min(1, xp / req));
        const anchoRelleno = porcentaje * 200;

        const colorBarra = 0x2980b9; // Azul brillante

        this.barraXpRelleno.beginFill(colorBarra);
        this.barraXpRelleno.drawRoundedRect(0, 0, anchoRelleno, 14, 4);
        this.barraXpRelleno.endFill();

        // Brillito superior
        this.barraXpRelleno.beginFill(0xffffff, 0.15);
        this.barraXpRelleno.drawRoundedRect(2, 1, anchoRelleno - 4, 5, 2);
        this.barraXpRelleno.endFill();

        // Texto
        this.textoXp.text = `LVL ${lvl} - XP: ${xp.toFixed(2)}/${req.toFixed(2)}`;
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
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 2,
            dropShadowDistance: 1
        });

        mensaje.x = x;
        mensaje.y = y;
        this.capaEntidades.addChild(mensaje);

        const ticker = window.orquestador?.currentEngine?.app?.ticker || PIXI.Ticker.shared;

        const animarMensaje = () => {
            mensaje.y -= 1;
            mensaje.alpha -= 0.02;

            if (mensaje.alpha <= 0) {
                ticker.remove(animarMensaje);
                mensaje.destroy();
            }
        };

        ticker.add(animarMensaje);
    }

    reajustarUI(ancho, alto) {
        // Los elementos ya usan posiciones absolutas, no necesitan ajuste extra
    }

    destroy() {
        if (this.barraVidaFondo) { this.barraVidaFondo.destroy(true); this.barraVidaFondo = null; }
        if (this.barraVidaRelleno) { this.barraVidaRelleno.destroy(true); this.barraVidaRelleno = null; }
        if (this.textoVida) { this.textoVida.destroy(true); this.textoVida = null; }
        if (this.barraXpFondo) { this.barraXpFondo.destroy(true); this.barraXpFondo = null; }
        if (this.barraXpRelleno) { this.barraXpRelleno.destroy(true); this.barraXpRelleno = null; }
        if (this.textoXp) { this.textoXp.destroy(true); this.textoXp = null; }

        if (this.capaUI) {
            this.capaUI.removeChildren();
            this.capaUI = null;
        }
    }
}
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
        
        this.barraUltFondo = null;
        this.barraUltRelleno = null;
        this.textoUlt = null;

        this.vidaCacheada = -1;
        this.xpCacheada = -1;
        this.lvlCacheada = -1;
        this.ultCacheada = -1;
        this.cd1Cacheado = -1;
        this.cd2Cacheado = -1;
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
        
        // 7. Barra de Ultimate - Fondo gris
        this.barraUltFondo = new PIXI.Graphics();
        this.barraUltFondo.beginFill(0x333333, 0.8);
        this.barraUltFondo.drawRoundedRect(0, 0, 200, 14, 4);
        this.barraUltFondo.endFill();
        this.barraUltFondo.x = 20;
        this.barraUltFondo.y = 66; // Bajo la barra de XP
        this.capaUI.addChild(this.barraUltFondo);

        // 8. Barra de Ultimate - Relleno amarillo/oro
        this.barraUltRelleno = new PIXI.Graphics();
        this.barraUltRelleno.x = 20;
        this.barraUltRelleno.y = 66;
        this.capaUI.addChild(this.barraUltRelleno);

        // 9. Texto Ultimate superpuesto
        this.textoUlt = new PIXI.Text('ULTIMATE [R]: 0%', {
            fontFamily: 'Arial',
            fontSize: 10,
            fill: 0xf1c40f,
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 2,
            dropShadowDistance: 1
        });
        this.textoUlt.x = 20 + 100;
        this.textoUlt.y = 67;
        this.textoUlt.anchor.set(0.5, 0);
        this.capaUI.addChild(this.textoUlt);

        // 10. Indicadores Q y E (Skills)
        this.contenedorSkills = new PIXI.Container();
        this.contenedorSkills.x = 20;
        this.contenedorSkills.y = 86;

        this.textoQ = new PIXI.Text('[Q] Skill 1: LISTO', {
            fontFamily: 'Arial', fontSize: 10, fill: 0x2ecc71, fontWeight: 'bold',
            dropShadow: true, dropShadowColor: '#000', dropShadowBlur: 2
        });
        this.textoQ.x = 0;
        this.textoQ.y = 0;

        this.textoE = new PIXI.Text('[E] Skill 2: LISTO', {
            fontFamily: 'Arial', fontSize: 10, fill: 0x2ecc71, fontWeight: 'bold',
            dropShadow: true, dropShadowColor: '#000', dropShadowBlur: 2
        });
        this.textoE.x = 100;
        this.textoE.y = 0;

        this.contenedorSkills.addChild(this.textoQ, this.textoE);
        this.capaUI.addChild(this.contenedorSkills);

        // 11. Indicador de Jugadores Online
        this.textoOnlineInGame = new PIXI.Text('🟢 ONLINE: 1', {
            fontFamily: 'Arial', fontSize: 12, fill: 0x2ecc71, fontWeight: 'bold',
            dropShadow: true, dropShadowColor: '#000', dropShadowBlur: 3
        });
        this.textoOnlineInGame.x = 20;
        this.textoOnlineInGame.y = 104;
        this.capaUI.addChild(this.textoOnlineInGame);
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
        
        const engine = window.orquestador?.currentEngine;
        if (engine && engine.skillManager) {
            const ult = engine.skillManager.ultimateCharge;
            if (ult !== this.ultCacheada) {
                this.actualizarBarraUltimate(ult);
                this.ultCacheada = ult;
            }

            const cd1 = engine.skillManager.cooldowns.skill1;
            const cd2 = engine.skillManager.cooldowns.skill2;
            this.actualizarCooldownsSkills(cd1, cd2);
        }

        if (this.textoOnlineInGame && window.networkManagerInstance) {
            const totalOnline = window.networkManagerInstance.onlineCount || 1;
            const inRoomCount = (engine && engine.remotePlayers) ? (engine.remotePlayers.size + 1) : 1;
            this.textoOnlineInGame.text = `🟢 ONLINE: ${totalOnline} (En esta sala: ${inRoomCount})`;
        }
    }

    actualizarCooldownsSkills(cd1, cd2) {
        if (this.textoQ) {
            if (cd1 > 0) {
                this.textoQ.text = `[Q] Skill: ${cd1.toFixed(1)}s`;
                this.textoQ.style.fill = 0xe74c3c; // Rojo
            } else {
                this.textoQ.text = `[Q] Skill: LISTO`;
                this.textoQ.style.fill = 0x2ecc71; // Verde
            }
        }
        if (this.textoE) {
            if (cd2 > 0) {
                this.textoE.text = `[E] Skill: ${cd2.toFixed(1)}s`;
                this.textoE.style.fill = 0xe74c3c;
            } else {
                this.textoE.text = `[E] Skill: LISTO`;
                this.textoE.style.fill = 0x2ecc71;
            }
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

    actualizarBarraUltimate(carga) {
        this.barraUltRelleno.clear();

        const porcentaje = Math.max(0, Math.min(1, carga / 100));
        const anchoRelleno = porcentaje * 200;

        let colorBarra = 0xf39c12; // Naranja/Amarillo
        if (porcentaje >= 1) colorBarra = 0xf1c40f; // Amarillo brillante si está lista

        this.barraUltRelleno.beginFill(colorBarra);
        this.barraUltRelleno.drawRoundedRect(0, 0, anchoRelleno, 14, 4);
        this.barraUltRelleno.endFill();

        // Brillito superior
        this.barraUltRelleno.beginFill(0xffffff, 0.2);
        this.barraUltRelleno.drawRoundedRect(2, 1, anchoRelleno - 4, 5, 2);
        this.barraUltRelleno.endFill();

        this.textoUlt.text = porcentaje >= 1 ? `¡ULTIMATE LISTA! [PRESIONA R]` : `ULTIMATE [R]: ${carga.toFixed(1)}%`;
        
        if (porcentaje >= 1) {
            this.barraUltRelleno.alpha = 0.7 + Math.abs(Math.sin(performance.now() / 150)) * 0.3; // Pulso brillante
        } else {
            this.barraUltRelleno.alpha = 1;
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
        if (this.barraUltFondo) { this.barraUltFondo.destroy(true); this.barraUltFondo = null; }
        if (this.barraUltRelleno) { this.barraUltRelleno.destroy(true); this.barraUltRelleno = null; }
        if (this.textoUlt) { this.textoUlt.destroy(true); this.textoUlt = null; }

        if (this.capaUI) {
            this.capaUI.removeChildren();
            this.capaUI = null;
        }
    }
}
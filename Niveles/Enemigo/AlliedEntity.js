export class AlliedEntity {
    constructor(x, y, tipo, player, enemyManager, capaEntidades) {
        this.x = x;
        this.y = y;
        this.tipo = tipo; // 'wolf' o 'golem'
        this.player = player;
        this.enemyManager = enemyManager;
        this.capaEntidades = capaEntidades;
        this.isDead = false;

        if (tipo === 'golem') {
            this.vida = 250;
            this.danio = 25;
            this.velocidad = 90;
            this.radioAtaque = 40;
            this.cooldownAtaqueMax = 1.0;
            this.radio = 18;
            this.duracionTotal = 15.0; // 15s de vida
        } else {
            // Wolf (Bestia sombría)
            this.vida = 80;
            this.danio = 12;
            this.velocidad = 160;
            this.radioAtaque = 30;
            this.cooldownAtaqueMax = 0.6;
            this.radio = 10;
            this.duracionTotal = 12.0; // 12s de vida
        }

        this.duracionActual = this.duracionTotal;
        this.cooldownAtaque = 0;
        this.sprite = null;
        this.crearSprite();
    }

    crearSprite() {
        if (typeof PIXI === 'undefined') return;
        this.sprite = new PIXI.Container();

        const gfx = new PIXI.Graphics();
        if (this.tipo === 'golem') {
            gfx.beginFill(0x2d3748);
            gfx.drawCircle(0, 0, this.radio);
            gfx.endFill();

            gfx.lineStyle(2, 0x0bc5ea);
            gfx.drawCircle(0, 0, this.radio * 0.7);

            const ojo1 = new PIXI.Graphics();
            ojo1.beginFill(0x0bc5ea);
            ojo1.drawCircle(-5, -4, 3);
            ojo1.endFill();

            const ojo2 = new PIXI.Graphics();
            ojo2.beginFill(0x0bc5ea);
            ojo2.drawCircle(5, -4, 3);
            ojo2.endFill();

            this.sprite.addChild(gfx, ojo1, ojo2);
        } else {
            // Lobo / Bestia
            gfx.beginFill(0x4a5568);
            gfx.drawPolygon([
                0, -12,
                8, 8,
                -8, 8
            ]);
            gfx.endFill();

            const ojos = new PIXI.Graphics();
            ojos.beginFill(0x9f7aea);
            ojos.drawCircle(-3, -2, 2);
            ojos.drawCircle(3, -2, 2);
            ojos.endFill();

            this.sprite.addChild(gfx, ojos);
        }

        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.capaEntidades.addChild(this.sprite);
    }

    update(dt) {
        if (this.isDead) return;

        this.duracionActual -= dt;
        if (this.duracionActual <= 0) {
            this.destruir();
            return;
        }

        if (this.cooldownAtaque > 0) {
            this.cooldownAtaque -= dt;
        }

        // Buscar enemigo más cercano
        let enemigoCercano = null;
        let distMin = 9999;

        if (this.enemyManager && this.enemyManager.enemies) {
            for (const en of this.enemyManager.enemies) {
                if (!en.isDead) {
                    const dist = Math.hypot(en.x - this.x, en.y - this.y);
                    if (dist < distMin) {
                        distMin = dist;
                        enemigoCercano = en;
                    }
                }
            }
        }

        if (enemigoCercano && distMin < 350) {
            // Perseguir enemigo
            const dx = enemigoCercano.x - this.x;
            const dy = enemigoCercano.y - this.y;
            const angulo = Math.atan2(dy, dx);

            this.x += Math.cos(angulo) * this.velocidad * dt;
            this.y += Math.sin(angulo) * this.velocidad * dt;

            // Atacar si está a rango
            if (distMin <= this.radioAtaque && this.cooldownAtaque <= 0) {
                enemigoCercano.recibirGolpe(this.danio, 'summoner');
                this.cooldownAtaque = this.cooldownAtaqueMax;
            }
        } else if (this.player) {
            // Seguir al jugador si no hay enemigos cerca
            const distJugador = Math.hypot(this.player.x - this.x, this.player.y - this.y);
            if (distJugador > 50) {
                const dx = this.player.x - this.x;
                const dy = this.player.y - this.y;
                const ang = Math.atan2(dy, dx);

                this.x += Math.cos(ang) * (this.velocidad * 0.9) * dt;
                this.y += Math.sin(ang) * (this.velocidad * 0.9) * dt;
            }
        }

        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }
    }

    destruir() {
        if (this.isDead) return;
        this.isDead = true;
        if (this.sprite) {
            this.sprite.destroy({ children: true });
            this.sprite = null;
        }
    }
}

export class EnemigoBase {
    constructor(data, tileSize) {
        this.x = data.gridX * tileSize + (tileSize / 2);
        this.y = data.gridY * tileSize + (tileSize / 2);
        this.tipo = data.tipo;
        this.velocidad = data.velocidad || 100;
        this.sprite = null;

        this.vidaMaxima = data.vida || 100;
        this.vidaActual = this.vidaMaxima;
        this.defensaBase = data.defensa || 10;

        this.resistencias = data.resistencias || {};

        // Sistema de daño por porcentaje
        this.danioBase = data.danioBase || 2;
        this.tipoDanio = data.tipoDanio || 'PORCENTAJE_BASE';

        this.radioColision = data.radioColision || (tileSize * 0.35);
        this.isDead = false;

        this.vx = 0;
        this.vy = 0;

        this.recalcularTimer = Math.random() * 0.2;
        this.hasAggro = false; // Estado de aggro por defecto
    }

    calcularDanio(player) {
        if (this.tipoDanio === 'PORCENTAJE_VIDA_TOTAL') {
            return player.vidaActual * (this.danioBase / 100);
        }
        return player.vidaMaxima * (this.danioBase / 100);
    }

    recibirGolpe(cantidadDaño, tipoElemento = 'FISICO') {
        if (this.isDead) return;

        const porcentajeResistencia = this.resistencias[tipoElemento] || 0;
        const bonusDefensa = this.defensaBase * porcentajeResistencia;
        const defensaTotal = this.defensaBase + bonusDefensa;

        const dañoFinal = Math.max(1, cantidadDaño - defensaTotal);

        this.vidaActual -= dañoFinal;
        this.hasAggro = true; // Alertar inmediatamente si recibe daño

        console.log(`Recibió ${dañoFinal} daño de ${tipoElemento}. Vida restante: ${this.vidaActual}`);

        if (this.vidaActual <= 0) {
            this.morir();
        }
    }

    update(dt, player, engine) {
        if (this.isDead) return;

        this.recalcularTimer -= dt;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distSq = dx * dx + dy * dy;

        // Activar aggro si el jugador está a menos de 250px
        if (distSq < 250 * 250) {
            this.hasAggro = true;
        }

        // Si no está alertado, detenerse
        if (!this.hasAggro) {
            this.vx = 0;
            this.vy = 0;
            return;
        }

        if (this.recalcularTimer <= 0) {
            if (distSq > 0) {
                const dist = Math.sqrt(distSq);
                this.vx = (dx / dist) * this.velocidad;
                this.vy = (dy / dist) * this.velocidad;
            }

            this.recalcularTimer = 0.2;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }
    }

    morir() {
        this.isDead = true;
        if (this.sprite) this.sprite.visible = false;

        // Otorgar experiencia (XP) al jugador
        if (window.playerState) {
            const xpPorTipo = {
                'BASE': 0.01,
                'BAKU': 0.02,
                'EXPLOSIVE_SHOOTER': 0.03,
                'SHOOTER_CHILD': 0.02,
                'MONSTER_SPAWNER': 0.02,
                'NECROMANCER': 0.03,
                'ORC_BOSS': 0.05
            };
            const xpGanada = xpPorTipo[this.tipo] || 0.01;
            let lvl = window.playerState.nivel || 1;

            if (lvl < 32) {
                window.playerState.xpActual += xpGanada;
                let req = Math.pow(2, lvl);

                // Mostrar mensaje flotante de XP
                const engine = window.orquestador?.currentEngine;
                if (engine && engine.uiManager) {
                    engine.uiManager.mostrarMensajeFlotante(`+${xpGanada.toFixed(2)} XP ✨`, this.x, this.y - 15);
                }

                // Verificar subida de nivel
                if (window.playerState.xpActual >= req && lvl < 32) {
                    window.playerState.xpActual = 0.0;
                    lvl++;
                    window.playerState.nivel = lvl;
                    console.log(`¡Subida de nivel! Ahora eres Nivel ${lvl}`);

                    if (engine && engine.uiManager && engine.player) {
                        engine.uiManager.mostrarMensajeFlotante(`✨ ¡SUBIDA DE NIVEL! LVL ${lvl} ✨`, engine.player.x, engine.player.y - 50);
                    }
                }
                
                if (window.playerState.xpActual < 0) {
                    window.playerState.xpActual = 0;
                }
            }
        }
    }
}

export class Baku extends EnemigoBase {
    constructor(data, tileSize) {
        super(data, tileSize);

        this.tipo = 'BAKU';
        this.velocidad = 150; 
        this.vidaMaxima = 200;
        this.vidaActual = 200;
        this.defensaBase = 15;
        this.radioColision = tileSize * 0.45;
        
        // ¡LA SOLUCIÓN PARA BAKU! (Le damos una dirección inicial)
        this.dirX = 1; 
    }
    
    update(dt, player, engine) {
        // 1. Calculamos hacia dónde queremos ir
        this.vx = this.dirX * this.velocidad;
        const nextX = this.x + (this.vx * dt);

        // 2. LE PREGUNTAMOS AL INSPECTOR (CollisionManager)
        const hayPared = engine.collisionManager.esPared(nextX, this.y);

        if (hayPared) {
            this.dirX *= -1; // ¡Rebote!
        } else {
            this.x = nextX; // Todo libre, nos movemos
        }

        // 3. Actualizamos visual
        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y; // Agregado para que no pierda su Y
        }
    }
}

// --- DECORADOR BASE ---
export class EnemigoDecorator {
    constructor(enemigo) {
        this.enemigo = enemigo;
    }

    get x() { return this.enemigo.x; }
    get y() { return this.enemigo.y; }
    set x(val) { this.enemigo.x = val; }
    set y(val) { this.enemigo.y = val; }
    get sprite() { return this.enemigo.sprite; }
    set sprite(val) { this.enemigo.sprite = val; }
    get isDead() { return this.enemigo.isDead; } // Importante para el manager
    get tipo() { return this.enemigo.tipo; }

    recibirGolpe(cantidadDaño, tipoElemento) {
        this.enemigo.recibirGolpe(cantidadDaño, tipoElemento);
    }

    update(dt, player, engine) {
        this.enemigo.update(dt, player, engine);
    }
}

// --- CONCRETO: Decorador de Fuego ---
export class FireDecorator extends EnemigoDecorator {
    update(dt, player, engine) {
        super.update(dt, player, engine);

        const dx = player.x - this.enemigo.x;
        const dy = player.y - this.enemigo.y;
        
        if ((dx * dx + dy * dy) < 1600) { 
            console.log("¡Jugador quemándose!");
        }
    }
}

// --- CONCRETO: Decorador de Velocidad ---
export class SpeedDecorator extends EnemigoDecorator {
    constructor(enemigo, factor = 1.5) {
        super(enemigo);
        this.factor = factor;
    }

    update(dt, player, engine) {
        this.enemigo.velocidad *= this.factor;
        super.update(dt, player, engine);
        this.enemigo.velocidad /= this.factor;
    }
}

// --- CONCRETO: Decorador Splitter ---
export class SplitterDecorator extends EnemigoDecorator {
    constructor(enemigo, engineRef) {
        super(enemigo);
        this.engine = engineRef;
    }

    recibirGolpe(cantidadDaño, tipoElemento) {
        this.enemigo.vidaActual -= cantidadDaño;

        if (this.enemigo.vidaActual <= 0 && !this.enemigo.isDead) {
            this.dividirse();
            this.enemigo.morir();
        }
    }

    dividirse() {
        for (let i = 0; i < 4; i++) {
            const dataHijo = {
                gridX: Math.floor(this.enemigo.x / this.engine.tileSize),
                gridY: Math.floor(this.enemigo.y / this.engine.tileSize),
                tipo: 'HIJO_SPLITTER',
                velocidad: this.enemigo.velocidad * 0.5
            };

            const hijo = this.engine.fabricaDeEnemigos(dataHijo);

            hijo.x += (Math.random() - 0.5) * 20;
            hijo.y += (Math.random() - 0.5) * 20;
            
            // Reinsertamos al hijo en la lista (esto lo maneja normalmente el engine/manager)
            this.engine.enemies.push(hijo);
        }
    }
}

export class ExplosiveShooter extends EnemigoBase {
    constructor(data, tileSize) {
        super(data, tileSize);
        this.tipo = 'EXPLOSIVE_SHOOTER';
        this.velocidad = data.velocidad || 70;
        this.vidaMaxima = data.vida || 300;
        this.vidaActual = this.vidaMaxima;
        this.radioColision = tileSize * 0.40;

        this.shootCooldown = 1.5; // dispara cada 1.5 segundos
        this.shootTimer = Math.random() * 1.5; // timer aleatorio para que no disparen todos a la vez
    }

    update(dt, player, engine) {
        if (this.isDead) return;

        // Comportamiento base (perseguir al jugador)
        super.update(dt, player, engine);

        // Lógica de disparo
        this.shootTimer -= dt;
        if (this.shootTimer <= 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.hypot(dx, dy);

            // Rango de disparo: 400px
            if (dist < 400 && !player.isDead) {
                this.disparar(dx, dy, engine);
            }
            this.shootTimer = this.shootCooldown;
        }
    }

    disparar(dx, dy, engine) {
        const angulo = Math.atan2(dy, dx);
        const velocidadBala = 300;

        const spriteBala = new PIXI.Graphics();
        spriteBala.lineStyle(2, 0xffa500);
        spriteBala.beginFill(0xff4500); // Bola de fuego naranja
        spriteBala.drawCircle(0, 0, 7);
        spriteBala.endFill();

        const bala = {
            x: this.x,
            y: this.y,
            vx: Math.cos(angulo) * velocidadBala,
            vy: Math.sin(angulo) * velocidadBala,
            sprite: spriteBala,
            owner: 'ENEMY',
            enemigoOrigen: this
        };

        bala.sprite.x = bala.x;
        bala.sprite.y = bala.y;
        engine.capaEntidades.addChild(bala.sprite);
        engine.projectiles.push(bala);
    }

    recibirGolpe(cantidadDaño, tipoElemento = 'FISICO') {
        if (this.isDead) return;
        this.vidaActual -= cantidadDaño;
        if (this.vidaActual <= 0) {
            this.morir();
        }
    }

    morir() {
        if (this.isDead) return;
        super.morir();

        // 1. Explosión visual y daño en área a Kitty
        if (window.orquestador && window.orquestador.currentEngine) {
            const engine = window.orquestador.currentEngine;
            const player = engine.player;

            // Daño en área unicamente a Kitty
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.hypot(dx, dy);

            const radioExplosion = 120;
            if (dist < radioExplosion && !player.isDead) {
                const danioExplosion = 25;
                player.recibirDanio(danioExplosion);
                engine.uiManager.mostrarMensajeFlotante(`-${danioExplosion} HP 💥`, player.x, player.y - 30);
            }

            // Efecto visual de explosión
            const graficoExplosion = new PIXI.Graphics();
            graficoExplosion.lineStyle(4, 0xffa500, 0.8);
            graficoExplosion.beginFill(0xff4500, 0.4);
            graficoExplosion.drawCircle(this.x, this.y, radioExplosion);
            graficoExplosion.endFill();
            engine.capaEntidades.addChild(graficoExplosion);

            // Desvanecer la explosión
            let t = 0.3;
            const ticker = window.orquestador?.currentEngine?.app?.ticker || PIXI.Ticker.shared;
            const animarExplosion = () => {
                t -= 0.016; // aprox 1 frame a 60fps
                graficoExplosion.alpha = t / 0.3;
                if (t <= 0) {
                    ticker.remove(animarExplosion);
                    graficoExplosion.destroy();
                }
            };
            ticker.add(animarExplosion);

            // 2. Crear 3 hijos
            for (let i = 0; i < 3; i++) {
                const dataHijo = {
                    type: 'SHOOTER_CHILD',
                    gridX: Math.floor(this.x / engine.tileSize),
                    gridY: Math.floor(this.y / engine.tileSize),
                    vida: 50,
                    velocidad: 110,
                    decoradores: []
                };
                const hijo = engine.enemyManager.fabricaDeEnemigos(dataHijo);
                // Esparcirlos un poco
                hijo.x += (Math.random() - 0.5) * 40;
                hijo.y += (Math.random() - 0.5) * 40;
            }
        }
    }
}

export class ShooterChild extends EnemigoBase {
    constructor(data, tileSize) {
        super(data, tileSize);
        this.tipo = 'SHOOTER_CHILD';
        this.velocidad = data.velocidad || 110;
        this.vidaMaxima = data.vida || 50;
        this.vidaActual = this.vidaMaxima;
        this.radioColision = tileSize * 0.25;
    }
}

export class MonsterSpawner extends EnemigoBase {
    constructor(data, tileSize) {
        super(data, tileSize);
        this.tipo = 'MONSTER_SPAWNER';
        this.velocidad = 0; // Estático
        this.vidaMaxima = data.vida || 300;
        this.vidaActual = this.vidaMaxima;
        this.radioColision = tileSize * 0.55;
        this.spawnCooldown = 6.0;
        this.spawnTimer = 2.0; // Invoca rápido al principio
        this.hasAggro = true; // El spawner está siempre activo
    }

    update(dt, player, engine) {
        if (this.isDead) return;

        // No se mueve, así que no llamamos a super.update
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.hypot(dx, dy);

            // Solo invoca si el jugador está a menos de 550px para no sobrecargar
            if (dist < 550 && !player.isDead) {
                this.invocarEsqueleto(engine);
            }
            this.spawnTimer = this.spawnCooldown;
        }

        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }
    }

    invocarEsqueleto(engine) {
        // Buscar una celda libre adyacente
        const gridX = Math.floor(this.x / engine.tileSize);
        const gridY = Math.floor(this.y / engine.tileSize);
        
        // Direcciones adyacentes
        const offsets = [
            {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}
        ];
        
        let spawnCell = null;
        for (const offset of offsets) {
            const tx = gridX + offset.x;
            const ty = gridY + offset.y;
            if (!engine.collisionManager.esPared(tx * engine.tileSize + 16, ty * engine.tileSize + 16)) {
                spawnCell = {gridX: tx, gridY: ty};
                break;
            }
        }

        if (!spawnCell) spawnCell = {gridX, gridY};

        const dataEnemigo = {
            tipo: 'BASE', // Esqueleto base
            gridX: spawnCell.gridX,
            gridY: spawnCell.gridY,
            vida: 70,
            velocidad: 85
        };

        const esqueleto = engine.enemyManager.fabricaDeEnemigos(dataEnemigo);
        esqueleto.hasAggro = true; // Activo inmediatamente
        
        // Efecto visual de invocación (destello morado)
        const destello = new PIXI.Graphics();
        destello.beginFill(0x805ad5, 0.7);
        destello.drawCircle(0, 0, engine.tileSize * 0.4);
        destello.endFill();
        destello.x = esqueleto.x;
        destello.y = esqueleto.y;
        engine.capaEntidades.addChild(destello);

        let t = 0.3;
        const ticker = window.orquestador?.currentEngine?.app?.ticker || PIXI.Ticker.shared;
        const animarDestello = () => {
            t -= 0.016;
            destello.alpha = t / 0.3;
            if (t <= 0) {
                ticker.remove(animarDestello);
                destello.destroy();
            }
        };
        ticker.add(animarDestello);
        
        console.log("¡Portal generó un esqueleto!");
    }
}

export class Necromancer extends EnemigoBase {
    constructor(data, tileSize) {
        super(data, tileSize);
        this.tipo = 'NECROMANCER';
        this.velocidad = data.velocidad || 90;
        this.vidaMaxima = data.vida || 220;
        this.vidaActual = this.vidaMaxima;
        this.radioColision = tileSize * 0.40;
        this.summonCooldown = 7.0;
        this.summonTimer = 3.0;
    }

    update(dt, player, engine) {
        if (this.isDead) return;

        // Rango de Aggro
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 300 || this.vidaActual < this.vidaMaxima) {
            this.hasAggro = true;
        }

        if (!this.hasAggro) return;

        // IA de alejamiento/acercamiento inteligente
        this.recalcularTimer -= dt;
        if (this.recalcularTimer <= 0) {
            if (dist < 180) {
                // Huir del jugador
                this.vx = -(dx / dist) * this.velocidad;
                this.vy = -(dy / dist) * this.velocidad;
            } else if (dist > 320) {
                // Acercarse
                this.vx = (dx / dist) * this.velocidad;
                this.vy = (dy / dist) * this.velocidad;
            } else {
                // Mantener posición
                this.vx = 0;
                this.vy = 0;
            }
            this.recalcularTimer = 0.25;
        }

        // Moverse comprobando colisión con paredes
        const nextX = this.x + this.vx * dt;
        const nextY = this.y + this.vy * dt;
        
        if (!engine.collisionManager.esPared(nextX, this.y)) {
            this.x = nextX;
        }
        if (!engine.collisionManager.esPared(this.x, nextY)) {
            this.y = nextY;
        }

        if (this.sprite) {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }

        // Invocar Espectros (SHOOTER_CHILD en lógica interna)
        this.summonTimer -= dt;
        if (this.summonTimer <= 0 && dist < 450 && !player.isDead) {
            this.invocarEspectro(engine);
            this.summonTimer = this.summonCooldown;
        }
    }

    invocarEspectro(engine) {
        const gridX = Math.floor(this.x / engine.tileSize);
        const gridY = Math.floor(this.y / engine.tileSize);
        
        const dataHijo = {
            tipo: 'SHOOTER_CHILD',
            gridX: gridX,
            gridY: gridY,
            vida: 40,
            velocidad: 110
        };
        const espectro = engine.enemyManager.fabricaDeEnemigos(dataHijo);
        espectro.hasAggro = true;
        espectro.x += (Math.random() - 0.5) * 30;
        espectro.y += (Math.random() - 0.5) * 30;
        
        // Destello oscuro
        const destello = new PIXI.Graphics();
        destello.beginFill(0x319795, 0.7);
        destello.drawCircle(0, 0, engine.tileSize * 0.4);
        destello.endFill();
        destello.x = espectro.x;
        destello.y = espectro.y;
        engine.capaEntidades.addChild(destello);

        let t = 0.3;
        const ticker = window.orquestador?.currentEngine?.app?.ticker || PIXI.Ticker.shared;
        const animarDestello = () => {
            t -= 0.016;
            destello.alpha = t / 0.3;
            if (t <= 0) {
                ticker.remove(animarDestello);
                destello.destroy();
            }
        };
        ticker.add(animarDestello);
        
        console.log("¡Nigromante invocó un esqueleto!");
    }
}

export class OrcBoss extends EnemigoBase {
    constructor(data, tileSize) {
        super(data, tileSize);
        this.tipo = 'ORC_BOSS';
        this.velocidad = data.velocidad || 75;
        this.vidaMaxima = data.vida || 450;
        this.vidaActual = this.vidaMaxima;

        this.smashCooldown = 5.0;
        this.smashTimer = 3.0; 
        
        this.isCharging = false;
        this.chargeTimer = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.chargeAreaGfx = null;
        this.radioColision = tileSize * 0.70;
    }

    update(dt, player, engine) {
        if (this.isDead) {
            if (this.chargeAreaGfx) {
                this.chargeAreaGfx.destroy();
                this.chargeAreaGfx = null;
            }
            return;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 320 || this.vidaActual < this.vidaMaxima) {
            this.hasAggro = true;
        }

        if (!this.hasAggro) return;

        if (this.isCharging) {
            this.vx = 0;
            this.vy = 0;
            this.chargeTimer -= dt;
            
            if (this.chargeAreaGfx) {
                this.chargeAreaGfx.alpha = 0.3 + 0.6 * (1 - this.chargeTimer / 1.2);
            }

            if (this.chargeTimer <= 0) {
                this.ejecutarGolpe(player, engine);
            }
        } else {
            super.update(dt, player, engine);

            const nextX = this.x + this.vx * dt;
            const nextY = this.y + this.vy * dt;
            
            if (!engine.collisionManager.esPared(nextX, this.y)) this.x = nextX;
            if (!engine.collisionManager.esPared(this.x, nextY)) this.y = nextY;

            if (this.sprite) {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
            }

            this.smashTimer -= dt;
            if (this.smashTimer <= 0 && dist < 220 && !player.isDead) {
                this.isCharging = true;
                this.chargeTimer = 1.2;
                this.targetX = player.x;
                this.targetY = player.y;

                this.chargeAreaGfx = new PIXI.Graphics();
                this.chargeAreaGfx.lineStyle(2.5, 0xff0000, 0.85);
                this.chargeAreaGfx.beginFill(0xff3333, 0.25);
                this.chargeAreaGfx.drawCircle(0, 0, 85);
                this.chargeAreaGfx.endFill();
                this.chargeAreaGfx.x = this.targetX;
                this.chargeAreaGfx.y = this.targetY;
                
                engine.capaEntidades.addChild(this.chargeAreaGfx);
                
                this.uiMensajeCarga(engine);
            }
        }
    }

    uiMensajeCarga(engine) {
        engine.uiManager.mostrarMensajeFlotante("⚠️ ¡GOLPE PESADO!", this.x, this.y - 45);
    }

    ejecutarGolpe(player, engine) {
        this.isCharging = false;
        this.smashTimer = this.smashCooldown;

        if (this.chargeAreaGfx) {
            this.chargeAreaGfx.destroy();
            this.chargeAreaGfx = null;
        }

        const dx = player.x - this.targetX;
        const dy = player.y - this.targetY;
        const dist = Math.hypot(dx, dy);

        if (dist <= 85) {
            const damage = Math.round(player.vidaMaxima * 0.25);
            
            if (player.isShielded) {
                engine.uiManager.mostrarMensajeFlotante("🛡️ ¡Bloqueado!", player.x, player.y - 30);
            } else {
                player.recibirDanio(damage);
                engine.uiManager.mostrarMensajeFlotante(`-${damage} HP 💥`, player.x, player.y - 30);
                
                const anglePush = Math.atan2(player.y - this.y, player.x - this.x);
                const pushDist = 95;
                const targetPlayerX = player.x + Math.cos(anglePush) * pushDist;
                const targetPlayerY = player.y + Math.sin(anglePush) * pushDist;
                
                if (!engine.collisionManager.esPared(targetPlayerX, player.y)) player.x = targetPlayerX;
                if (!engine.collisionManager.esPared(player.x, targetPlayerY)) player.y = targetPlayerY;
            }
        }

        const impactoGfx = new PIXI.Graphics();
        impactoGfx.lineStyle(5, 0xffd700, 0.95);
        impactoGfx.beginFill(0xe67e22, 0.4);
        impactoGfx.drawCircle(this.targetX, this.targetY, 85);
        impactoGfx.endFill();
        engine.capaEntidades.addChild(impactoGfx);

        let t = 0.25;
        const ticker = window.orquestador?.currentEngine?.app?.ticker || PIXI.Ticker.shared;
        const animarImpacto = () => {
            t -= 0.016;
            impactoGfx.alpha = t / 0.25;
            if (t <= 0) {
                ticker.remove(animarImpacto);
                impactoGfx.destroy();
            }
        };
        ticker.add(animarImpacto);
    }

    morir() {
        if (this.chargeAreaGfx) {
            this.chargeAreaGfx.destroy();
            this.chargeAreaGfx = null;
        }
        super.morir();
    }
}

export const ENEMY_CLASSES = {
    'BAKU': Baku,
    'BASE': EnemigoBase,
    'EXPLOSIVE_SHOOTER': ExplosiveShooter,
    'SHOOTER_CHILD': ShooterChild,
    'MONSTER_SPAWNER': MonsterSpawner,
    'NECROMANCER': Necromancer,
    'ORC_BOSS': OrcBoss
};
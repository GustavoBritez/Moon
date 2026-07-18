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

        this.isDead = false;

        this.vx = 0;
        this.vy = 0;

        this.recalcularTimer = Math.random() * 0.2;
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

        console.log(`Recibió ${dañoFinal} daño de ${tipoElemento}. Vida restante: ${this.vidaActual}`);

        if (this.vidaActual <= 0) {
            this.morir();
        }
    }

    update(dt, player, engine) {
        if (this.isDead) return;

        this.recalcularTimer -= dt;

        if (this.recalcularTimer <= 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distSq = dx * dx + dy * dy;

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
        spriteBala.lineStyle(2, 0xffffff);
        spriteBala.beginFill(0x000000); // Balas enemigas negras
        spriteBala.drawCircle(0, 0, 5);
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
            if (dist < radioExplosion) {
                // Los enemigos no causan daño en Kitty
                console.log("¡Kitty esquivó la explosión!");
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
            const animarExplosion = () => {
                t -= 0.016; // aprox 1 frame a 60fps
                graficoExplosion.alpha = t / 0.3;
                if (t <= 0) {
                    PIXI.Ticker.shared.remove(animarExplosion);
                    graficoExplosion.destroy();
                }
            };
            PIXI.Ticker.shared.add(animarExplosion);

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
    }
}

export const ENEMY_CLASSES = {
    'BAKU': Baku,
    'BASE': EnemigoBase,
    'EXPLOSIVE_SHOOTER': ExplosiveShooter,
    'SHOOTER_CHILD': ShooterChild
};
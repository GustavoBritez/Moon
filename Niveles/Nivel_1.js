import { TilemapRenderer } from '../Service/TilemapRenderer.js';
import { UIManager } from './UiManager/UiManager.js';
import { InputManager } from './PlayerControladorCarpet/InputManager.js';
import { CollisionManager } from './PlayerControladorCarpet/CollisionManager.js';
import { EnemyManager } from './Enemigo/EnemyManager.js';
import { Player } from './PlayerControladorCarpet/Player.js';
import { PlayerController } from './PlayerControladorCarpet/PlayerControllator.js';

export class Nivel_1 {
    constructor(canvas, config, eventBus) {
        this.canvas = canvas;
        this.config = config || {};
        this.eventBus = eventBus;
        this.projectiles = [];
        this.pack = this.config.pack || null;

        const mapaInicial = this.obtenerMapaInicial(this.config);

        this.mapaMatriz = mapaInicial.matriz.map((fila) => fila.slice());
        this.portales = mapaInicial.portales || [];
        this.enemigos = mapaInicial.enemigos || [];
        this.cofres = mapaInicial.cofres || [];

        this.settings = window.GAME_TUNING || { tileSize: 32, playerSpeed: 170, playerLives: 3 };
        this.tileSize = this.settings.tileSize;
        const spawn = this.obtenerSpawnInicial(this.mapaMatriz);

        this.handleKeyDown = (e) => {
            if (['1', '2', '3', '4', '5'].includes(e.key)) {
                const index = parseInt(e.key) - 1;
                this.seleccionarSlot(index);
            } else if (e.key === 'Escape' || e.key === 'Esc') {
                this.togglePause();
            }
        };
        window.addEventListener('keydown', this.handleKeyDown);

        // 1. Inicializar el motor gráfico PixiJS
        this.app = new PIXI.Application({
            view: canvas,
            resizeTo: window,
            backgroundColor: 0xfff4f8,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });

        // 2. Estructurar el árbol de nodos
        this.mundo = new PIXI.Container();
        this.capaFondo = new PIXI.Container();
        this.capaEntidades = new PIXI.Container();
        this.capaUI = new PIXI.Container();

        this.mundo.addChild(this.capaFondo, this.capaEntidades);
        this.app.stage.addChild(this.mundo, this.capaUI);

        // 3. Inicializar el Modelo de Datos del Jugador
        this.player = new Player(
            spawn.x,
            spawn.y,
            this.settings.playerSpeed,
            this.settings.playerHP || 100
        );

        // 4. Mánagers
        this.inputManager = new InputManager();
        this.collisionManager = new CollisionManager(this.mapaMatriz, this.tileSize);
        this.playerController = new PlayerController(this.player, this.inputManager, this.collisionManager);
        this.renderizador = new TilemapRenderer(this.capaFondo, this.mapaMatriz, this.tileSize);
        this.uiManager = new UIManager(this.capaUI, this.capaEntidades);
        this.enemyManager = new EnemyManager(this.capaEntidades, this.tileSize, this.enemigos);
        this.enemyManager.engine = this;

        this.camara = { x: this.player.x, y: this.player.y };
        this.gameOver = false;
        this.isPaused = false;

        this.handleResize = () => this.redimensionarEscena();

        // ========================================================
        // VARIABLES DE CONTROL DE DISPARO Y RATÓN
        // ========================================================
        this.isShooting = false;
        this.fireRate = 0.15;
        this.fireTimer = 0;
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;

        // 1. Rastreador global del ratón
        this.handlePointerMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        };

        // 2. Detectores globales de clic (Forzando el disparo inicial)
        this.handlePointerDown = (e) => {
            if (e.button === 0) {
                this.isShooting = true;

                // Disparo inmediato al hacer clic (rompe la latencia del bucle)
                if (this.fireTimer <= 0) {
                    this.disparar();
                    this.fireTimer = this.fireRate;
                }
            }
        };

        this.handlePointerUp = (e) => {
            if (e.button === 0) {
                this.isShooting = false;
            }
        };

        this.start();
    }

    obtenerMapaInicial(config) {
        if (config?.pack?.principal) {
            return config.pack.principal;
        }

        return config || { matriz: [] };
    }

    obtenerSpawnInicial(matriz) {
        for (let fila = 0; fila < matriz.length; fila++) {
            for (let col = 0; col < matriz[fila].length; col++) {
                if (matriz[fila][col] === 3) {
                    return {
                        x: col * this.settings.tileSize + (this.settings.tileSize / 2),
                        y: fila * this.settings.tileSize + (this.settings.tileSize / 2)
                    };
                }
            }
        }

        return {
            x: this.settings.tileSize / 2,
            y: this.settings.tileSize / 2
        };
    }

    start() {
        window.addEventListener('resize', this.handleResize);

        // Atrapamos eventos a nivel ventana
        window.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerdown', this.handlePointerDown);
        window.addEventListener('pointerup', this.handlePointerUp);
        window.addEventListener('contextmenu', (e) => e.preventDefault());

        this.renderizador.inicializarPool(window.innerWidth, window.innerHeight);
        this.enemyManager.inicializar();

        const radioBase = this.tileSize * 0.36;
        const visualHeroe = new PIXI.Container();

        const sombra = new PIXI.Graphics();
        sombra.beginFill(0x000000, 0.3);
        sombra.drawEllipse(0, radioBase * 0.8, radioBase * 0.9, radioBase * 0.3);
        sombra.endFill();
        visualHeroe.addChild(sombra);

        if (window.playerState.clase === 'mage') {
            // DISEÑO MAGO: Esfera de energía mágica morada y brillante
            const brilloExterior = new PIXI.Graphics();
            brilloExterior.beginFill(0xb794f4, 0.25);
            brilloExterior.drawCircle(0, 0, radioBase + 5);
            brilloExterior.endFill();

            const cuerpo = new PIXI.Graphics();
            cuerpo.beginFill(0x553c9a); // Púrpura oscuro
            cuerpo.drawCircle(0, 0, radioBase);
            cuerpo.endFill();

            const nucleo = new PIXI.Graphics();
            nucleo.beginFill(0x805ad5, 0.9); // Morado brillante
            nucleo.drawCircle(0, 0, radioBase * 0.7);
            nucleo.endFill();

            const brillo = new PIXI.Graphics();
            brillo.beginFill(0xffffff, 0.9);
            brillo.drawCircle(-radioBase * 0.2, -radioBase * 0.2, radioBase * 0.2);
            brillo.endFill();

            visualHeroe.addChild(brilloExterior, cuerpo, nucleo, brillo);
        } else {
            // DISEÑO CABALLERO: Escudo de acero plateado con yelmo y detalles dorados
            const brilloExterior = new PIXI.Graphics();
            brilloExterior.beginFill(0xf6e05e, 0.25); // Brillo dorado
            brilloExterior.drawCircle(0, 0, radioBase + 4);
            brilloExterior.endFill();

            const cuerpo = new PIXI.Graphics();
            cuerpo.beginFill(0x4a5568); // Acero gris oscuro
            cuerpo.drawCircle(0, 0, radioBase);
            cuerpo.endFill();

            const yelmo = new PIXI.Graphics();
            yelmo.beginFill(0x718096); // Metal templado
            yelmo.drawRect(-radioBase * 0.7, -radioBase * 0.5, radioBase * 1.4, radioBase * 1.0, 4);
            yelmo.endFill();

            const visor = new PIXI.Graphics();
            visor.beginFill(0xd69e2e); // Visor dorado
            visor.drawRect(-radioBase * 0.5, -radioBase * 0.2, radioBase * 1.0, radioBase * 0.3, 1);
            visor.endFill();

            visualHeroe.addChild(brilloExterior, cuerpo, yelmo, visor);
        }

        this.player.setSprite(visualHeroe);
        this.capaEntidades.addChild(this.player.sprite);

        this.crearHUDHtml();

        this.uiManager.actualizar(this.player);
        this.app.ticker.add((delta) => this.update(delta));
    }

    // ========================================================
    // HABILIDADES DEL JUGADOR
    // ========================================================

    crearSpriteBala(color) {
        const spriteBala = new PIXI.Graphics();
        spriteBala.lineStyle(2, 0xffffff); // Borde blanco
        spriteBala.beginFill(color);
        spriteBala.drawCircle(0, 0, 5);
        spriteBala.endFill();
        spriteBala.blendMode = PIXI.BLEND_MODES.NORMAL; // blendMode normal para que el negro se vea
        return spriteBala;
    }

    disparar() {
        if (this.gameOver || this.isPaused || this.player.isDead) return;

        const activeSlot = window.playerState.slots[window.playerState.activeSlotIndex];

        // 1. Manejo de Consumibles
        if (activeSlot === 'pocion_vida') {
            if (window.playerState.inventario.pocion_vida > 0) {
                if (this.player.vidaActual < 100) {
                    window.playerState.inventario.pocion_vida--;
                    this.player.vidaActual = Math.min(100, this.player.vidaActual + 50);
                    this.uiManager.mostrarMensajeFlotante("+50 ❤️", this.player.x, this.player.y - 30);
                    
                    if (window.playerState.inventario.pocion_vida === 0) {
                        window.playerState.slots[window.playerState.activeSlotIndex] = null;
                        window.playerState.activeSlotIndex = 0;
                    }
                    this.actualizarHUDHtml();
                } else {
                    this.uiManager.mostrarMensajeFlotante("¡Vida Completa!", this.player.x, this.player.y - 30);
                }
            }
            return;
        }

        if (activeSlot === 'escudo_hierro') {
            if (window.playerState.inventario.escudo_hierro > 0) {
                if (!this.player.isShielded) {
                    window.playerState.inventario.escudo_hierro--;
                    this.player.isShielded = true;
                    this.player.shieldTimer = 3.0;
                    
                    // Efecto visual de escudo
                    const escudoGfx = new PIXI.Graphics();
                    escudoGfx.lineStyle(3, 0xffd700, 0.85); // Dorado
                    escudoGfx.drawCircle(0, 0, this.tileSize * 0.55);
                    escudoGfx.endFill();
                    this.player.sprite.addChild(escudoGfx);
                    this.player.shieldSprite = escudoGfx;
                    
                    this.uiManager.mostrarMensajeFlotante("¡ESCUDO! 🛡️", this.player.x, this.player.y - 30);

                    if (window.playerState.inventario.escudo_hierro === 0) {
                        window.playerState.slots[window.playerState.activeSlotIndex] = null;
                        window.playerState.activeSlotIndex = 0;
                    }
                    this.actualizarHUDHtml();
                } else {
                    this.uiManager.mostrarMensajeFlotante("¡Escudo Activo!", this.player.x, this.player.y - 30);
                }
            }
            return;
        }

        // 2. Manejo de Armas
        const arma = activeSlot || "espada_basica";

        // Desgaste de durabilidad por ataque
        if (window.playerState.durabilidad && window.playerState.durabilidad[arma] !== undefined) {
            let desgaste = 0.02; // Espada
            if (arma === 'daga_doble') desgaste = 0.04;
            else if (arma === 'martillo_rebote') desgaste = 0.08;

            window.playerState.durabilidad[arma] = Math.max(0, window.playerState.durabilidad[arma] - desgaste);
        }

        // Calcular factor de daño según mantenimiento (mínimo 50% de daño a 0% de durabilidad)
        const dur = window.playerState.durabilidad[arma] !== undefined ? window.playerState.durabilidad[arma] : 100;
        const factorDanio = Math.max(0.5, 1.0 - (100 - dur) * (0.01 / 20));

        this.actualizarHUDHtml();

        const mouseMundoX = this.mouseX - this.mundo.x;
        const mouseMundoY = this.mouseY - this.mundo.y;

        const dx = mouseMundoX - this.player.x;
        const dy = mouseMundoY - this.player.y;

        const angulo = Math.atan2(dy, dx);
        const velocidadBala = 600;

        // Actualizar dinámicamente fireRate del ticker según arma
        if (arma === 'daga_doble') this.fireRate = 0.10;
        else if (arma === 'martillo_rebote') this.fireRate = 0.22;
        else this.fireRate = 0.25; // Espada

        if (arma === 'daga_doble') {
            // Dispara dos dagas paralelas
            const offsetAngle = angulo + Math.PI / 2;
            const offsetX = Math.cos(offsetAngle) * 10;
            const offsetY = Math.sin(offsetAngle) * 10;

            const balas = [
                { x: this.player.x + offsetX, y: this.player.y + offsetY },
                { x: this.player.x - offsetX, y: this.player.y - offsetY }
            ];

            for (const pos of balas) {
                const spriteBala = new PIXI.Graphics();
                spriteBala.lineStyle(1.5, 0xffffff);
                spriteBala.beginFill(0x95a5a6); // Gris acero
                spriteBala.drawPolygon([-8, -2, 8, 0, -8, 2]); // Daga
                spriteBala.endFill();
                spriteBala.rotation = angulo;

                const b = {
                    x: pos.x,
                    y: pos.y,
                    vx: Math.cos(angulo) * (velocidadBala * 1.1),
                    vy: Math.sin(angulo) * (velocidadBala * 1.1),
                    sprite: spriteBala,
                    danio: Math.round(15 * factorDanio)
                };
                b.sprite.x = b.x;
                b.sprite.y = b.y;
                this.capaEntidades.addChild(b.sprite);
                this.projectiles.push(b);
            }
            console.log("¡Dagas Dobles!");
        } 
        else if (arma === 'martillo_rebote') {
            // Lanzar martillo pesado que rebota 3 veces
            const spriteBala = new PIXI.Graphics();
            spriteBala.lineStyle(1.5, 0xd69e2e); // Detalle dorado
            spriteBala.beginFill(0x57606f); // Gris metal pesado
            spriteBala.drawRect(-4, -10, 8, 20); // Mango
            spriteBala.drawRect(-12, -10, 24, 8); // Cabeza
            spriteBala.endFill();

            const b = {
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angulo) * (velocidadBala * 0.8),
                vy: Math.sin(angulo) * (velocidadBala * 0.8),
                sprite: spriteBala,
                danio: Math.round(45 * factorDanio),
                rebotadora: true,
                rebotesRestantes: 3,
                martillo: true
            };
            b.sprite.x = b.x;
            b.sprite.y = b.y;
            this.capaEntidades.addChild(b.sprite);
            this.projectiles.push(b);
            console.log("¡Martillo Arrojado!");
        } 
        else {
            // ESPADA BÁSICA (Ataque melee de arco de tajo)
            const radioSlash = 80;
            const arcoSlash = 1.6;

            const slashGfx = new PIXI.Graphics();
            slashGfx.lineStyle(4, 0xf6e05e, 0.95);
            slashGfx.arc(0, 0, radioSlash - 10, angulo - arcoSlash/2, angulo + arcoSlash/2);
            slashGfx.lineStyle(1, 0xffffff, 0.5);
            slashGfx.arc(0, 0, radioSlash - 5, angulo - arcoSlash/2, angulo + arcoSlash/2);
            
            slashGfx.x = this.player.x;
            slashGfx.y = this.player.y;
            this.capaEntidades.addChild(slashGfx);

            let duracion = 0.12;
            const animarSlash = () => {
                duracion -= 0.016;
                slashGfx.alpha = Math.max(0, duracion / 0.12);
                if (duracion <= 0) {
                    this.app.ticker.remove(animarSlash);
                    slashGfx.destroy();
                }
            };
            this.app.ticker.add(animarSlash);

            for (let j = this.enemyManager.enemies.length - 1; j >= 0; j--) {
                const enemigo = this.enemyManager.enemies[j];
                const dx = enemigo.x - this.player.x;
                const dy = enemigo.y - this.player.y;
                const dist = Math.hypot(dx, dy);

                if (dist <= radioSlash + 15) {
                    const angEnemigo = Math.atan2(dy, dx);
                    let diffAng = angEnemigo - angulo;
                    while (diffAng < -Math.PI) diffAng += Math.PI * 2;
                    while (diffAng > Math.PI) diffAng -= Math.PI * 2;

                    if (Math.abs(diffAng) <= arcoSlash / 2 + 0.3) {
                        enemigo.recibirGolpe(Math.round(35 * factorDanio));
                    }
                }
            }
            console.log("¡Tajo de espada!");
        }
    }

    activarTurbo() {
        if (this.gameOver || this.isPaused || this.player.isDead || this.player.isTurbo) return;

        this.player.isTurbo = true;
        const velocidadOriginal = this.player.speed;
        this.player.speed *= 2.5;

        setTimeout(() => {
            if (this.player) {
                this.player.speed = velocidadOriginal;
                this.player.isTurbo = false;
            }
        }, 300);
    }

    // ========================================================
    // CICLO DE JUEGO
    // ========================================================

    update(delta) {
        if (this.gameOver || this.isPaused) return;

        const dt = delta / this.app.ticker.FPS;

        // Reducir la duración de la invulnerabilidad si está activa
        if (this.player.isInvulnerable) {
            this.player.invulnerableTimer -= dt;
            if (this.player.sprite) {
                // Hacer que el sprite parpadee alternando la opacidad
                this.player.sprite.alpha = Math.floor(Date.now() / 80) % 2 === 0 ? 0.2 : 0.8;
            }
            if (this.player.invulnerableTimer <= 0) {
                this.player.isInvulnerable = false;
                this.player.invulnerableTimer = 0;
                if (this.player.sprite) {
                    this.player.sprite.alpha = 1.0; // Restaurar opacidad completa
                }
            }
        }

        // Reducir la duración del escudo si está activo
        if (this.player.isShielded) {
            this.player.shieldTimer -= dt;
            if (this.player.shieldTimer <= 0) {
                this.player.isShielded = false;
                this.player.shieldTimer = 0;
                if (this.player.shieldSprite) {
                    this.player.shieldSprite.destroy();
                    this.player.shieldSprite = null;
                }
                console.log("El escudo ha expirado.");
            }
        }

        // ¡AQUÍ FALTABA ESTO! Gestión del reloj de disparo
        if (this.fireTimer > 0) {
            this.fireTimer -= dt;
        }

        if (this.isShooting && this.fireTimer <= 0) {
            this.disparar();
            this.fireTimer = this.fireRate;
        }

        this.playerController.update(dt);
        this.enemyManager.update(dt, this.player, this);
        this.actualizarProyectiles(dt);

        // Detección de colisión de daño por contacto con enemigos
        if (!this.player.isDead && !this.player.isInvulnerable) {
            const enemigoColision = this.collisionManager.verificarColisionesJugadorEnemigo(this.player, this.enemyManager.enemies);
            if (enemigoColision) {
                const danioBaseCalculado = enemigoColision.calcularDanio(this.player);
                if (danioBaseCalculado > 0) {
                    const danio = Math.max(1, Math.round(danioBaseCalculado));
                    this.player.recibirDanio(danio);
                    this.uiManager.mostrarMensajeFlotante(`-${danio} HP 💥`, this.player.x, this.player.y - 30);
                }
            }
        }

        this.verificarPortales();
        this.verificarCofres();
        this.verificarVictoria();
        this.verificarDerrota();
        this.actualizarCamara();

        this.renderizador.actualizarVista(this.camara.x, this.camara.y);
        this.uiManager.actualizar(this.player);
    }

    actualizarProyectiles(dt) {
        const radioColision = this.tileSize * 0.37;
        const colisionSq = radioColision * radioColision;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let bala = this.projectiles[i];

            if (isNaN(bala.vx) || isNaN(bala.vy)) {
                console.error("⚠️ ERROR: La velocidad de la bala es NaN.");
                continue;
            }

            let prevX = bala.x;
            let prevY = bala.y;
            let nextX = bala.x + bala.vx * dt;
            let nextY = bala.y + bala.vy * dt;

            let colisionPared = false;
            let bounced = false;

            if (bala.rebotadora && bala.rebotesRestantes > 0) {
                // Verificar choque en X
                if (this.collisionManager.esPared(nextX, prevY)) {
                    bala.vx = -bala.vx;
                    nextX = prevX + bala.vx * dt;
                    bounced = true;
                }
                // Verificar choque en Y
                if (this.collisionManager.esPared(prevX, nextY)) {
                    bala.vy = -bala.vy;
                    nextY = prevY + bala.vy * dt;
                    bounced = true;
                }
                
                if (bounced) {
                    bala.rebotesRestantes--;
                } else if (this.collisionManager.esPared(nextX, nextY)) {
                    bala.vx = -bala.vx;
                    bala.vy = -bala.vy;
                    nextX = prevX + bala.vx * dt;
                    nextY = prevY + bala.vy * dt;
                    bala.rebotesRestantes--;
                    bounced = true;
                }
            } else {
                if (this.collisionManager.esPared(nextX, nextY)) {
                    colisionPared = true;
                }
            }

            if (colisionPared) {
                bala.sprite.destroy();
                this.projectiles.splice(i, 1);
                continue;
            }

            bala.x = nextX;
            bala.y = nextY;
            bala.sprite.x = bala.x;
            bala.sprite.y = bala.y;

            if (bala.martillo) {
                bala.sprite.rotation += 15 * dt; // Rotar martillo giratorio
            }

            let impactoConfirmado = false;

            if (bala.enemigoOrigen || bala.owner === 'ENEMY') {
                // Bala de enemigo daña a Kitty
                let dx = bala.x - this.player.x;
                let dy = bala.y - this.player.y;
                let distSq = (dx * dx) + (dy * dy);

                if (distSq < colisionSq) {
                    impactoConfirmado = true;
                    if (!this.player.isDead && !this.player.isInvulnerable) {
                        const danioBala = bala.danio || (bala.enemigoOrigen ? Math.max(1, Math.round(bala.enemigoOrigen.calcularDanio(this.player) * 5)) : 10);
                        this.player.recibirDanio(danioBala);
                        this.uiManager.mostrarMensajeFlotante(`-${danioBala} HP 💥`, this.player.x, this.player.y - 30);
                    }
                }
            } else {
                // Bala del jugador daña a enemigos
                for (let j = 0; j < this.enemyManager.enemies.length; j++) {
                    let enemigo = this.enemyManager.enemies[j];

                    let dx = bala.x - enemigo.x;
                    let dy = bala.y - enemigo.y;
                    let distSq = (dx * dx) + (dy * dy);

                    if (distSq < colisionSq) {
                        enemigo.recibirGolpe(bala.danio || 20);
                        impactoConfirmado = true;
                        break;
                    }
                }
            }

            if (impactoConfirmado) {
                bala.sprite.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    actualizarCamara() {
        const zonaMuertaW = 150;
        const zonaMuertaH = 100;

        const dx = this.player.x - this.camara.x;
        const dy = this.player.y - this.camara.y;

        if (Math.abs(dx) > zonaMuertaW) {
            this.camara.x += (dx - (Math.sign(dx) * zonaMuertaW)) * 0.1;
        }

        if (Math.abs(dy) > zonaMuertaH) {
            this.camara.y += (dy - (Math.sign(dy) * zonaMuertaH)) * 0.1;
        }

        this.mundo.x = (window.innerWidth / 2) - this.camara.x;
        this.mundo.y = (window.innerHeight / 2) - this.camara.y;
    }

    verificarVictoria() {
        // Si no quedan enemigos y el juego no ha terminado...
        if (this.enemyManager.enemies.length === 0 && !this.gameOver) {
            this.gameOver = true;

            console.log("🏆 ¡Todos los enemigos eliminados! Nivel completado.");

            // Verificamos si lo que nos pasó el GameFactory es una función (Callback)
            if (typeof this.eventBus === 'function') {
                this.eventBus('LEVEL_VICTORY'); // La ejecutamos directamente
            }
            // Por si en el futuro decides cambiar la arquitectura a un EventBus real
            else if (this.eventBus && typeof this.eventBus.emit === 'function') {
                this.eventBus.emit('LEVEL_VICTORY');
            }
        }
    }

    verificarDerrota() {
        if (this.player.isDead && !this.gameOver) {
            this.gameOver = true;
            console.log("💔 ¡El jugador ha muerto! Juego terminado.");
            
            if (typeof this.eventBus === 'function') {
                this.eventBus('LEVEL_DEFEAT');
            } else if (this.eventBus && typeof this.eventBus.emit === 'function') {
                this.eventBus.emit('LEVEL_DEFEAT');
            }
        }
    }

    redimensionarEscena() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        this.resizeTimeout = setTimeout(() => {
            if (this.app && this.app.renderer) {
                this.app.renderer.resize(window.innerWidth, window.innerHeight);

                if (this.renderizador && typeof this.renderizador.redimensionarPantalla === 'function') {
                    this.renderizador.redimensionarPantalla(window.innerWidth, window.innerHeight);
                }

                if (this.uiManager && typeof this.uiManager.reajustarUI === 'function') {
                    this.uiManager.reajustarUI(window.innerWidth, window.innerHeight);
                }
            }
        }, 100);
    }

    verificarPortales() {
        if (!this.portales || this.portales.length === 0) return;

        // Obtener la posición de la celda del héroe
        const col = Math.floor(this.player.x / this.tileSize);
        const fila = Math.floor(this.player.y / this.tileSize);

        // Buscar si hay un portal en la coordenada actual
        const portal = this.portales.find(p => p.gridX === col && p.gridY === fila);
        if (portal) {
            // VERIFICACIÓN DUNGEON RAMPAGE: ¿Quedan enemigos vivos en la sala?
            if (this.enemyManager && this.enemyManager.enemies.length > 0) {
                if (!this.portalAvisoTimer || Date.now() - this.portalAvisoTimer > 1500) {
                    this.uiManager.mostrarMensajeFlotante("¡Puertas Selladas! 🚫 Elimina los monstruos", this.player.x, this.player.y - 40);
                    this.portalAvisoTimer = Date.now();
                }
                return; // Bloquea el teletransporte
            }

            // Verificar que tenga un destino y que estemos en un nivel cargado como pack
            if (portal.destinoMapa && portal.destinoPortal && this.pack) {
                const subMapaDestino = this.pack[portal.destinoMapa];
                if (subMapaDestino) {
                    const portalDestino = (subMapaDestino.portales || []).find(p => p.etiqueta === portal.destinoPortal);
                    if (portalDestino) {
                        this.cargarSubMapa(portal.destinoMapa, portalDestino.gridX, portalDestino.gridY);
                    } else {
                        console.warn(`No se encontró el portal de destino '${portal.destinoPortal}' en el mapa '${portal.destinoMapa}'.`);
                    }
                } else {
                    console.warn(`No se encontró el sub-mapa '${portal.destinoMapa}' en el paquete del nivel.`);
                }
            }
        }
    }

    cargarSubMapa(nombreMapa, destGridX, destGridY) {
        console.log(`Teletransportando a: Mapa [${nombreMapa}], Posición [${destGridX}, ${destGridY}]`);
        const subMapa = this.pack[nombreMapa];
        if (!subMapa) return;

        this.subMapaActual = nombreMapa;
        this.mapaMatriz = subMapa.matriz.map((fila) => fila.slice());
        this.portales = subMapa.portales || [];
        this.cofres = subMapa.cofres || [];

        // 1. Limpiar enemigos actuales
        this.enemyManager.destroy();

        // 2. Limpiar proyectiles actuales
        for (const proj of this.projectiles) {
            if (proj.sprite) {
                proj.sprite.destroy();
            }
        }
        this.projectiles = [];

        // 3. Actualizar la matriz física de colisiones
        this.collisionManager.mapaMatriz = this.mapaMatriz;

        // 4. Actualizar la matriz del renderizador y forzar la reconstrucción visual del pool de baldosas
        this.renderizador.matriz = this.mapaMatriz;
        this.renderizador.inicializarPool(window.innerWidth, window.innerHeight);

        // 5. Mover a Kitty a la celda del portal destino y centrar en ella
        this.player.x = destGridX * this.tileSize + (this.tileSize / 2);
        this.player.y = destGridY * this.tileSize + (this.tileSize / 2);
        this.player.actualizarPosicionVisual();

        // Centrar cámara instantáneamente en la nueva posición
        this.camara.x = this.player.x;
        this.camara.y = this.player.y;

        // 6. Cargar y spawnear los nuevos enemigos del sub-mapa
        this.enemyManager = new EnemyManager(this.capaEntidades, this.tileSize, subMapa.enemigos);
        this.enemyManager.engine = this;
        this.enemyManager.inicializar();

        this.actualizarHUDHtml();
    }

    verificarCofres() {
        if (!this.cofres || this.cofres.length === 0) return;

        const col = Math.floor(this.player.x / this.tileSize);
        const fila = Math.floor(this.player.y / this.tileSize);

        const cofreIndex = this.cofres.findIndex(c => c.gridX === col && c.gridY === fila);
        if (cofreIndex !== -1) {
            const cofre = this.cofres[cofreIndex];
            this.cofres.splice(cofreIndex, 1);

            this.mapaMatriz[fila][col] = 0;

            let mensajes = [];
            if (cofre.items) {
                for (const [key, value] of Object.entries(cofre.items)) {
                    // Mapeo automático de llaves antiguas para compatibilidad
                    let mappedKey = key;
                    if (key === 'cafe') mappedKey = 'gemas';
                    else if (key === 'nube') mappedKey = 'monedas';
                    else if (key === 'botiquin') mappedKey = 'pocion_vida';
                    else if (key === 'escudo') mappedKey = 'escudo_hierro';
                    else if (key === 'arma_doble') mappedKey = 'daga_doble';
                    else if (key === 'arma_rebotadora') mappedKey = 'martillo_rebote';

                    if (mappedKey === 'gemas') {
                        window.playerState.gemas += value;
                        mensajes.push(`+${value} 💎`);
                    } else if (mappedKey === 'monedas') {
                        window.playerState.monedas += value;
                        mensajes.push(`+${value} 🪙`);
                    } else if (mappedKey === 'pocion_vida') {
                        window.playerState.inventario.pocion_vida += value;
                        mensajes.push(`+${value} 🧪`);
                    } else if (mappedKey === 'escudo_hierro') {
                        window.playerState.inventario.escudo_hierro += value;
                        mensajes.push(`+${value} 🛡️`);
                    } else if (mappedKey === 'daga_doble') {
                        window.playerState.balas.daga_doble += value;
                        window.playerState.inventario.daga_doble = (window.playerState.inventario.daga_doble || 0) + value;
                        mensajes.push(`+${value} ⚔️`);
                    } else if (mappedKey === 'martillo_rebote') {
                        window.playerState.balas.martillo_rebote += value;
                        window.playerState.inventario.martillo_rebote = (window.playerState.inventario.martillo_rebote || 0) + value;
                        mensajes.push(`+${value} 🔨`);
                    }
                }
            }

            if (mensajes.length > 0) {
                this.uiManager.mostrarMensajeFlotante(`🎁 ${mensajes.join(' ')}`, this.player.x, this.player.y - 30);
            } else {
                this.uiManager.mostrarMensajeFlotante("¡Cofre vacío!", this.player.x, this.player.y - 30);
            }

            this.renderizador.matriz = this.mapaMatriz;
            this.renderizador.actualizarVista(this.camara.x, this.camara.y);
            this.actualizarHUDHtml();
        }
    }

    crearHUDHtml() {
        const hudViejo = document.getElementById('gameSlotsHUD');
        if (hudViejo) hudViejo.remove();

        this.hudElement = document.createElement('div');
        this.hudElement.id = 'gameSlotsHUD';
        this.hudElement.style = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            background: rgba(20, 18, 31, 0.85);
            border: 2px solid #d69e2e;
            border-radius: 16px;
            padding: 10px 15px;
            z-index: 999;
            backdrop-filter: blur(6px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            pointer-events: auto;
        `;
        document.body.appendChild(this.hudElement);
        this.actualizarHUDHtml();
    }

    actualizarHUDHtml() {
        if (!this.hudElement) return;

        const nombresDisplay = {
            "espada_basica": "🗡️ Espada",
            "daga_doble": "⚔️ Dagas",
            "martillo_rebote": "🔨 Martillo",
            "pocion_vida": "🧪 Poción",
            "escudo_hierro": "🛡️ Escudo"
        };

        let html = '';
        for (let i = 0; i < 5; i++) {
            const item = window.playerState.slots[i];
            const isActive = window.playerState.activeSlotIndex === i;
            const borderStyle = isActive ? 'border: 3px solid #d69e2e; background: rgba(214, 158, 46, 0.25);' : 'border: 2px solid #3e3b4e; background: rgba(0,0,0,0.4);';
            const cursor = (i === 0 || item) ? 'cursor: pointer;' : 'cursor: not-allowed;';
            const opacity = item ? 'opacity: 1;' : 'opacity: 0.4;';

            let countLabel = '';
            if (item === 'pocion_vida') {
                countLabel = `<span style="position: absolute; bottom: 2px; right: 4px; font-size: 0.75rem; color: #ffd700; font-weight: bold;">x${window.playerState.inventario.pocion_vida}</span>`;
            } else if (item === 'escudo_hierro') {
                countLabel = `<span style="position: absolute; bottom: 2px; right: 4px; font-size: 0.75rem; color: #ffd700; font-weight: bold;">x${window.playerState.inventario.escudo_hierro}</span>`;
            } else if (item === 'daga_doble') {
                const durVal = window.playerState.durabilidad.daga_doble !== undefined ? window.playerState.durabilidad.daga_doble : 100;
                countLabel = `<span style="position: absolute; bottom: 2px; right: 4px; font-size: 0.75rem; color: #ffffff; font-weight: bold;">${durVal.toFixed(0)}%</span>`;
            } else if (item === 'martillo_rebote') {
                const durVal = window.playerState.durabilidad.martillo_rebote !== undefined ? window.playerState.durabilidad.martillo_rebote : 100;
                countLabel = `<span style="position: absolute; bottom: 2px; right: 4px; font-size: 0.75rem; color: #ffffff; font-weight: bold;">${durVal.toFixed(0)}%</span>`;
            } else if (item === 'espada_basica' || i === 0) {
                const durVal = window.playerState.durabilidad.espada_basica !== undefined ? window.playerState.durabilidad.espada_basica : 100;
                countLabel = `<span style="position: absolute; bottom: 2px; right: 4px; font-size: 0.75rem; color: #ffffff; font-weight: bold;">${durVal.toFixed(0)}%</span>`;
            }

            const nombre = item ? nombresDisplay[item] : "Vacío";

            html += `
                <div onclick="window.orquestador.currentEngine.seleccionarSlot(${i})" style="position: relative; width: 70px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; ${borderStyle} ${cursor} ${opacity} transition: all 0.2s; color: white;">
                    <span style="font-size: 0.7rem; color: #d69e2e; font-weight: bold; margin-bottom: 2px;">Slot ${i + 1}</span>
                    <span style="font-size: 0.9rem; font-weight: bold;">${nombre}</span>
                    ${countLabel}
                </div>
            `;
        }
        this.hudElement.innerHTML = html;
    }

    seleccionarSlot(index) {
        if (index < 0 || index > 4) return;
        
        const item = window.playerState.slots[index];
        if (index > 0 && !item) {
            return;
        }

        window.playerState.activeSlotIndex = index;
        console.log(`Slot seleccionado: ${index + 1} (${item || 'Vacío'})`);
        this.actualizarHUDHtml();
    }

    togglePause() {
        if (this.gameOver) return;
        this.isPaused = !this.isPaused;
        const menuPausa = document.getElementById('menuPausa');
        if (menuPausa) {
            menuPausa.style.display = this.isPaused ? 'flex' : 'none';
        }
    }

    destroy() {
        clearTimeout(this.resizeTimeout);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerdown', this.handlePointerDown);
        window.removeEventListener('pointerup', this.handlePointerUp);
        window.removeEventListener('contextmenu', (e) => e.preventDefault());

        if (this.handleKeyDown) {
            window.removeEventListener('keydown', this.handleKeyDown);
        }

        if (this.hudElement) {
            this.hudElement.remove();
            this.hudElement = null;
        }

        const managers = [this.inputManager, this.renderizador, this.uiManager, this.enemyManager];
        for (const manager of managers) {
            if (manager && typeof manager.destroy === 'function') {
                manager.destroy();
            }
        }

        if (this.player) {
            if (this.player.sprite) {
                this.player.sprite.destroy(true);
                this.player.sprite = null;
            }
            this.player = null;
        }

        if (this.app) {
            this.app.destroy(true, {
                children: true,
                texture: true,
                baseTexture: true
            });
            this.app = null;
        }

        this.mapaMatriz = null;
        this.config = null;
        this.eventBus = null;
    }
}
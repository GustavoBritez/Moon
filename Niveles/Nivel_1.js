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

        this.settings = window.GAME_TUNING || { tileSize: 32, playerSpeed: 170, playerLives: 3 };
        this.tileSize = this.settings.tileSize;
        const spawn = this.obtenerSpawnInicial(this.mapaMatriz);

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
        this.uiManager = new UIManager(this.capaUI);
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
        const bolaKitty = new PIXI.Container();

        const sombra = new PIXI.Graphics();
        sombra.beginFill(0x000000, 0.22);
        sombra.drawEllipse(4, radioBase * 0.78, radioBase * 0.92, radioBase * 0.38);
        sombra.endFill();

        const brilloExterior = new PIXI.Graphics();
        brilloExterior.beginFill(0xff9ab4, 0.22);
        brilloExterior.drawCircle(0, 0, radioBase + 3);
        brilloExterior.endFill();

        const cuerpo = new PIXI.Graphics();
        cuerpo.beginFill(0xff6584);
        cuerpo.drawCircle(0, 0, radioBase);
        cuerpo.endFill();

        const nucleo = new PIXI.Graphics();
        nucleo.beginFill(0xff89a4, 0.95);
        nucleo.drawCircle(-radioBase * 0.18, -radioBase * 0.18, radioBase * 0.62);
        nucleo.endFill();

        const brillo = new PIXI.Graphics();
        brillo.beginFill(0xffffff, 0.92);
        brillo.drawCircle(-radioBase * 0.28, -radioBase * 0.28, radioBase * 0.18);
        brillo.endFill();

        const destello = new PIXI.Graphics();
        destello.beginFill(0xffffff, 0.18);
        destello.drawCircle(-radioBase * 0.42, -radioBase * 0.42, radioBase * 0.42);
        destello.endFill();

        bolaKitty.addChild(sombra, brilloExterior, cuerpo, nucleo, destello, brillo);

        this.player.setSprite(bolaKitty);
        this.capaEntidades.addChild(this.player.sprite);

        this.uiManager.actualizar(this.player);
        this.app.ticker.add((delta) => this.update(delta));
    }

    // ========================================================
    // HABILIDADES DEL JUGADOR
    // ========================================================

    disparar() {
        if (this.gameOver || this.isPaused || this.player.isDead) return;

        const mouseMundoX = this.mouseX - this.mundo.x;
        const mouseMundoY = this.mouseY - this.mundo.y;

        const dx = mouseMundoX - this.player.x;
        const dy = mouseMundoY - this.player.y;

        const angulo = Math.atan2(dy, dx);
        const velocidadBala = 600;

        const spriteBala = new PIXI.Graphics();
        spriteBala.lineStyle(2, 0xffffff); // Borde blanco añadido para mayor visibilidad
        spriteBala.beginFill(0x00ffff);
        spriteBala.drawCircle(0, 0, 5);
        spriteBala.endFill();
        spriteBala.blendMode = PIXI.BLEND_MODES.ADD;

        const bala = {
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angulo) * velocidadBala,
            vy: Math.sin(angulo) * velocidadBala,
            sprite: spriteBala
        };

        bala.sprite.x = bala.x;
        bala.sprite.y = bala.y;
        this.capaEntidades.addChild(bala.sprite);
        this.projectiles.push(bala);

        console.log(`¡Pew! Bala disparada hacia X:${Math.floor(mouseMundoX)} Y:${Math.floor(mouseMundoY)}`);
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

        this.verificarVictoria();
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
            }

            bala.x += bala.vx * dt;
            bala.y += bala.vy * dt;
            bala.sprite.x = bala.x;
            bala.sprite.y = bala.y;

            if (this.collisionManager.esPared(bala.x, bala.y)) {
                bala.sprite.destroy();
                this.projectiles.splice(i, 1);
                continue;
            }

            let impactoConfirmado = false;

            for (let j = 0; j < this.enemyManager.enemies.length; j++) {
                let enemigo = this.enemyManager.enemies[j];

                let dx = bala.x - enemigo.x;
                let dy = bala.y - enemigo.y;
                let distSq = (dx * dx) + (dy * dy);

                if (distSq < colisionSq) {
                    const danio = bala.enemigoOrigen ? bala.enemigoOrigen.calcularDanio(this.player) : 2;
                    this.player.recibirDanio(danio);
                    impactoConfirmado = true;
                    break;
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

        // Obtener la posición de la celda de Kitty
        const col = Math.floor(this.player.x / this.tileSize);
        const fila = Math.floor(this.player.y / this.tileSize);

        // Buscar si hay un portal en la coordenada actual
        const portal = this.portales.find(p => p.gridX === col && p.gridY === fila);
        if (portal) {
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
    }

    destroy() {
        clearTimeout(this.resizeTimeout);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerdown', this.handlePointerDown);
        window.removeEventListener('pointerup', this.handlePointerUp);
        window.removeEventListener('contextmenu', (e) => e.preventDefault());

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
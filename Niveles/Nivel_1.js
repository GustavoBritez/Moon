import { TilemapRenderer } from '.TilemapRenderer.js';
import { UIManager } from './UiManager/UiManager.js';
import { InputManager } from './PlayerControladorCarpet/InputManager.js';
import { CollisionManager } from './PlayerControladorCarpet/CollisionManager.js';
import { EnemyManager } from './Enemigo/EnemyManager.js';
import { Player } from './PlayerControladorCarpet/Player.js';
import { PlayerController } from './PlayerControladorCarpet/PlayerControllator.js';

export class Nivel_1 {
    constructor(canvas, config, eventBus) {
        if (!config || !config.matriz || !Array.isArray(config.matriz)) {
            throw new Error("Arquitectura estricta: Nivel abortado por falta de matriz.");
        }

        this.canvas = canvas;
        this.config = config;
        this.eventBus = eventBus;
        this.projectiles = [];

        // Clonamos la matriz para proteger los datos originales de nivel
        this.mapaMatriz = config.matriz.map((fila) => fila.slice());
        this.settings = window.GAME_TUNING || { tileSize: 32, playerSpeed: 170, playerLives: 3 };
        this.tileSize = this.settings.tileSize;

        // 1. Inicializar el motor gráfico PixiJS
        this.app = new PIXI.Application({
            view: canvas,
            resizeTo: window,
            backgroundColor: 0x14121f,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });

        // 2. Estructurar el árbol de nodos de PixiJS (Capas)
        this.mundo = new PIXI.Container();
        this.capaFondo = new PIXI.Container();
        this.capaEntidades = new PIXI.Container();
        this.capaUI = new PIXI.Container();

        this.mundo.addChild(this.capaFondo, this.capaEntidades);
        this.app.stage.addChild(this.mundo, this.capaUI);

        // 3. Inicializar el Modelo de Datos del Jugador (Datos puros)
        this.player = new Player(
            1.5 * this.tileSize,
            1.5 * this.tileSize,
            this.settings.playerSpeed,
            this.settings.playerLives
        );

        // 4. Inyección de dependencias y desacoplamiento de Gerentes (Managers)
        this.inputManager = new InputManager();
        this.collisionManager = new CollisionManager(this.mapaMatriz, this.tileSize);

        // El controlador asume la lógica del jugador usando sus dependencias
        this.playerController = new PlayerController(this.player, this.inputManager, this.collisionManager);

        this.renderizador = new TilemapRenderer(this.capaFondo, this.mapaMatriz, this.tileSize);
        this.uiManager = new UIManager(this.capaUI);
        this.enemyManager = new EnemyManager(this.capaEntidades, this.tileSize, this.config.enemigos);

        // La cámara inicia siguiendo las coordenadas lógicas iniciales de Kitty
        this.camara = {
            x: this.player.x,
            y: this.player.y
        };

        this.gameOver = false;
        this.isPaused = false;

        // Cachear la función resize para poder removerla correctamente en el destroy
        this.handleResize = () => this.redimensionarEscena();

        // Lanzar la puesta a punto del nivel
        this.start();
    }

    start() {
        // Suscribirse a eventos del navegador
        window.addEventListener('resize', this.handleResize);

        // Preparar buffers de memoria y pools de objetos gráficos
        this.renderizador.inicializarPool(window.innerWidth, window.innerHeight);
        this.enemyManager.inicializar();

        // Crear la representación visual (Sprite) de Kitty y enlazarla al modelo
        let graficoKitty = new PIXI.Graphics();
        graficoKitty.beginFill(0xff6584); // Rosado característico
        graficoKitty.drawCircle(0, 0, this.tileSize * 0.25);
        graficoKitty.endFill();

        this.player.sprite = graficoKitty;
        this.player.sprite.x = this.player.x;
        this.player.sprite.y = this.player.y;
        this.capaEntidades.addChild(this.player.sprite);

        // Forzar actualización visual inicial del HUD
        this.uiManager.actualizar(this.player);

        // Iniciar el Ticker principal (Game Loop) sincronizado a los hercios de la pantalla
        this.app.ticker.add((delta) => this.update(delta));
    }

    update(delta) {
        if (this.gameOver || this.isPaused) return;

        // Convertir el delta frame de PixiJS a Delta Time en segundos lógicos
        const dt = delta / this.app.ticker.FPS;

        // 1. Actualización en cascada de la lógica de los componentes autónomos
        this.playerController.update(dt);
        this.enemyManager.update(dt, this.player, this);
        this.actualizarProyectiles(dt);

        // 2. Evaluación de reglas del juego globales
        this.verificarVictoria();

        // 3. Procesamiento físico de la posición de la cámara (Caja de zona muerta)
        this.actualizarCamara();

        // 4. Sincronización final de la vista gráfica y la interfaz de usuario
        this.renderizador.actualizarVista(this.camara.x, this.camara.y);
        this.uiManager.actualizar(this.player);
    }

    dispararProyectil(direccionX, direccionY) {
        const velocidadBala = 400;
        let bala = {
            x: this.player.x, y: this.player.y,
            vx: direccionX * velocidadBala, vy: direccionY * velocidadBala,
            sprite: new PIXI.Graphics()
        };

        bala.sprite.beginFill(0xffff00); // Amarillo brillante
        bala.sprite.drawCircle(0, 0, this.tileSize * 0.15);
        bala.sprite.endFill();
        bala.sprite.x = bala.x; bala.sprite.y = bala.y;

        this.capaEntidades.addChild(bala.sprite);
        this.projectiles.push(bala);
    } s

    actualizarProyectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let bala = this.projectiles[i];
            bala.x += bala.vx * dt;
            bala.y += bala.vy * dt;
            bala.sprite.x = bala.x;
            bala.sprite.y = bala.y;

            // Choca contra pared
            if (this.collisionManager.esPared(bala.x, bala.y)) {
                bala.sprite.destroy();
                this.projectiles.splice(i, 1);
                continue;
            }

            // Choca contra enemigo
            for (let j = 0; j < this.enemyManager.enemies.length; j++) {
                let enemigo = this.enemyManager.enemies[j];
                let dist = Math.hypot(bala.x - enemigo.x, bala.y - enemigo.y);

                if (dist < (this.tileSize * 0.15 + this.tileSize * 0.22)) {
                    enemigo.recibirGolpe(this);
                    bala.sprite.destroy();
                    this.projectiles.splice(i, 1);
                    break; // Rompemos el bucle del enemigo actual
                }
            }
        }
    }
    actualizarCamara() {
        const pantallaW = window.innerWidth;
        const pantallaH = window.innerHeight;

        // Límites de libertad de movimiento para Kitty en el centro del encuadre
        const zonaMuertaX = 150;
        const zonaMuertaY = 100;

        // Comprobación de empuje lateral izquierdo o derecho
        if (this.player.x > this.camara.x + zonaMuertaX) {
            this.camara.x = this.player.x - zonaMuertaX;
        } else if (this.player.x < this.camara.x - zonaMuertaX) {
            this.camara.x = this.player.x + zonaMuertaX;
        }

        // Comprobación de empuje vertical superior o inferior
        if (this.player.y > this.camara.y + zonaMuertaY) {
            this.camara.y = this.player.y - zonaMuertaY;
        } else if (this.player.y < this.camara.y - zonaMuertaY) {
            this.camara.y = this.player.y + zonaMuertaY;
        }

        // Mover el contenedor global en sentido inverso para crear la ilusión de scroll orgánico
        this.mundo.x = (pantallaW / 2) - this.camara.x;
        this.mundo.y = (pantallaH / 2) - this.camara.y;
    }

    verificarVictoria() {
        // Si el mánager reporta que la lista está limpia, el nivel se da por concluido
        if (this.enemyManager.enemies.length === 0 && !this.gameOver) {
            this.gameOver = true;
            if (this.eventBus) {
                this.eventBus.emit('LEVEL_VICTORY');
            }
        }
    }

    redimensionarEscena() {
        if (this.app && this.app.renderer) {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);

            // Si el renderizador soporta redimensionado dinámico del pool, se lo notificamos
            if (this.renderizador && typeof this.renderizador.redimensionarPantalla === 'function') {
                this.renderizador.redimensionarPantalla(window.innerWidth, window.innerHeight);
            }
        }
    }

    destroy() {
        // 1. Desvincular listeners para prevenir fugas de memoria (Memory Leaks)
        window.removeEventListener('resize', this.handleResize);

        // 2. Solicitar limpieza de recursos internos de forma descendente
        if (this.inputManager && typeof this.inputManager.destroy === 'function') this.inputManager.destroy();
        if (this.renderizador && typeof this.renderizador.destroy === 'function') this.renderizador.destroy();
        if (this.uiManager && typeof this.uiManager.destroy === 'function') this.uiManager.destroy();

        this.enemyManager.destroy();

        // 3. Remover sprites explícitos de la memoria de texturas
        if (this.player && this.player.sprite) {
            this.player.sprite.destroy();
        }

        // 4. Apagar por completo el ticker de PixiJS y liberar buffers de la GPU
        this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    }
}
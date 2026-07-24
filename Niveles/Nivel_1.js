import { TilemapRenderer, TILE_DICT } from '../Service/TilemapRenderer.js';
import { UIManager } from './UiManager/UiManager.js';
import { InputManager } from './PlayerControladorCarpet/InputManager.js';
import { CollisionManager } from './PlayerControladorCarpet/CollisionManager.js';
import { EnemyManager } from './Enemigo/EnemyManager.js';
import { Player } from './PlayerControladorCarpet/Player.js';
import { PlayerController } from './PlayerControladorCarpet/PlayerControllator.js';
import { FieldOfView } from '../Service/FieldOfView.js';
import { SkillTreeManager } from '../Service/SkillTreeManager.js';
import { EconomyManager } from '../Service/EconomyManager.js';
import { NetworkManager } from '../Service/NetworkManager.js';

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
            if (e.key.toLowerCase() === 'r') {
                if (this.player && this.player.isFrozen) {
                    if (this.freezeSliderVal >= 40 && this.freezeSliderVal <= 60) {
                        this.descongelarJugador();
                    } else {
                        this.destellarFalloDescongelar();
                    }
                }
            } else if (e.key === ' ') {
                if (this.player && !this.player.isDead) {
                    const pGridX = Math.floor(this.player.x / this.tileSize);
                    const pGridY = Math.floor(this.player.y / this.tileSize);
                    const esp = this.espejos?.find(esp => Math.abs(esp.gridX - pGridX) <= 1 && Math.abs(esp.gridY - pGridY) <= 1);
                    if (esp) {
                        e.preventDefault();
                        esp.angulo = esp.angulo === 45 ? 135 : 45;
                        this.uiManager.mostrarMensajeFlotante("🔄 Espejo Rotado", esp.gridX * this.tileSize + this.tileSize / 2, esp.gridY * this.tileSize);
                        this.inicializarPuzzles();
                    }
                }
            } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
                const index = parseInt(e.key) - 1;
                this.seleccionarSlot(index);
            } else if (e.key === 'Escape' || e.key === 'Esc') {
                this.togglePause();
            } else if (e.key.toLowerCase() === 'h') {
                this.hKeyPressed = true;
            } else if (e.key === 'Shift' || e.key === 'ShiftLeft' || e.key === 'ShiftRight' || e.key.toLowerCase() === 'shift') {
                this.activarTurbo();
            }
        };

        this.handleKeyUp = (e) => {
            if (e.key.toLowerCase() === 'h') {
                this.hKeyPressed = false;
                this.reviveProgress = 0;
                this.reviveTarget = null;
                this.ocultarBarraRevive();
            }
        };

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        // Variables del sistema de revivir
        this.hKeyPressed = false;
        this.reviveProgress = 0;     // segundos acumulados
        this.reviveTime = 2.0;        // segundos necesarios para revivir
        this.reviveTarget = null;     // jugador remoto siendo revivido

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
        this.capaPuzzles = new PIXI.Container();

        this.mundo.addChild(this.capaFondo, this.capaPuzzles, this.capaEntidades);
        
        // Fondo negro base (para el Field of View)
        this.fondoOscuro = new PIXI.Graphics();
        this.fondoOscuro.beginFill(0x000000);
        this.fondoOscuro.drawRect(-10000, -10000, 20000, 20000);
        this.fondoOscuro.endFill();
        
        this.app.stage.addChild(this.fondoOscuro, this.mundo, this.capaUI);

        // Máscara de visión
        this.mascaraVision = new PIXI.Graphics();
        this.app.stage.addChild(this.mascaraVision);
        this.mundo.mask = this.mascaraVision;

        // 3. Inicializar el Modelo de Datos del Jugador
        this.player = new Player(
            spawn.x,
            spawn.y,
            this.settings.playerSpeed,
            this.settings.playerHP || 100
        );

        // Cargar arrays de puzzles
        this.cajas = JSON.parse(JSON.stringify(mapaInicial.cajas || []));
        this.mecanismos = JSON.parse(JSON.stringify(mapaInicial.mecanismos || []));
        this.holdouts = JSON.parse(JSON.stringify(mapaInicial.holdouts || []));
        this.lasers = JSON.parse(JSON.stringify(mapaInicial.lasers || []));
        this.espejos = JSON.parse(JSON.stringify(mapaInicial.espejos || []));
        this.receptores = JSON.parse(JSON.stringify(mapaInicial.receptores || []));
        this.secuencias = JSON.parse(JSON.stringify(mapaInicial.secuencias || []));
        this.cofres = []; // Arregla el crasheo al completar Holdout

        // Persistencia de estado de salas (evita reinicios y respawns al cambiar de mapa)
        this.savedRoomStates = new Map();
        this.subMapaActual = 'principal';

        // 4. Mánagers
        this.inputManager = new InputManager();
        this.collisionManager = new CollisionManager(this.mapaMatriz, this.tileSize);
        this.collisionManager.nivel = this;
        this.playerController = new PlayerController(this.player, this.inputManager, this.collisionManager);
        this.playerController.nivel = this;
        this.renderizador = new TilemapRenderer(this.capaFondo, this.mapaMatriz, this.tileSize);
        this.uiManager = new UIManager(this.capaUI, this.capaEntidades);
        this.enemyManager = new EnemyManager(this.capaEntidades, this.tileSize, this.enemigos);
        this.enemyManager.engine = this;
        this.fov = new FieldOfView(this.tileSize, TILE_DICT);
        this.skillManager = new SkillTreeManager(this);
        this.economyManager = new EconomyManager();

        // 5. Servidor Multijugador C#
        this.remotePlayers = new Map();
        this.remoteProjectiles = new Map(); // Rastrea proyectiles remotos rebotadores por bulletId
        this.networkManager = new NetworkManager();
        this.configurarEventosRed();

        // Inicializar vistas de puzzles
        this.inicializarPuzzles();

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
            visualHeroe.addChild(brilloExterior, cuerpo, nucleo, brillo);
        } else if (window.playerState.clase === 'archer') {
            // DISEÑO ARQUERO: Capucha verde, ágil
            const brilloExterior = new PIXI.Graphics();
            brilloExterior.beginFill(0x48bb78, 0.25);
            brilloExterior.drawCircle(0, 0, radioBase + 3);
            brilloExterior.endFill();

            const cuerpo = new PIXI.Graphics();
            cuerpo.beginFill(0x2f855a); // Verde bosque oscuro
            cuerpo.drawCircle(0, 0, radioBase);
            cuerpo.endFill();

            const capucha = new PIXI.Graphics();
            capucha.beginFill(0x276749); // Verde más oscuro
            capucha.drawRect(-radioBase * 0.6, -radioBase * 0.8, radioBase * 1.2, radioBase * 0.8, 4);
            capucha.endFill();

            const pluma = new PIXI.Graphics();
            pluma.beginFill(0xffffff); // Pluma blanca
            pluma.drawRect(radioBase * 0.2, -radioBase * 1.2, 4, 15);
            pluma.endFill();

            visualHeroe.addChild(brilloExterior, cuerpo, capucha, pluma);
        } else if (window.playerState.clase === 'shaman') {
            // DISEÑO CHAMÁN: Adornos tribales, huesos y magia natural
            const brilloExterior = new PIXI.Graphics();
            brilloExterior.beginFill(0xed8936, 0.25);
            brilloExterior.drawCircle(0, 0, radioBase + 5);
            brilloExterior.endFill();

            const cuerpo = new PIXI.Graphics();
            cuerpo.beginFill(0xc05621); // Naranja tierra oscuro
            cuerpo.drawCircle(0, 0, radioBase);
            cuerpo.endFill();

            const mascara = new PIXI.Graphics();
            mascara.beginFill(0xffffff); // Máscara de hueso
            mascara.drawEllipse(0, -radioBase * 0.2, radioBase * 0.6, radioBase * 0.4);
            mascara.endFill();

            const ojoIzq = new PIXI.Graphics();
            ojoIzq.beginFill(0xe53e3e); // Ojos rojos brillantes
            ojoIzq.drawCircle(-radioBase * 0.2, -radioBase * 0.2, 3);
            ojoIzq.endFill();

            const ojoDer = new PIXI.Graphics();
            ojoDer.beginFill(0xe53e3e);
            ojoDer.drawCircle(radioBase * 0.2, -radioBase * 0.2, 3);
            ojoDer.endFill();

            visualHeroe.addChild(brilloExterior, cuerpo, mascara, ojoIzq, ojoDer);
        } else if (window.playerState.clase === 'summoner') {
            // DISEÑO INVOCADOR: Túnica oscura con runas brillantes cyan
            const brilloExterior = new PIXI.Graphics();
            brilloExterior.beginFill(0x0bc5ea, 0.25);
            brilloExterior.drawCircle(0, 0, radioBase + 6);
            brilloExterior.endFill();

            const cuerpo = new PIXI.Graphics();
            cuerpo.beginFill(0x1a202c); // Casi negro
            cuerpo.drawCircle(0, 0, radioBase);
            cuerpo.endFill();

            const runa = new PIXI.Graphics();
            runa.lineStyle(2, 0x0bc5ea);
            runa.moveTo(-radioBase * 0.3, -radioBase * 0.3);
            runa.lineTo(radioBase * 0.3, radioBase * 0.3);
            runa.moveTo(radioBase * 0.3, -radioBase * 0.3);
            runa.lineTo(-radioBase * 0.3, radioBase * 0.3);
            runa.moveTo(0, -radioBase * 0.5);
            runa.lineTo(0, radioBase * 0.5);
            runa.endFill();

            visualHeroe.addChild(brilloExterior, cuerpo, runa);
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

    configurarEventosRed() {
        if (!this.networkManager) return;

        const roomInicial = this.subMapaActual || 'principal';

        const inicializarRedNivel = () => {
            if (this.networkManager && this.networkManager.isConnected) {
                console.log(`🌐 Inicializando sala de red '${roomInicial}' para Nivel_1...`);
                this.networkManager.sendChangeRoom(roomInicial, this.enemigos);
            }
        };

        // Ejecutar inmediatamente si el socket ya estaba abierto desde el lobby
        if (this.networkManager.isConnected) {
            inicializarRedNivel();
        }

        this.networkManager.onInitCallback = (packet) => {
            console.log("🌐 Conectado a la sala C#. Mis datos inicializados.");
            inicializarRedNivel();
            if (packet.players) {
                this.syncPlayersFromServer(packet.players);
            }
            if (packet.enemies) {
                this.syncEnemiesFromServer(packet.enemies, packet);
            }
        };

        this.networkManager.onPlayerJoinCallback = (packet) => {
            if (packet.id !== this.networkManager.myId) {
                if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
                console.log(`👤 Nuevo jugador remoto ingresó: ${packet.id}`);
                this.spawnRemotePlayer(packet);
                this.uiManager.mostrarMensajeFlotante(`👤 ¡Jugador ${packet.id.substring(0, 4)} se unió!`, this.player.x, this.player.y - 40);
            }
        };

        this.networkManager.onPlayerLeaveCallback = (packet) => {
            if (this.remotePlayers.has(packet.id)) {
                const rp = this.remotePlayers.get(packet.id);
                if (rp && rp.sprite) rp.sprite.destroy({ children: true });
                this.remotePlayers.delete(packet.id);
                console.log(`🚪 Jugador remoto se retiró: ${packet.id}`);
            }
        };

        this.networkManager.onMoveCallback = (packet) => {
            if (packet.id === this.networkManager.myId) return;
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
            if (!this.remotePlayers.has(packet.id)) {
                this.spawnRemotePlayer(packet);
            }
            const rp = this.remotePlayers.get(packet.id);
            if (rp) {
                rp.targetX = packet.x;
                rp.targetY = packet.y;
                if (packet.angle !== undefined) rp.targetAngle = packet.angle;
                if (packet.clase && packet.clase !== rp.clase) {
                    // Clase cambió: regenerar el sprite con el diseño correcto de la nueva clase
                    const oldSprite = rp.sprite;
                    const claseNombre = packet.clase.toLowerCase();
                    const nuevoContainer = this.crearVisualHeroeRemoto(claseNombre);
                    nuevoContainer.x = rp.x;
                    nuevoContainer.y = rp.y;
                    nuevoContainer.visible = rp.sprite.visible;

                    const etiquetasClase = {
                        'mage': '🧙‍♂️ Mago', 'archer': '🏹 Arquero',
                        'summoner': '🔮 Invocador', 'shaman': '🔥 Chamán', 'knight': '⚔️ Caballero'
                    };
                    const textTag = new PIXI.Text(`[P] ${packet.id.substring(0, 4)} (${etiquetasClase[claseNombre] || 'Héroe'})`, {
                        fontFamily: 'Arial', fontSize: 11, fill: 0x00ffff, fontWeight: 'bold',
                        dropShadow: true, dropShadowColor: '#000', dropShadowBlur: 3
                    });
                    textTag.anchor.set(0.5, 2.2);
                    nuevoContainer.addChild(textTag);

                    this.capaEntidades.addChild(nuevoContainer);
                    if (oldSprite) oldSprite.destroy({ children: true });
                    rp.sprite = nuevoContainer;
                    rp.clase = claseNombre;
                }
            }
        };

        this.networkManager.onBoxMoveCallback = (packet) => {
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
            if (this.cajas && this.cajas[packet.boxId]) {
                this.cajas[packet.boxId].gridX = packet.gridX;
                this.cajas[packet.boxId].gridY = packet.gridY;
            }
        };

        this.networkManager.onShootCallback = (packet) => {
            if (packet.id === this.networkManager.myId) return;
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
            this.spawnRemoteProjectile(packet);
        };

        this.networkManager.onShootUpdateCallback = (packet) => {
            if (packet.id === this.networkManager.myId) return;
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
            if (!packet.bulletId || !this.remoteProjectiles) return;
            const rp = this.remoteProjectiles.get(packet.bulletId);
            if (rp) {
                rp.x = packet.x;
                rp.y = packet.y;
                rp.vx = packet.vx;
                rp.vy = packet.vy;
                if (rp.sprite) {
                    rp.sprite.x = rp.x;
                    rp.sprite.y = rp.y;
                }
            }
        };

        this.networkManager.onSummonAlliedCallback = (packet) => {
            if (packet.id === this.networkManager.myId) return;
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
            const aliadoRemoto = new AlliedEntity(
                packet.x,
                packet.y,
                packet.tipo || 'wolf',
                null,
                this.enemyManager,
                this.capaEntidades
            );
            if (!this.remoteAllies) this.remoteAllies = [];
            this.remoteAllies.push(aliadoRemoto);
            this.uiManager.mostrarMensajeFlotante(`🐾 ¡Lobo aliado de ${packet.id.substring(0, 4)} invocado!`, packet.x, packet.y - 30);
            this.uiManager.agregarMensajeConsola(`🐾 Jugador ${packet.id.substring(0, 4)} invocó un ${packet.tipo === 'wolf' ? 'Lobo' : 'Gólem'} Aliado`, '#9b59b6');
        };

        this.networkManager.onSpawnEnemyCallback = (packet) => {
            if (!packet || !packet.enemyData) return;
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
            const targetIdStr = String(packet.enemyData.id);
            const existe = this.enemyManager && this.enemyManager.enemies ? this.enemyManager.enemies.some(e => String(e.id) === targetIdStr) : false;
            if (!existe && this.enemyManager) {
                const esqueleto = this.enemyManager.spawnEnemy(packet.enemyData);
                esqueleto.hasAggro = true;
                if (esqueleto.sprite) {
                    esqueleto.sprite.x = esqueleto.x;
                    esqueleto.sprite.y = esqueleto.y;
                }
            }
        };

        this.networkManager.onEnemyHitCallback = (packet) => {
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
            if (this.enemyManager && this.enemyManager.enemies) {
                const targetIdStr = String(packet.targetId);
                const enemy = this.enemyManager.enemies.find(e => String(e.id) === targetIdStr);
                if (enemy) {
                    if (packet.hp !== undefined && packet.hp >= 0) {
                        enemy.vidaActual = packet.hp;
                    }
                    if ((packet.isDead || enemy.vidaActual <= 0) && !enemy.isDead) {
                        enemy.morir(true);
                    }
                }
            }

            if (packet.levelCompleted) {
                this.verificarVictoria();
            }
        };

        this.networkManager.onEnemySyncCallback = (packet) => {
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
            if (packet.enemies) {
                this.syncEnemiesFromServer(packet.enemies, packet);
            }
        };

        this.networkManager.onRoomStateCallback = (packet) => {
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;
            if (packet.players) {
                this.syncPlayersFromServer(packet.players);
            }
            if (packet.enemies) {
                this.syncEnemiesFromServer(packet.enemies, packet);
            }
            if (packet.boxes && this.cajas) {
                packet.boxes.forEach(b => {
                    if (this.cajas[b.id]) {
                        this.cajas[b.id].gridX = b.gridX;
                        this.cajas[b.id].gridY = b.gridY;
                    }
                });
            }
        };

        this.networkManager.onStateSyncCallback = (packet) => {
            if (packet.roomId && packet.roomId !== (this.subMapaActual || 'principal')) return;

            // Sincronización Server-Authoritative de cajas Sokoban
            if (packet.boxes && this.cajas) {
                packet.boxes.forEach(b => {
                    if (this.cajas[b.id]) {
                        this.cajas[b.id].gridX = b.gridX;
                        this.cajas[b.id].gridY = b.gridY;
                    }
                });
            }

            // Sincronización Server-Authoritative de posiciones de enemigos
            if (packet.enemies) {
                this.syncEnemiesFromServer(packet.enemies, packet);
            }

            if (packet.players) {
                this.syncPlayersFromServer(packet.players);
            }
        };
    }

    isMasterClient() {
        if (!this.networkManager || !this.networkManager.isConnected) return true;
        if (!this.remotePlayers || this.remotePlayers.size === 0) return true;

        const myId = String(this.networkManager.myId || '');
        let isLowest = true;
        this.remotePlayers.forEach((rp, remoteId) => {
            if (String(remoteId) < myId) {
                isLowest = false;
            }
        });
        return isLowest;
    }

    syncEnemiesFromServer(serverEnemies, packet = null) {
        if (!serverEnemies || !Array.isArray(serverEnemies) || !this.enemyManager || !this.enemyManager.enemies) return;

        const activeServerEnemyIds = new Set(serverEnemies.filter(se => se && !(se.isDead || se.IsDead || (se.hp !== undefined && se.hp <= 0) || (se.Hp !== undefined && se.Hp <= 0))).map(se => String(se.id !== undefined ? se.id : se.Id)));

        // 1. Eliminar enemigos locales que no están activos en el servidor de esta sala
        this.enemyManager.enemies.forEach(e => {
            if (!e.isDead && !activeServerEnemyIds.has(String(e.id))) {
                e.morir(true);
            }
        });

        // 2. Sincronizar o crear enemigos autoritarios del servidor
        serverEnemies.forEach(se => {
            if (!se) return;
            const targetIdStr = String(se.id !== undefined ? se.id : (se.Id !== undefined ? se.Id : ''));
            if (!targetIdStr) return;

            let localEnemy = this.enemyManager.enemies.find(e => String(e.id) === targetIdStr);
            if (!localEnemy && this.enemyManager.pool) {
                localEnemy = this.enemyManager.pool.find(e => String(e.id) === targetIdStr);
            }

            if (localEnemy) {
                const hp = se.hp !== undefined ? se.hp : se.Hp;
                const isDead = se.isDead !== undefined ? se.isDead : se.IsDead;

                if (hp !== undefined && !isNaN(hp)) localEnemy.vidaActual = hp;

                if ((isDead || localEnemy.vidaActual <= 0) && !localEnemy.isDead) {
                    localEnemy.morir(true);
                }

                const sx = se.x !== undefined ? se.x : se.X;
                const sy = se.y !== undefined ? se.y : se.Y;
                if (sx !== undefined && sy !== undefined && !isNaN(sx) && !isNaN(sy) && (sx > 0 || sy > 0)) {
                    localEnemy.targetX = sx;
                    localEnemy.targetY = sy;
                    localEnemy.serverControlled = true;
                }
            } else if (!se.isDead && !se.IsDead && ((se.hp !== undefined && se.hp > 0) || (se.Hp !== undefined && se.Hp > 0) || se.hp === undefined)) {
                // Si el servidor reporta un enemigo activo que este cliente no posee, crearlo dinámicamente
                const sx = se.x !== undefined ? se.x : se.X;
                const sy = se.y !== undefined ? se.y : se.Y;
                const hp = se.hp !== undefined ? se.hp : se.Hp;
                const vel = se.velocidad !== undefined ? se.velocidad : se.Velocidad;

                const nuevoEnemigo = this.enemyManager.spawnEnemy({
                    id: targetIdStr,
                    tipo: se.tipo || se.Tipo || 'BASE',
                    gridX: Math.floor((sx || 0) / this.tileSize),
                    gridY: Math.floor((sy || 0) / this.tileSize),
                    vida: hp || 100,
                    velocidad: vel || 85
                });
                if (nuevoEnemigo) {
                    nuevoEnemigo.hasAggro = true;
                    if (sx !== undefined && sy !== undefined && !isNaN(sx) && !isNaN(sy)) {
                        nuevoEnemigo.x = sx;
                        nuevoEnemigo.y = sy;
                        if (nuevoEnemigo.sprite) {
                            nuevoEnemigo.sprite.x = sx;
                            nuevoEnemigo.sprite.y = sy;
                        }
                    }
                }
            }
        });
    }

    syncPlayersFromServer(playersList) {
        if (!playersList) return;
        const currentRoom = this.subMapaActual || 'principal';
        const activeServerIds = new Set(playersList.filter(p => !p.roomId || p.roomId === currentRoom).map(p => p.id));

        // Limpiar jugadores remotos que ya no pertenecen a esta sala
        this.remotePlayers.forEach((rp, id) => {
            if (!activeServerIds.has(id)) {
                if (rp && rp.sprite) rp.sprite.destroy({ children: true });
                this.remotePlayers.delete(id);
            }
        });

        playersList.forEach(p => {
            if (p.id !== this.networkManager.myId) {
                if (p.roomId && p.roomId !== currentRoom) {
                    if (this.remotePlayers.has(p.id)) {
                        const rp = this.remotePlayers.get(p.id);
                        if (rp && rp.sprite) rp.sprite.destroy({ children: true });
                        this.remotePlayers.delete(p.id);
                    }
                    return;
                }

                if (!this.remotePlayers.has(p.id)) {
                    this.spawnRemotePlayer(p);
                } else {
                    const rp = this.remotePlayers.get(p.id);
                    rp.targetX = p.x;
                    rp.targetY = p.y;
                    if (p.angle !== undefined) rp.targetAngle = p.angle;
                }
            }
        });
    }

    onBoxPushed(boxIndex, gridX, gridY) {
        if (this.networkManager && this.networkManager.isConnected) {
            this.networkManager.sendBoxMove(boxIndex, gridX, gridY);
        }
    }

    spawnRemotePlayer(data) {
        if (!data || !data.id) return;
        if (this.networkManager && data.id === this.networkManager.myId) return;
        const currentRoom = this.subMapaActual || 'principal';
        if (data.roomId && data.roomId !== currentRoom) return;
        if (this.remotePlayers.has(data.id)) return;

        const hasValidPos = Boolean(data.x && data.x > 10 && data.y && data.y > 10);
        const spawnX = hasValidPos ? data.x : (this.player ? this.player.x : 100);
        const spawnY = hasValidPos ? data.y : (this.player ? this.player.y : 100);

        const claseNombre = (data.clase || 'knight').toLowerCase();
        const container = this.crearVisualHeroeRemoto(claseNombre);
        container.x = spawnX;
        container.y = spawnY;
        container.visible = hasValidPos;

        const etiquetasClase = {
            'mage': '🧙‍♂️ Mago',
            'archer': '🏹 Arquero',
            'summoner': '🔮 Invocador',
            'shaman': '🔥 Chamán',
            'knight': '⚔️ Caballero'
        };

        // Añadir etiqueta de ID y Clase
        const textTag = new PIXI.Text(`[P] ${data.id.substring(0, 4)} (${etiquetasClase[claseNombre] || 'Héroe'})`, {
            fontFamily: 'Arial', fontSize: 11, fill: 0x00ffff, fontWeight: 'bold',
            dropShadow: true, dropShadowColor: '#000', dropShadowBlur: 3
        });
        textTag.anchor.set(0.5, 2.2);
        container.addChild(textTag);

        this.capaEntidades.addChild(container);
        this.remotePlayers.set(data.id, {
            id: data.id,
            x: spawnX,
            y: spawnY,
            targetX: spawnX,
            targetY: spawnY,
            targetAngle: 0,
            clase: claseNombre,
            sprite: container
        });
    }

    crearVisualHeroeRemoto(clase) {
        const radioBase = this.tileSize * 0.38;
        const container = new PIXI.Container();

        // Sombra suave bajo los pies
        const sombra = new PIXI.Graphics();
        sombra.beginFill(0x000000, 0.35);
        sombra.drawEllipse(0, radioBase * 0.85, radioBase * 0.95, radioBase * 0.32);
        sombra.endFill();
        container.addChild(sombra);

        // 1. Cabeza base de Héroe (Blanco Nieve como el personaje local)
        const cabeza = new PIXI.Graphics();
        cabeza.beginFill(0xffffff);
        cabeza.drawCircle(0, 0, radioBase);
        cabeza.endFill();

        // 2. Orejas felinas/héroe
        const orejas = new PIXI.Graphics();
        orejas.beginFill(0xffffff);
        orejas.drawPolygon([-radioBase * 0.8, -radioBase * 0.2, -radioBase * 0.5, -radioBase * 1.1, -radioBase * 0.1, -radioBase * 0.6]);
        orejas.drawPolygon([radioBase * 0.1, -radioBase * 0.6, radioBase * 0.5, -radioBase * 1.1, radioBase * 0.8, -radioBase * 0.2]);
        orejas.endFill();

        const interiorOrejas = new PIXI.Graphics();
        interiorOrejas.beginFill(0xffb6c1);
        interiorOrejas.drawPolygon([-radioBase * 0.7, -radioBase * 0.3, -radioBase * 0.5, -radioBase * 0.9, -radioBase * 0.2, -radioBase * 0.6]);
        interiorOrejas.drawPolygon([radioBase * 0.2, -radioBase * 0.6, radioBase * 0.5, -radioBase * 0.9, radioBase * 0.7, -radioBase * 0.3]);
        interiorOrejas.endFill();

        // 3. Ojos oscuros y mejillas sonrojadas
        const ojoIzq = new PIXI.Graphics();
        ojoIzq.beginFill(0x2d3748);
        ojoIzq.drawEllipse(-radioBase * 0.35, -radioBase * 0.1, 3, 4);
        ojoIzq.endFill();

        const ojoDer = new PIXI.Graphics();
        ojoDer.beginFill(0x2d3748);
        ojoDer.drawEllipse(radioBase * 0.35, -radioBase * 0.1, 3, 4);
        ojoDer.endFill();

        const mejillaIzq = new PIXI.Graphics();
        mejillaIzq.beginFill(0xe53e3e, 0.6);
        mejillaIzq.drawCircle(-radioBase * 0.5, radioBase * 0.15, 3.5);
        mejillaIzq.endFill();

        const mejillaDer = new PIXI.Graphics();
        mejillaDer.beginFill(0xe53e3e, 0.6);
        mejillaDer.drawCircle(radioBase * 0.5, radioBase * 0.15, 3.5);
        mejillaDer.endFill();

        container.addChild(orejas, interiorOrejas, cabeza, ojoIzq, ojoDer, mejillaIzq, mejillaDer);

        // 4. Accesorios y Sombreros por Clase
        const accesorio = new PIXI.Graphics();
        if (clase === 'mage') {
            // Gorro de Mago Arcano
            accesorio.beginFill(0x6b46c1);
            accesorio.drawPolygon([-radioBase * 0.8, -radioBase * 0.4, 0, -radioBase * 1.5, radioBase * 0.8, -radioBase * 0.4]);
            accesorio.endFill();
            accesorio.beginFill(0xf6e05e);
            accesorio.drawCircle(0, -radioBase * 0.9, 3);
            accesorio.endFill();
        } else if (clase === 'archer') {
            // Capucha Verde con Pluma
            accesorio.beginFill(0x27ae60);
            accesorio.drawRect(-radioBase * 0.6, -radioBase * 0.9, radioBase * 1.2, radioBase * 0.4, 3);
            accesorio.endFill();
            accesorio.beginFill(0xffffff);
            accesorio.drawRect(radioBase * 0.3, -radioBase * 1.3, 4, 12);
            accesorio.endFill();
        } else if (clase === 'summoner') {
            // Cuernos Místicos del Invocador
            accesorio.beginFill(0x8b5cf6);
            accesorio.drawPolygon([-10, -8, -6, -18, -2, -8]);
            accesorio.drawPolygon([2, -8, 6, -18, 10, -8]);
            accesorio.endFill();
        } else if (clase === 'shaman') {
            // Adorno Máscara Totémica
            accesorio.beginFill(0xd69e2e);
            accesorio.drawRect(-8, -12, 16, 6);
            accesorio.endFill();
        } else {
            // CABALLERO: Yelmo / Visor Dorado
            accesorio.beginFill(0x718096);
            accesorio.drawRect(-radioBase * 0.7, -radioBase * 0.7, radioBase * 1.4, radioBase * 0.5, 3);
            accesorio.endFill();
            accesorio.beginFill(0xd69e2e);
            accesorio.drawRect(-radioBase * 0.5, -radioBase * 0.5, radioBase * 1.0, radioBase * 0.25);
            accesorio.endFill();
        }

        container.addChild(accesorio);
        return container;
    }

    spawnRemoteProjectile(data) {
        if (!data || data.x === undefined || data.y === undefined) return;
        const speed = data.speed || 400;
        const angle = data.angle || 0;
        const clase = (data.clase || 'knight').toLowerCase();
        const weapon = (data.weapon || 'espada_basica').toLowerCase();
        const ticker = this.app?.ticker || PIXI.Ticker.shared;

        // ====== LÓGICA POR CLASE (tiene prioridad absoluta sobre weapon) ======
        // Mago: esfera idéntica a la local (3 capas: aura exterior + núcleo + brillo)
        if (clase === 'mage') {
            const bulletSpeed = 600 * 0.95; // Idéntico al local
            const gfx = new PIXI.Graphics();
            gfx.beginFill(0xb794f4, 0.4);   // Aura exterior lavanda (igual al local)
            gfx.drawCircle(0, 0, 10);
            gfx.endFill();
            gfx.beginFill(0x805ad5, 0.9);   // Núcleo violeta (igual al local)
            gfx.drawCircle(0, 0, 6);
            gfx.endFill();
            gfx.beginFill(0xffffff, 0.9);   // Brillo blanco (igual al local)
            gfx.drawCircle(-2, -2, 2);
            gfx.endFill();
            gfx.x = data.x;
            gfx.y = data.y;
            gfx.rotation = angle;
            this.capaEntidades.addChild(gfx);
            const proj = { sprite: gfx, x: data.x, y: data.y, vx: Math.cos(angle) * bulletSpeed, vy: Math.sin(angle) * bulletSpeed, owner: 'REMOTE_PLAYER', rebotadora: true, rebotesRestantes: 3 };
            this.projectiles.push(proj);
            // Registrar en mapa de proyectiles remotos para sincronizar rebotes
            if (data.bulletId) this.remoteProjectiles.set(data.bulletId, proj);
            return;
        }

        // Arquero: siempre flecha verde
        if (clase === 'archer') {
            const gfx = new PIXI.Graphics();
            gfx.beginFill(0xd35400);
            gfx.drawPolygon([-10, -2, 8, 0, -10, 2]);
            gfx.endFill();
            gfx.beginFill(0x27ae60);
            gfx.drawPolygon([6, -4, 12, 0, 6, 4]);
            gfx.endFill();
            gfx.x = data.x;
            gfx.y = data.y;
            gfx.rotation = angle;
            this.capaEntidades.addChild(gfx);
            this.projectiles.push({ sprite: gfx, x: data.x, y: data.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, owner: 'REMOTE_PLAYER' });
            return;
        }

        // Chamán: proyectil de fuego naranja/rojo
        if (clase === 'shaman') {
            const gfx = new PIXI.Graphics();
            gfx.beginFill(0xff6b00, 0.95);
            gfx.drawCircle(0, 0, 7);
            gfx.endFill();
            gfx.lineStyle(2, 0xff3300, 0.8);
            gfx.drawCircle(0, 0, 10);
            gfx.x = data.x;
            gfx.y = data.y;
            gfx.rotation = angle;
            this.capaEntidades.addChild(gfx);
            this.projectiles.push({ sprite: gfx, x: data.x, y: data.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, owner: 'REMOTE_PLAYER' });
            return;
        }

        // Invocador: proyectil místico púrpura oscuro
        if (clase === 'summoner') {
            const gfx = new PIXI.Graphics();
            gfx.beginFill(0x4a0080, 0.95);
            gfx.drawCircle(0, 0, 7);
            gfx.endFill();
            gfx.lineStyle(2, 0xcc44ff, 0.9);
            gfx.drawCircle(0, 0, 10);
            gfx.x = data.x;
            gfx.y = data.y;
            gfx.rotation = angle;
            this.capaEntidades.addChild(gfx);
            this.projectiles.push({ sprite: gfx, x: data.x, y: data.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, owner: 'REMOTE_PLAYER' });
            return;
        }

        // ====== KNIGHT y otros: basados en el arma equipada ======
        if (weapon === 'daga_doble') {
            const gfx = new PIXI.Graphics();
            gfx.lineStyle(1.5, 0xffffff);
            gfx.beginFill(0x95a5a6);
            gfx.drawPolygon([-8, -2, 8, 0, -8, 2]);
            gfx.endFill();
            gfx.x = data.x;
            gfx.y = data.y;
            gfx.rotation = angle;
            this.capaEntidades.addChild(gfx);
            this.projectiles.push({ sprite: gfx, x: data.x, y: data.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, owner: 'REMOTE_PLAYER' });
            return;
        }

        if (weapon === 'martillo_rebote') {
            const gfx = new PIXI.Graphics();
            gfx.lineStyle(1.5, 0xd69e2e);
            gfx.beginFill(0x57606f);
            gfx.drawRect(-4, -10, 8, 20);
            gfx.drawRect(-12, -10, 24, 8);
            gfx.endFill();
            gfx.x = data.x;
            gfx.y = data.y;
            gfx.rotation = angle;
            this.capaEntidades.addChild(gfx);
            this.projectiles.push({ sprite: gfx, x: data.x, y: data.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, owner: 'REMOTE_PLAYER' });
            return;
        }

        // Knight espada básica: Tajo de espada dorado
        const radioSlash = 85;
        const slashGfx = new PIXI.Graphics();
        slashGfx.lineStyle(3, 0xffffff, 0.9);
        slashGfx.beginFill(0xf1c40f, 0.45);
        slashGfx.arc(0, 0, radioSlash, -Math.PI / 4, Math.PI / 4);
        slashGfx.lineTo(0, 0);
        slashGfx.endFill();
        slashGfx.x = data.x;
        slashGfx.y = data.y;
        slashGfx.rotation = angle;
        this.capaEntidades.addChild(slashGfx);

        let alphaTimer = 0.15;
        const animarSlashRemoto = () => {
            alphaTimer -= 0.016;
            slashGfx.alpha = Math.max(0, alphaTimer / 0.15);
            if (alphaTimer <= 0) {
                ticker.remove(animarSlashRemoto);
                slashGfx.destroy();
            }
        };
        ticker.add(animarSlashRemoto);
    }

    actualizarJugadoresRemotos(dt) {
        // Interpolación exponencial fluida independiente de la tasa de refresco (Anti-Glitches)
        const lerpFactor = 1.0 - Math.exp(-22 * dt);
        this.remotePlayers.forEach(rp => {
            if (rp.targetX !== undefined && rp.targetY !== undefined) {
                if (rp.targetX > 10 && rp.targetY > 10 && rp.sprite && !rp.sprite.visible) {
                    rp.sprite.visible = true;
                    rp.x = rp.targetX;
                    rp.y = rp.targetY;
                }

                const dist = Math.hypot(rp.targetX - rp.x, rp.targetY - rp.y);
                if (dist > 160) {
                    // Teletransporte instantáneo para portales sin arrastre por paredes
                    rp.x = rp.targetX;
                    rp.y = rp.targetY;
                } else if (dist > 1.2) {
                    rp.x += (rp.targetX - rp.x) * lerpFactor;
                    rp.y += (rp.targetY - rp.y) * lerpFactor;
                } else {
                    rp.x = rp.targetX;
                    rp.y = rp.targetY;
                }

                if (rp.sprite) {
                    rp.sprite.x = rp.x;
                    rp.sprite.y = rp.y;
                    if (rp.targetAngle !== undefined) {
                        // Corrección de envolvente angular para evitar giros bruscos de 360 grados
                        let diffAngle = rp.targetAngle - rp.sprite.rotation;
                        diffAngle = Math.atan2(Math.sin(diffAngle), Math.cos(diffAngle));
                        rp.sprite.rotation += diffAngle * lerpFactor;
                    }
                }
            }
        });
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

        if (this.networkManager && this.networkManager.isConnected) {
            this._lastBulletId = `${this.networkManager.myId}_${Date.now()}`;
            this.networkManager.sendShoot(this.player.x, this.player.y, angulo, arma, this.skillManager?.clase || 'knight', this._lastBulletId);
        }

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
            const claseJugador = window.playerState.clase || 'knight';

            if (claseJugador === 'mage') {
                // MAGO: Dispara esfera mística que rebota 3 veces en las paredes
                const spriteBala = new PIXI.Graphics();
                spriteBala.beginFill(0xb794f4, 0.4);
                spriteBala.drawCircle(0, 0, 10);
                spriteBala.endFill();
                spriteBala.beginFill(0x805ad5, 0.9);
                spriteBala.drawCircle(0, 0, 6);
                spriteBala.endFill();
                spriteBala.beginFill(0xffffff, 0.9);
                spriteBala.drawCircle(-2, -2, 2);
                spriteBala.endFill();

                const b = {
                    x: this.player.x,
                    y: this.player.y,
                    vx: Math.cos(angulo) * (velocidadBala * 0.95),
                    vy: Math.sin(angulo) * (velocidadBala * 0.95),
                    sprite: spriteBala,
                    danio: Math.round(28 * factorDanio),
                    rebotadora: true,
                    rebotesRestantes: 3,
                    bulletId: this._lastBulletId || null // ID para sincronizar rebotes en red
                };
                b.sprite.x = b.x;
                b.sprite.y = b.y;
                this.capaEntidades.addChild(b.sprite);
                this.projectiles.push(b);
                console.log("¡Orbe Mágico Rebotador!");
            }
            else if (claseJugador === 'archer') {
                // ARQUERO: Dispara flechas veloces de cazador
                const spriteBala = new PIXI.Graphics();
                spriteBala.lineStyle(2, 0x48bb78);
                spriteBala.beginFill(0xffffff);
                spriteBala.drawPolygon([-10, -2, 10, 0, -10, 2]);
                spriteBala.endFill();
                spriteBala.rotation = angulo;

                const b = {
                    x: this.player.x,
                    y: this.player.y,
                    vx: Math.cos(angulo) * (velocidadBala * 1.25),
                    vy: Math.sin(angulo) * (velocidadBala * 1.25),
                    sprite: spriteBala,
                    danio: Math.round(30 * factorDanio)
                };
                b.sprite.x = b.x;
                b.sprite.y = b.y;
                this.capaEntidades.addChild(b.sprite);
                this.projectiles.push(b);
                console.log("¡Flecha Certera!");
            }
            else if (claseJugador === 'shaman') {
                // CHAMÁN: Dispara esfera de energía espiritual de la naturaleza
                const spriteBala = new PIXI.Graphics();
                spriteBala.beginFill(0xed8936, 0.3);
                spriteBala.drawCircle(0, 0, 9);
                spriteBala.endFill();
                spriteBala.beginFill(0xdd6b20, 0.9);
                spriteBala.drawCircle(0, 0, 5);
                spriteBala.endFill();

                const b = {
                    x: this.player.x,
                    y: this.player.y,
                    vx: Math.cos(angulo) * (velocidadBala * 0.9),
                    vy: Math.sin(angulo) * (velocidadBala * 0.9),
                    sprite: spriteBala,
                    danio: Math.round(26 * factorDanio)
                };
                b.sprite.x = b.x;
                b.sprite.y = b.y;
                this.capaEntidades.addChild(b.sprite);
                this.projectiles.push(b);
                console.log("¡Esfera Espiritual!");
            }
            else if (claseJugador === 'summoner') {
                // INVOCADOR: Dispara proyectil de energía de alma cyan
                const spriteBala = new PIXI.Graphics();
                spriteBala.beginFill(0x0bc5ea, 0.4);
                spriteBala.drawCircle(0, 0, 8);
                spriteBala.endFill();
                spriteBala.beginFill(0x00a3c4, 0.9);
                spriteBala.drawCircle(0, 0, 5);
                spriteBala.endFill();

                const b = {
                    x: this.player.x,
                    y: this.player.y,
                    vx: Math.cos(angulo) * (velocidadBala * 1.0),
                    vy: Math.sin(angulo) * (velocidadBala * 1.0),
                    sprite: spriteBala,
                    danio: Math.round(24 * factorDanio)
                };
                b.sprite.x = b.x;
                b.sprite.y = b.y;
                this.capaEntidades.addChild(b.sprite);
                this.projectiles.push(b);
                console.log("¡Orbe de Alma!");
            }
            else {
                // GUERRERO / CABALLERO: Ataque melee de tajo con espada
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
        if (this.isPaused) return;
        
        if (this.gameOver) {
            // Continuar renderizando la cámara y UI pero no actualizar lógicas de físicas/inputs
            this.actualizarCamara();
            this.renderizador.actualizarVista(this.camara.x, this.camara.y);
            return;
        }

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
        this.actualizarPuzzles(dt);
        this.enemyManager.update(dt, this.player, this);
        this.actualizarProyectiles(dt);
        this.actualizarJugadoresRemotos(dt);
        this.skillManager.update(dt);
        
        // Enviar nuestra posición al servidor C# cada frame
        if (this.networkManager && this.networkManager.isConnected && this.player) {
            const ang = Math.atan2(this.mouseY - (window.innerHeight / 2), this.mouseX - (window.innerWidth / 2));
            this.networkManager.sendMove(
                this.player.x,
                this.player.y,
                ang,
                window.playerState.clase || 'knight',
                this.player.vidaActual
            );
        }
        
        // --- Actualizar Línea de Visión (Field of View Circular) ---
        const radioPixeles = 16 * this.tileSize;
        this.mascaraVision.clear();
        this.mascaraVision.beginFill(0xffffff);
        this.mascaraVision.drawCircle(this.player.x, this.player.y, radioPixeles);
        this.mascaraVision.endFill();
        // ------------------------------------------------

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

        // -------------------------------------------------------------
        // GESTIÓN DE EFECTOS DE BALDOSAS ESPECIALES
        // -------------------------------------------------------------
        const col = Math.floor(this.player.x / this.tileSize);
        const fila = Math.floor(this.player.y / this.tileSize);
        let tileId = 0;
        if (fila >= 0 && fila < this.mapaMatriz.length && col >= 0 && col < this.mapaMatriz[0].length) {
            tileId = this.mapaMatriz[fila][col];
        }

        // --- Bloque Meta (2) ---
        if (tileId === 2 && !this.gameOver && !this.player.isDead) {
            this.gameOver = true;
            console.log("🏆 ¡Meta alcanzada! Nivel completado.");
            if (typeof this.eventBus === 'function') {
                this.eventBus('LEVEL_VICTORY');
            } else if (this.eventBus && typeof this.eventBus.emit === 'function') {
                this.eventBus.emit('LEVEL_VICTORY');
            }
        }

        // --- Inmunidad temporal a congelación ---
        if (this.player.freezeImmunityTimer > 0) {
            this.player.freezeImmunityTimer -= dt;
        }

        // --- Congelación (Hielo 4, Agua Congelada 7) ---
        if (!this.player.isFrozen && (tileId === 4 || tileId === 7)) {
            if (!(this.player.freezeImmunityTimer > 0) && !this.player.isDead) {
                this.player.isFrozen = true;
                this.mostrarMiniJuegoCongelado();
            }
        }

        // --- Actualización visual de congelamiento (Tinte azul) ---
        if (this.player.isFrozen) {
            if (this.player.sprite && !this.player.wasFrozenVisual) {
                this.player.wasFrozenVisual = true;
                this.player.sprite.children.forEach(child => {
                    if (child !== this.player.poisonEffectGfx && child !== this.player.fireEffectGfx && child !== this.player.acidEffectGfx) {
                        child._originalTint = child.tint;
                        child.tint = 0x5dade2; // Tinte azul
                    }
                });
            }

            // Mover el deslizador del minijuego
            this.freezeSliderVal = (this.freezeSliderVal || 0) + (this.freezeSliderDir || 1) * 220 * dt;
            if (this.freezeSliderVal >= 100) {
                this.freezeSliderVal = 100;
                this.freezeSliderDir = -1;
            } else if (this.freezeSliderVal <= 0) {
                this.freezeSliderVal = 0;
                this.freezeSliderDir = 1;
            }

            const sliderEl = document.getElementById('freezeSliderHead');
            if (sliderEl) {
                sliderEl.style.left = `${this.freezeSliderVal}%`;
            }
        } else {
            if (this.player.wasFrozenVisual) {
                this.player.wasFrozenVisual = false;
                this.player.sprite.children.forEach(child => {
                    if (child._originalTint !== undefined) {
                        child.tint = child._originalTint;
                    } else {
                        child.tint = 0xffffff;
                    }
                });
            }
        }

        // --- Veneno (15) DoT y Efecto Visual ---
        if (tileId === 15 && !this.player.isDead) {
            this.player.poisonDuration = 3.0; // Restablecer/aplicar duración de 3 segundos
        }

        if (this.player.poisonDuration > 0) {
            this.player.poisonDuration -= dt;
            this.player.poisonTickTimer = (this.player.poisonTickTimer || 0) + dt;
            if (this.player.poisonTickTimer >= 1.0) {
                this.player.poisonTickTimer -= 1.0;
                const dmg = Math.max(1, Math.round(this.player.vidaMaxima * 0.01)); // 3% total -> 1% por tick
                this.player.vidaActual = Math.max(0, this.player.vidaActual - dmg);
                this.uiManager.mostrarMensajeFlotante(`-${dmg} HP 🧪`, this.player.x, this.player.y - 30);
                if (this.player.vidaActual <= 0) {
                    this.player.isDead = true;
                }
            }

            // Animar el aura verde de veneno
            if (this.player.sprite) {
                if (!this.player.poisonEffectGfx) {
                    const gfx = new PIXI.Graphics();
                    this.player.poisonEffectGfx = gfx;
                    this.player.sprite.addChildAt(gfx, 0); // Detrás
                }
                const time = performance.now() / 1000;
                const pulse = 1 + Math.sin(time * 10) * 0.15;
                this.player.poisonEffectGfx.clear();
                this.player.poisonEffectGfx.lineStyle(2, 0x00ff00, 0.8);
                this.player.poisonEffectGfx.drawCircle(0, 0, 22 * pulse);
                this.player.poisonEffectGfx.beginFill(0x00ff00, 0.25);
                this.player.poisonEffectGfx.drawCircle(0, 0, 18 * pulse);
                this.player.poisonEffectGfx.endFill();
            }
        } else {
            this.player.poisonDuration = 0;
            this.player.poisonTickTimer = 0;
            if (this.player.poisonEffectGfx) {
                this.player.poisonEffectGfx.destroy();
                this.player.poisonEffectGfx = null;
            }
        }

        // --- Piedra Volcánica (8) DoT y Fuego ---
        if (tileId === 8 && !this.player.isDead) {
            this.player.volcanicTickTimer = (this.player.volcanicTickTimer || 0) + dt;
            if (this.player.volcanicTickTimer >= 0.5) {
                this.player.volcanicTickTimer -= 0.5;
                const dmg = Math.max(1, Math.round(this.player.vidaMaxima * 0.05)); // 5% cada medio segundo
                this.player.vidaActual = Math.max(0, this.player.vidaActual - dmg);
                this.uiManager.mostrarMensajeFlotante(`-${dmg} HP 🔥`, this.player.x, this.player.y - 30);
                if (this.player.vidaActual <= 0) {
                    this.player.isDead = true;
                }
            }

            // Animar llamas
            if (this.player.sprite) {
                if (!this.player.fireEffectGfx) {
                    const gfx = new PIXI.Graphics();
                    this.player.fireEffectGfx = gfx;
                    this.player.sprite.addChildAt(gfx, 0);
                }
                const time = performance.now() / 1000;
                this.player.fireEffectGfx.clear();
                this.player.fireEffectGfx.beginFill(0xff4500, 0.4);
                this.player.fireEffectGfx.drawCircle(0, 0, 24 + Math.sin(time * 25) * 3);
                this.player.fireEffectGfx.endFill();
                this.player.fireEffectGfx.beginFill(0xff8c00, 0.6);
                this.player.fireEffectGfx.drawCircle(0, 0, 18 + Math.cos(time * 20) * 2);
                this.player.fireEffectGfx.endFill();
                this.player.fireEffectGfx.beginFill(0xffd700, 0.8);
                this.player.fireEffectGfx.drawCircle(0, 0, 12 + Math.sin(time * 15) * 1.5);
                this.player.fireEffectGfx.endFill();
            }
        } else {
            this.player.volcanicTickTimer = 0;
            if (this.player.fireEffectGfx) {
                this.player.fireEffectGfx.destroy();
                this.player.fireEffectGfx = null;
            }
        }

        // --- Ácido (18) DoT y Color Verde Difuminado ---
        if (tileId === 18 && !this.player.isDead) {
            this.player.acidTickTimer = (this.player.acidTickTimer || 0) + dt;
            if (this.player.acidTickTimer >= 0.5) {
                this.player.acidTickTimer -= 0.5;
                const dmg = Math.max(1, Math.round(this.player.vidaMaxima * 0.02)); // 2% cada medio segundo
                this.player.vidaActual = Math.max(0, this.player.vidaActual - dmg);
                this.uiManager.mostrarMensajeFlotante(`-${dmg} HP 🧪`, this.player.x, this.player.y - 30);
                if (this.player.vidaActual <= 0) {
                    this.player.isDead = true;
                }
            }

            // Animar aura difuminada verde
            if (this.player.sprite) {
                if (!this.player.acidEffectGfx) {
                    const gfx = new PIXI.Graphics();
                    this.player.acidEffectGfx = gfx;
                    this.player.sprite.addChildAt(gfx, 0);
                }
                const time = performance.now() / 1000;
                this.player.acidEffectGfx.clear();
                const baseRadius = 20 + Math.sin(time * 8) * 2;
                for (let r = 4; r > 0; r--) {
                    this.player.acidEffectGfx.beginFill(0x39ff14, 0.12 - (r * 0.02));
                    this.player.acidEffectGfx.drawCircle(0, 0, baseRadius + r * 5);
                    this.player.acidEffectGfx.endFill();
                }
            }
        } else {
            this.player.acidTickTimer = 0;
            if (this.player.acidEffectGfx) {
                this.player.acidEffectGfx.destroy();
                this.player.acidEffectGfx = null;
            }
        }

        this.verificarPortales();
        this.verificarCofres();
        this.verificarVictoria();
        this.verificarDerrota();
        this.actualizarRevivir(dt);
        this.actualizarCamara();

        this.renderizador.actualizarVista(this.camara.x, this.camara.y);
        this.uiManager.actualizar(this.player);
    }

    // ========================================================
    // SISTEMA DE REVIVIR CON H
    // ========================================================

    actualizarRevivir(dt) {
        if (!this.remotePlayers || this.player.isDead) return;

        const RADIO_REVIVIR = this.tileSize * 2; // 2 tiles de radio

        // Marcar en ROJO los jugadores remotos muertos
        this.remotePlayers.forEach(rp => {
            if (rp.isDead && rp.sprite) {
                // Tinte rojo para indicar que está muerto
                rp.sprite.children.forEach(child => {
                    if (!rp._redTintApplied) child.tint = 0xff2222;
                });
                rp._redTintApplied = true;
            } else if (!rp.isDead && rp._redTintApplied && rp.sprite) {
                // Restaurar color original al revivir
                rp.sprite.children.forEach(child => {
                    child.tint = 0xffffff;
                });
                rp._redTintApplied = false;
            }
        });

        if (!this.hKeyPressed) {
            if (this.reviveProgress > 0) {
                this.reviveProgress = 0;
                this.reviveTarget = null;
                this.ocultarBarraRevive();
            }
            return;
        }

        // Buscar jugador remoto muerto más cercano dentro del radio
        let nearestDead = null;
        let nearestDist = Infinity;

        this.remotePlayers.forEach(rp => {
            if (rp.isDead) {
                const dx = rp.x - this.player.x;
                const dy = rp.y - this.player.y;
                const dist = Math.hypot(dx, dy);
                if (dist < RADIO_REVIVIR && dist < nearestDist) {
                    nearestDist = dist;
                    nearestDead = rp;
                }
            }
        });

        if (!nearestDead) {
            // No hay nadie muerto cerca — resetear progreso
            if (this.reviveProgress > 0) {
                this.reviveProgress = 0;
                this.reviveTarget = null;
                this.ocultarBarraRevive();
            }
            return;
        }

        // Si cambió el objetivo, reiniciar progreso
        if (this.reviveTarget && this.reviveTarget !== nearestDead) {
            this.reviveProgress = 0;
        }
        this.reviveTarget = nearestDead;
        this.reviveProgress += dt;

        // Mostrar barra de progreso
        const pct = Math.min(1, this.reviveProgress / this.reviveTime);
        this.mostrarBarraRevive(pct, nearestDead);

        if (this.reviveProgress >= this.reviveTime) {
            // ¡REVIVIR!
            nearestDead.isDead = false;
            nearestDead.vidaActual = 50; // Revive con 50% de vida
            this.reviveProgress = 0;
            this.reviveTarget = null;
            this.ocultarBarraRevive();
            this.uiManager.mostrarMensajeFlotante("❤️ ¡REVIVIDO!", nearestDead.x, nearestDead.y - 40);
            console.log(`❤️ Reviviste al jugador ${nearestDead.id}`);
        }
    }

    mostrarBarraRevive(pct, rp) {
        let barEl = document.getElementById('reviveProgressBar');
        if (!barEl) {
            const cont = document.createElement('div');
            cont.id = 'reviveProgressBar';
            cont.style = `
                position: fixed;
                bottom: 110px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(20, 18, 31, 0.88);
                border: 2px solid #e53e3e;
                border-radius: 12px;
                padding: 10px 20px;
                color: white;
                font-family: 'Outfit', sans-serif;
                text-align: center;
                box-shadow: 0 0 20px rgba(229, 62, 62, 0.5);
                z-index: 1000;
                pointer-events: none;
                min-width: 220px;
            `;
            cont.innerHTML = `
                <div style="font-size:0.95rem; margin-bottom:6px; color:#fc8181;">❤️ Reviviendo compañero... <strong>[H]</strong></div>
                <div style="background:#3b1a1a; border-radius:8px; overflow:hidden; height:14px; width:100%;">
                    <div id="reviveProgressFill" style="height:100%; background:#e53e3e; width:0%; transition:width 0.1s; border-radius:8px;"></div>
                </div>
            `;
            document.body.appendChild(cont);
            barEl = cont;
        }
        barEl.style.display = 'block';
        const fill = document.getElementById('reviveProgressFill');
        if (fill) fill.style.width = `${Math.round(pct * 100)}%`;
    }

    ocultarBarraRevive() {
        const barEl = document.getElementById('reviveProgressBar');
        if (barEl) barEl.style.display = 'none';
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
                    // Sincronizar rebote con todos los jugadores en la sala
                    if (bala.bulletId && this.networkManager && this.networkManager.isConnected) {
                        this.networkManager.sendShootUpdate(bala.bulletId, nextX, nextY, bala.vx, bala.vy);
                    }
                } else if (this.collisionManager.esPared(nextX, nextY)) {
                    bala.vx = -bala.vx;
                    bala.vy = -bala.vy;
                    nextX = prevX + bala.vx * dt;
                    nextY = prevY + bala.vy * dt;
                    bala.rebotesRestantes--;
                    bounced = true;
                    // Sincronizar rebote diagonal con todos los jugadores en la sala
                    if (bala.bulletId && this.networkManager && this.networkManager.isConnected) {
                        this.networkManager.sendShootUpdate(bala.bulletId, nextX, nextY, bala.vx, bala.vy);
                    }
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
        if (this.player && this.player.isDead) return;
        if (this.gameOver) return;

        // 1. Si la sala actual todavía tiene enemigos vivos, NO hay victoria
        const enemigosVivosEnSala = (this.enemyManager?.enemies || []).filter(e => !e.isDead).length;
        if (enemigosVivosEnSala > 0) return;

        // 2. Si es un paquete de mapas con sub-mapas, verificar que NO queden enemigos vivos en NINGÚN sub-mapa
        if (this.pack) {
            for (const [nombreSala, configSubMapa] of Object.entries(this.pack)) {
                if (this.savedRoomStates && this.savedRoomStates.has(nombreSala)) {
                    const estadoGuardado = this.savedRoomStates.get(nombreSala);
                    const vivosEnEstado = (estadoGuardado.enemigos || []).filter(e => !e.isDead && (e.vida === undefined || e.vida > 0)).length;
                    if (vivosEnEstado > 0) return; // Quedan enemigos en esta sala
                } else if (nombreSala !== this.subMapaActual) {
                    // Si la sala nunca fue visitada y su config original tiene enemigos, aún no hay victoria
                    const enemigosIniciales = configSubMapa.enemigos || [];
                    if (enemigosIniciales.length > 0) return;
                }
            }
        }

        // 3. ¡Todos los enemigos de todas las salas han sido totalmente eliminados!
        this.gameOver = true;
        console.log("🏆 ¡Todos los enemigos de todas las salas eliminados! Nivel completado.");

        if (typeof this.eventBus === 'function') {
            this.eventBus('LEVEL_VICTORY');
        } else if (this.eventBus && typeof this.eventBus.emit === 'function') {
            this.eventBus.emit('LEVEL_VICTORY');
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

        // BUGFIX: Cooldown de 1.5s para evitar bucles infinitos de teletransporte (ping-pong)
        if (this.portalCooldownTimer && Date.now() - this.portalCooldownTimer < 1500) return;

        // Obtener la posición de la celda del héroe
        const col = Math.floor(this.player.x / this.tileSize);
        const fila = Math.floor(this.player.y / this.tileSize);

        // Buscar si hay un portal en la coordenada actual
        const portal = this.portales.find(p => p.gridX === col && p.gridY === fila);
        if (portal) {
            // BUGFIX 4: Portales siempre transportan independientemente de los enemigos vivos
            if (portal.destinoMapa && portal.destinoPortal && this.pack) {
                const subMapaDestino = this.pack[portal.destinoMapa];
                if (subMapaDestino) {
                    const portalDestino = (subMapaDestino.portales || []).find(p => p.etiqueta === portal.destinoPortal);
                    if (portalDestino) {
                        this.portalCooldownTimer = Date.now();
                        this.uiManager?.agregarMensajeConsola(`🚪 Cruzaste el portal hacia '${portal.destinoMapa}'`, '#9b59b6');
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

    guardarEstadoSalaActual() {
        if (!this.subMapaActual) return;
        if (!this.savedRoomStates) this.savedRoomStates = new Map();

        const enemigosVivos = [];
        if (this.enemyManager && this.enemyManager.enemies) {
            this.enemyManager.enemies.forEach(en => {
                if (!en.isDead) {
                    enemigosVivos.push({
                        id: en.id,
                        type: en.tipo || en.type,
                        tipo: en.tipo || en.type,
                        x: en.x,
                        y: en.y,
                        gridX: Math.floor(en.x / this.tileSize),
                        gridY: Math.floor(en.y / this.tileSize),
                        vida: en.vidaActual,
                        vidaMaxima: en.vidaMaxima,
                        velocidad: en.velocidad,
                        defensa: en.defensaBase,
                        danioBase: en.danioBase,
                        tipoDanio: en.tipoDanio,
                        hasAggro: en.hasAggro
                    });
                }
            });
        }

        this.savedRoomStates.set(this.subMapaActual, {
            matriz: this.mapaMatriz.map(f => f.slice()),
            enemigos: enemigosVivos,
            cofres: JSON.parse(JSON.stringify(this.cofres || [])),
            cajas: JSON.parse(JSON.stringify(this.cajas || [])),
            mecanismos: JSON.parse(JSON.stringify(this.mecanismos || [])),
            holdouts: JSON.parse(JSON.stringify(this.holdouts || [])),
            espejos: JSON.parse(JSON.stringify(this.espejos || [])),
            lasers: JSON.parse(JSON.stringify(this.lasers || []))
        });
    }

    cargarSubMapa(nombreMapa, destGridX, destGridY) {
        console.log(`Teletransportando a: Mapa [${nombreMapa}], Posición [${destGridX}, ${destGridY}]`);
        const subMapaConfig = this.pack[nombreMapa];
        if (!subMapaConfig) return;

        // 1. Guardar estado exacto de la sala actual de la que salimos
        this.guardarEstadoSalaActual();

        this.subMapaActual = nombreMapa;
        const estadoGuardado = this.savedRoomStates?.get(nombreMapa);

        // Si la sala ya fue visitada previamente, restaurar su estado (mantiene enemigos muertos, HP de heridos y mapa modificado)
        if (estadoGuardado) {
            this.mapaMatriz = estadoGuardado.matriz.map(f => f.slice());
            this.cofres = estadoGuardado.cofres;
            this.cajas = estadoGuardado.cajas;
            this.mecanismos = estadoGuardado.mecanismos;
            this.holdouts = estadoGuardado.holdouts;
            this.espejos = estadoGuardado.espejos;
            this.lasers = estadoGuardado.lasers;
            this.portales = subMapaConfig.portales || [];
        } else {
            this.mapaMatriz = subMapaConfig.matriz.map((fila) => fila.slice());
            this.portales = subMapaConfig.portales || [];
            this.cofres = subMapaConfig.cofres || [];
            this.cajas = JSON.parse(JSON.stringify(subMapaConfig.cajas || []));
            this.mecanismos = JSON.parse(JSON.stringify(subMapaConfig.mecanismos || []));
            this.holdouts = JSON.parse(JSON.stringify(subMapaConfig.holdouts || []));
            this.lasers = JSON.parse(JSON.stringify(subMapaConfig.lasers || []));
            this.espejos = JSON.parse(JSON.stringify(subMapaConfig.espejos || []));
            this.receptores = JSON.parse(JSON.stringify(subMapaConfig.receptores || []));
            this.secuencias = JSON.parse(JSON.stringify(subMapaConfig.secuencias || []));
        }

        // Inicializar vistas de puzzles
        this.inicializarPuzzles();

        // 2. Limpiar proyectiles y sprites de enemigos actuales (sin llamar a morir)
        if (this.enemyManager) {
            this.enemyManager.destroy();
        }

        for (const proj of this.projectiles) {
            if (proj.sprite) {
                proj.sprite.destroy();
            }
        }
        this.projectiles = [];

        // Limpiar avatares y proyectiles remotos de la sala anterior
        if (this.remotePlayers) {
            this.remotePlayers.forEach(rp => {
                if (rp && rp.sprite) rp.sprite.destroy({ children: true });
            });
            this.remotePlayers.clear();
        }
        if (this.remoteProjectiles) {
            this.remoteProjectiles.clear();
        }

        // 3. Actualizar colisiones y renderizador de baldosas
        this.collisionManager.mapaMatriz = this.mapaMatriz;
        this.renderizador.matriz = this.mapaMatriz;
        this.renderizador.inicializarPool(window.innerWidth, window.innerHeight);

        // 4. Mover a Kitty a la celda libre adyacente del portal destino
        let spawnX = destGridX;
        let spawnY = destGridY;
        const offsets = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
        for (const off of offsets) {
            const tx = destGridX + off.x;
            const ty = destGridY + off.y;
            if (this.mapaMatriz[ty] && this.mapaMatriz[ty][tx] === 0) {
                spawnX = tx;
                spawnY = ty;
                break;
            }
        }

        this.player.x = spawnX * this.tileSize + (this.tileSize / 2);
        this.player.y = spawnY * this.tileSize + (this.tileSize / 2);
        this.player.actualizarPosicionVisual();

        this.camara.x = this.player.x;
        this.camara.y = this.player.y;

        // 5. Cargar enemigos: Si la sala ya fue visitada, restaurar ÚNICAMENTE los enemigos vivos guardados con su HP exacto
        const listaEnemigosACargar = estadoGuardado ? estadoGuardado.enemigos : subMapaConfig.enemigos;
        this.enemyManager = new EnemyManager(this.capaEntidades, this.tileSize, listaEnemigosACargar);
        this.enemyManager.engine = this;

        if (estadoGuardado) {
            listaEnemigosACargar.forEach(data => {
                const en = this.enemyManager.fabricaDeEnemigos(data);
                en.x = data.x;
                en.y = data.y;
                en.vidaActual = data.vida;
                en.hasAggro = data.hasAggro || false;
                if (typeof en.actualizarPosicionVisual === 'function') {
                    en.actualizarPosicionVisual();
                } else if (en.sprite) {
                    en.sprite.x = en.x;
                    en.sprite.y = en.y;
                }
                this.enemyManager.enemies.push(en);
            });
        } else {
            this.enemyManager.inicializar();
        }

        // 6. Notificar cambio de sala al servidor C# autoritario (con su configuración de enemigos y posición)
        if (this.networkManager && this.networkManager.isConnected) {
            this.networkManager.sendChangeRoom(nombreMapa, subMapaConfig.enemigos, this.player.x, this.player.y);
        }

        this.actualizarHUDHtml();
    }

    mostrarMiniJuegoCongelado() {
        let container = document.getElementById('freezeMiniGame');
        if (!container) {
            container = document.createElement('div');
            container.id = 'freezeMiniGame';
            container.style = `
                position: absolute;
                bottom: 120px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(10, 25, 47, 0.85);
                backdrop-filter: blur(5px);
                border: 2px solid #5dade2;
                border-radius: 12px;
                padding: 15px 25px;
                color: white;
                font-family: 'Outfit', sans-serif;
                text-align: center;
                box-shadow: 0 0 20px rgba(93, 173, 226, 0.4);
                z-index: 999;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            `;
            container.innerHTML = `
                <div style="font-weight: bold; color: #a4ebf3; font-size: 1.1rem; text-shadow: 0 0 5px rgba(164,235,243,0.5);">
                    ❄️ ¡CONGELADO! ❄️
                </div>
                <div style="font-size: 0.85rem; color: #cbd5e0; margin-bottom: 5px;">
                    Presiona <span style="background: #5dade2; color: #0a192f; padding: 2px 6px; border-radius: 4px; font-weight: bold;">R</span> cuando el deslizante esté en la zona segura
                </div>
                <!-- The Bar -->
                <div id="freezeBar" style="position: relative; width: 250px; height: 20px; background: #1a365d; border-radius: 10px; overflow: visible; border: 1px solid #5dade2;">
                    <!-- Safe zone (40% to 60%) -->
                    <div style="position: absolute; left: 40%; width: 20%; height: 100%; background: #2ecc71; opacity: 0.7; box-shadow: 0 0 10px #2ecc71; border-radius: 2px;"></div>
                    <!-- Slider head -->
                    <div id="freezeSliderHead" style="position: absolute; top: -4px; left: 0%; width: 12px; height: 28px; background: #ff4757; border-radius: 3px; box-shadow: 0 0 8px #ff4757; transform: translateX(-50%); transition: left 0.02s linear;"></div>
                </div>
            `;
            this.canvas.parentNode.appendChild(container);
        }
        container.style.display = 'flex';
        this.freezeSliderVal = 0;
        this.freezeSliderDir = 1;
    }

    descongelarJugador() {
        this.player.isFrozen = false;
        this.player.freezeImmunityTimer = 1.5; // Inmunidad de 1.5 segundos
        const container = document.getElementById('freezeMiniGame');
        if (container) {
            container.style.display = 'none';
        }
        this.uiManager.mostrarMensajeFlotante("¡LIBRE! 🔥", this.player.x, this.player.y - 30);
    }

    destellarFalloDescongelar() {
        const bar = document.getElementById('freezeBar');
        if (bar) {
            bar.style.borderColor = '#ff4757';
            bar.style.boxShadow = '0 0 15px #ff4757';
            setTimeout(() => {
                bar.style.borderColor = '#5dade2';
                bar.style.boxShadow = 'none';
            }, 150);
        }
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
                this.uiManager.agregarMensajeConsola(`🎁 Cofre Abierto: ${mensajes.join(' ')}`, '#f1c40f');
                this.actualizarHUDHtml();
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

    inicializarPuzzles() {
        if (!this.capaPuzzles) return;
        this.capaPuzzles.removeChildren();

        // 1. Cajas: Crear un sprite o gráficos para cada una
        this.cajasSprites = [];
        for (const box of this.cajas || []) {
            const container = new PIXI.Container();
            container.x = box.gridX * this.tileSize;
            container.y = box.gridY * this.tileSize;

            const rect = new PIXI.Graphics();
            rect.beginFill(0x8c7ae6);
            rect.lineStyle(2, 0xf5cd79);
            rect.drawRoundedRect(2, 2, this.tileSize - 4, this.tileSize - 4, 4);
            rect.endFill();

            const text = new PIXI.Text('📦', { fontSize: this.tileSize * 0.45, align: 'center' });
            text.anchor.set(0.5);
            text.x = this.tileSize / 2;
            text.y = this.tileSize / 2;

            container.addChild(rect, text);
            this.capaPuzzles.addChild(container);

            this.cajasSprites.push({ data: box, view: container });
        }

        // 2. Espejos: Crear gráficos
        this.espejosSprites = [];
        for (const esp of this.espejos || []) {
            const container = new PIXI.Container();
            container.x = esp.gridX * this.tileSize;
            container.y = esp.gridY * this.tileSize;

            const line = new PIXI.Graphics();
            line.lineStyle(4, 0xdcdde1);
            if (esp.angulo === 45) {
                line.moveTo(2, this.tileSize - 2);
                line.lineTo(this.tileSize - 2, 2);
            } else {
                line.moveTo(2, 2);
                line.lineTo(this.tileSize - 2, this.tileSize - 2);
            }
            const text = new PIXI.Text('🪞', { fontSize: this.tileSize * 0.35 });
            text.anchor.set(0.5);
            text.x = this.tileSize / 2;
            text.y = this.tileSize / 2;

            container.addChild(line, text);
            this.capaPuzzles.addChild(container);

            this.espejosSprites.push({ data: esp, view: container, lineGraphics: line });
        }

        // 3. Holdouts: Crear un contenedor y gráficos circulares translúcidos
        this.holdoutGraphicsList = [];
        for (const ho of this.holdouts || []) {
            const circle = new PIXI.Graphics();
            const cx = ho.gridX * this.tileSize + this.tileSize / 2;
            const cy = ho.gridY * this.tileSize + this.tileSize / 2;
            const radius = ho.radio * this.tileSize;

            circle.lineStyle(3, 0xc23616, 0.45);
            circle.beginFill(0xc23616, 0.08);
            circle.drawCircle(cx, cy, radius);
            circle.endFill();

            const text = new PIXI.Text('🛡️', { fontSize: this.tileSize * 0.5 });
            text.anchor.set(0.5);
            text.x = cx;
            text.y = cy;

            this.capaPuzzles.addChild(circle, text);

            this.holdoutGraphicsList.push({
                data: ho,
                circle: circle,
                text: text,
                activo: false,
                completado: false,
                tiempoRestante: ho.tiempo,
                avisoPuertasCerradas: false
            });
        }

        // 4. Simon Secuencia: Destellar baldosas y almacenar variables de comprobación
        this.secuenciaPuzzlesList = [];
        for (const seq of this.secuencias || []) {
            const pasosGraphics = [];
            seq.pasos.forEach((paso, idx) => {
                const rect = new PIXI.Graphics();
                rect.x = paso.x * this.tileSize;
                rect.y = paso.y * this.tileSize;
                rect.beginFill(0x00a8ff, 0.15);
                rect.lineStyle(1.5, 0x00a8ff, 0.4);
                rect.drawRect(1, 1, this.tileSize - 2, this.tileSize - 2);
                rect.endFill();

                const text = new PIXI.Text(`${idx + 1}`, { fontSize: this.tileSize * 0.35, fill: 0x00a8ff });
                text.anchor.set(0.5);
                text.x = this.tileSize / 2;
                text.y = this.tileSize / 2;
                rect.addChild(text);

                this.capaPuzzles.addChild(rect);
                pasosGraphics.push({ paso, graphics: rect, text });
            });

            this.secuenciaPuzzlesList.push({
                data: seq,
                pasosGraphics: pasosGraphics,
                inputIndex: 0,
                completado: false,
                flashing: false,
                flashTimer: 0,
                flashIndex: 0,
                flashCooldown: 1000
            });
        }

        // 5. Láseres: Preparar gráficos para renderizar los rayos láser
        this.laserGraphics = new PIXI.Graphics();
        this.capaPuzzles.addChild(this.laserGraphics);
    }

    iniciarSimonDice(seqInfo) {
        if (seqInfo.completado || seqInfo.flashing) return;
        seqInfo.flashing = true;
        seqInfo.flashIndex = 0;
        seqInfo.flashTimer = Date.now();
    }

    actualizarPuzzles(dt) {
        if (!this.player || this.player.isDead) return;

        const pGridX = Math.floor(this.player.x / this.tileSize);
        const pGridY = Math.floor(this.player.y / this.tileSize);

        // --- 1. Sincronizar visuales de Cajas ---
        if (this.cajasSprites) {
            for (const item of this.cajasSprites) {
                const targetX = item.data.gridX * this.tileSize;
                const targetY = item.data.gridY * this.tileSize;
                item.view.x += (targetX - item.view.x) * 0.2;
                item.view.y += (targetY - item.view.y) * 0.2;
            }
        }

        // --- 2. Mecanismos de Placas de Presión ---
        for (const mec of this.mecanismos || []) {
            const px = mec.plateX;
            const py = mec.plateY;
            
            const playerOnPlate = (pGridX === px && pGridY === py);
            const boxOnPlate = this.cajas.some(c => c.gridX === px && c.gridY === py);

            if (playerOnPlate || boxOnPlate) {
                if (this.mapaMatriz[mec.gateY]?.[mec.gateX] === 24) {
                    this.mapaMatriz[mec.gateY][mec.gateX] = 0;
                    this.renderizador.reconstruirTile(mec.gateX, mec.gateY, 0);
                    this.uiManager.mostrarMensajeFlotante("⚡ Reja Abierta", mec.gateX * this.tileSize + this.tileSize/2, mec.gateY * this.tileSize);
                }
            } else {
                const otraActiva = this.mecanismos.some(m => m.gateX === mec.gateX && m.gateY === mec.gateY && (pGridX === m.plateX && pGridY === m.plateY || this.cajas.some(c => c.gridX === m.plateX && c.gridY === m.plateY)));
                if (!otraActiva && this.mapaMatriz[mec.gateY]?.[mec.gateX] === 0) {
                    const playerOnGate = (pGridX === mec.gateX && pGridY === mec.gateY);
                    const boxOnGate = this.cajas.some(c => c.gridX === mec.gateX && c.gridY === mec.gateY);
                    if (!playerOnGate && !boxOnGate) {
                        this.mapaMatriz[mec.gateY][mec.gateX] = 24;
                        this.renderizador.reconstruirTile(mec.gateX, mec.gateY, 24);
                    }
                }
            }
        }

        // --- 3. Evento de Defensa de Zona (Holdout) ---
        for (const ho of this.holdoutGraphicsList || []) {
            if (ho.completado) continue;

            const cx = ho.data.gridX * this.tileSize + this.tileSize / 2;
            const cy = ho.data.gridY * this.tileSize + this.tileSize / 2;
            const radius = ho.data.radio * this.tileSize;

            const dx = this.player.x - cx;
            const dy = this.player.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const jugadorAdentro = (dist <= radius);

            if (jugadorAdentro && !ho.activo) {
                ho.activo = true;
                this.uiManager.mostrarMensajeFlotante("⚠️ ¡INVASIÓN DETECTADA! Defiende la zona", cx, cy - 20);
                
                for (let r = 0; r < this.mapaMatriz.length; r++) {
                    for (let c = 0; c < this.mapaMatriz[0].length; c++) {
                        if (this.mapaMatriz[r][c] === 0) {
                            const originalMap = this.pack[this.subMapaActual || 'principal'];
                            if (originalMap && originalMap.matriz[r][c] === 24) {
                                this.mapaMatriz[r][c] = 24;
                                this.renderizador.reconstruirTile(c, r, 24);
                            }
                        }
                    }
                }
                ho.avisoPuertasCerradas = true;
            }

            if (ho.activo) {
                if (!jugadorAdentro) {
                    // BUGFIX 8: Penalización por abandonar la zona de defensa activa
                    if (ho.data.penalidad === 'LOSE_LEVEL') {
                        ho.activo = false;
                        this.player.isDead = true;
                        this.uiManager.mostrarMensajeFlotante("💀 ¡SALISTE DE LA ZONA! Has muerto.", cx, cy - 20);
                        this.uiManager.agregarMensajeConsola("💀 ¡Penalización Activada! El jugador abandonó la zona de defensa y ha muerto.", "#ff4757");
                    } else {
                        // RESTART_MINIGAME
                        ho.tiempoRestante = ho.data.tiempo;
                        this.uiManager.mostrarMensajeFlotante("⚠️ ¡SALISTE DE LA ZONA! Reiniciado...", cx, cy - 20);
                        this.uiManager.agregarMensajeConsola("⚠️ ¡Saliste de la zona de defensa! Tiempo de supervivencia reiniciado.", "#e67e22");
                    }
                } else {
                    ho.tiempoRestante -= dt;
                    ho.text.text = `🛡️ ${Math.max(0, Math.ceil(ho.tiempoRestante))}s`;
                    
                    const pulseScale = 1.0 + Math.sin(Date.now() / 150) * 0.05;
                    ho.circle.scale.set(pulseScale);
                    ho.circle.pivot.set(cx, cy);
                    ho.circle.position.set(cx, cy);

                    if (!ho.lastSpawnTime) ho.lastSpawnTime = Date.now();
                    if (Date.now() - ho.lastSpawnTime > 2500) {
                        ho.lastSpawnTime = Date.now();
                        const angle = Math.random() * Math.PI * 2;
                        const spawnDist = radius * 0.8;
                        const enemyX = cx + Math.cos(angle) * spawnDist;
                        const enemyY = cy + Math.sin(angle) * spawnDist;
                        const eGridX = Math.floor(enemyX / this.tileSize);
                        const eGridY = Math.floor(enemyY / this.tileSize);
                        
                        if (this.mapaMatriz[eGridY]?.[eGridX] === 0) {
                            const esq = this.enemyManager.spawnEnemy({ type: 'BASE', gridX: eGridX, gridY: eGridY });
                            if (esq) {
                                esq.vidaMaxima = Math.round(esq.vidaMaxima * 1.3);
                                esq.vidaActual = esq.vidaMaxima;
                                esq.danioBase = Math.round(esq.danioBase * 1.25);
                            }
                        }
                    }

                    if (ho.tiempoRestante <= 0) {
                        ho.activo = false;
                        ho.completado = true;
                        ho.text.text = '✅';
                        ho.circle.tint = 0x44bd32;

                        // BUGFIX 5: Recompensas automáticas y notificaciones al completar la supervivencia
                        window.playerState.monedas = (window.playerState.monedas || 0) + 50;
                        window.playerState.gemas = (window.playerState.gemas || 0) + 10;
                        window.playerState.inventario.pocion_vida = (window.playerState.inventario.pocion_vida || 0) + 2;
                        window.playerState.inventario.escudo_hierro = (window.playerState.inventario.escudo_hierro || 0) + 1;

                        this.uiManager.mostrarMensajeFlotante("🎉 ¡ZONA DEFENDIDA! +50🪙 +10💎 +2🧪 +1🛡️", cx, cy - 20);
                        this.uiManager.agregarMensajeConsola("🎉 ¡SUPERVIVENCIA COMPLETADA! Recompensas recibidas: +50 🪙, +10 💎, +2 🧪, +1 🛡️", "#2ecc71");
                        this.actualizarHUDHtml();

                        for (let r = 0; r < this.mapaMatriz.length; r++) {
                            for (let c = 0; c < this.mapaMatriz[0].length; c++) {
                                if (this.mapaMatriz[r][c] === 24) {
                                    this.mapaMatriz[r][c] = 0;
                                    this.renderizador.reconstruirTile(c, r, 0);
                                }
                            }
                        }

                        const hGridX = ho.data.gridX;
                        const hGridY = ho.data.gridY;
                        this.mapaMatriz[hGridY][hGridX] = 20;
                        this.renderizador.reconstruirTile(hGridX, hGridY, 20);
                        this.cofres.push({
                            gridX: hGridX,
                            gridY: hGridY,
                            items: { monedas: 50, gemas: 10, pocion_vida: 2, escudo_hierro: 1 }
                        });
                    }
                }
            }
        }

        // --- 4. Secuencia Rítmica (Simon Dice) ---
        for (const seqInfo of this.secuenciaPuzzlesList || []) {
            if (seqInfo.completado) continue;

            const cercaDeSecuencia = seqInfo.data.pasos.some(p => {
                const dx = this.player.x - (p.x * this.tileSize + this.tileSize/2);
                const dy = this.player.y - (p.y * this.tileSize + this.tileSize/2);
                return Math.sqrt(dx*dx + dy*dy) < 200;
            });

            if (cercaDeSecuencia && !seqInfo.flashing && seqInfo.inputIndex === 0) {
                this.iniciarSimonDice(seqInfo);
            }

            if (seqInfo.flashing) {
                if (Date.now() - seqInfo.flashTimer > seqInfo.flashCooldown) {
                    seqInfo.flashTimer = Date.now();
                    const idx = seqInfo.flashIndex;
                    if (idx < seqInfo.pasosGraphics.length) {
                        const step = seqInfo.pasosGraphics[idx];
                        step.graphics.alpha = 1.0;
                        step.graphics.tint = 0x00ff00;
                        setTimeout(() => {
                            step.graphics.alpha = 0.5;
                            step.graphics.tint = 0xffffff;
                        }, 500);

                        seqInfo.flashIndex++;
                    } else {
                        seqInfo.flashing = false;
                    }
                }
            }

            const currentStep = seqInfo.data.pasos[seqInfo.inputIndex];
            if (currentStep && pGridX === currentStep.x && pGridY === currentStep.y) {
                const gStep = seqInfo.pasosGraphics[seqInfo.inputIndex];
                gStep.graphics.tint = 0x00ff00;
                gStep.graphics.alpha = 1.0;
                
                this.uiManager.mostrarMensajeFlotante(`🔔 ¡Paso ${seqInfo.inputIndex + 1} correcto!`, this.player.x, this.player.y - 30);
                seqInfo.inputIndex++;

                if (seqInfo.inputIndex >= seqInfo.data.pasos.length) {
                    seqInfo.completado = true;
                    this.uiManager.mostrarMensajeFlotante("🎉 ¡SIMON DICE COMPLETADO!", this.player.x, this.player.y - 30);

                    const rx = seqInfo.data.rewardX;
                    const ry = seqInfo.data.rewardY;
                    if (rx !== 0 || ry !== 0) {
                        this.mapaMatriz[ry][rx] = 20;
                        this.renderizador.reconstruirTile(rx, ry, 20);
                        this.cofres.push({
                            gridX: rx,
                            gridY: ry,
                            items: { monedas: 40, gemas: 5, pocion_vida: 1, escudo_hierro: 1 }
                        });
                        this.uiManager.mostrarMensajeFlotante("🎁 Cofre de Recompensa Aparece", rx * this.tileSize + this.tileSize/2, ry * this.tileSize);
                    }
                }
            } else {
                const pisaOtroPaso = seqInfo.data.pasos.some((p, i) => i !== seqInfo.inputIndex && pGridX === p.x && pGridY === p.y);
                if (pisaOtroPaso) {
                    // BUGFIX: Cooldown para no spamear el mensaje de error del Simon Dice
                    const ahora = Date.now();
                    if (!seqInfo.ultimoErrorTime || ahora - seqInfo.ultimoErrorTime > 2000) {
                        seqInfo.ultimoErrorTime = ahora;
                        this.uiManager.mostrarMensajeFlotante("⚡ ¡Secuencia Incorrecta! Reiniciando...", this.player.x, this.player.y - 30);
                    }
                    
                    this.player.isPoisoned = true;
                    this.player.poisonTimer = 3.0;

                    seqInfo.inputIndex = 0;
                    seqInfo.pasosGraphics.forEach(pg => {
                        pg.graphics.tint = 0xffffff;
                        pg.graphics.alpha = 0.55;
                    });
                    this.iniciarSimonDice(seqInfo);
                }
            }
        }

        // --- 5. Raycasting de Láseres ---
        if (this.laserGraphics) {
            this.laserGraphics.clear();
            const receptoresActivados = new Set();

            for (const laser of this.lasers || []) {
                let curGridX = laser.gridX;
                let curGridY = laser.gridY;
                let curDir = laser.dir;

                let startX = curGridX * this.tileSize + this.tileSize / 2;
                let startY = curGridY * this.tileSize + this.tileSize / 2;

                this.laserGraphics.lineStyle(4, 0xff3f34, 0.85);
                this.laserGraphics.moveTo(startX, startY);

                let maxSteps = 40;
                let colisionado = false;

                while (maxSteps > 0 && !colisionado) {
                    maxSteps--;
                    let dx = 0, dy = 0;
                    if (curDir === 'UP') dy = -1;
                    else if (curDir === 'DOWN') dy = 1;
                    else if (curDir === 'LEFT') dx = -1;
                    else if (curDir === 'RIGHT') dx = 1;

                    let nextGridX = curGridX + dx;
                    let nextGridY = curGridY + dy;

                    if (nextGridY < 0 || nextGridY >= this.mapaMatriz.length || nextGridX < 0 || nextGridX >= this.mapaMatriz[0].length) {
                        const targetX = curGridX * this.tileSize + this.tileSize/2 + dx * (this.tileSize/2);
                        const targetY = curGridY * this.tileSize + this.tileSize/2 + dy * (this.tileSize/2);
                        this.laserGraphics.lineTo(targetX, targetY);
                        colisionado = true;
                        break;
                    }

                    const nextTile = this.mapaMatriz[nextGridY][nextGridX];
                    const nextTileSolid = TILE_DICT[nextTile]?.solido === true;

                    const nextX = nextGridX * this.tileSize + this.tileSize / 2;
                    const nextY = nextGridY * this.tileSize + this.tileSize / 2;
                    this.laserGraphics.lineTo(nextX, nextY);

                    if (pGridX === nextGridX && pGridY === nextGridY && !this.player.isDead && !this.player.isInvulnerable) {
                        this.player.isDead = true;
                        this.uiManager.mostrarMensajeFlotante(`⚡ ¡LÁSER MORTAL!`, this.player.x, this.player.y - 30);
                    }

                    const espejo = (this.espejos || []).find(e => e.gridX === nextGridX && e.gridY === nextGridY);
                    if (espejo) {
                        if (espejo.angulo === 45) {
                            if (curDir === 'UP') curDir = 'RIGHT';
                            else if (curDir === 'DOWN') curDir = 'LEFT';
                            else if (curDir === 'LEFT') curDir = 'DOWN';
                            else if (curDir === 'RIGHT') curDir = 'UP';
                        } else {
                            if (curDir === 'UP') curDir = 'LEFT';
                            else if (curDir === 'DOWN') curDir = 'RIGHT';
                            else if (curDir === 'LEFT') curDir = 'UP';
                            else if (curDir === 'RIGHT') curDir = 'DOWN';
                        }
                        curGridX = nextGridX;
                        curGridY = nextGridY;
                        continue;
                    }

                    const caja = (this.cajas || []).find(c => c.gridX === nextGridX && c.gridY === nextGridY);
                    if (caja) {
                        colisionado = true;
                        break;
                    }

                    if (nextTile === 25) {
                        receptoresActivados.add(`${nextGridX},${nextGridY}`);
                        colisionado = true;
                        break;
                    }

                    if (nextTileSolid) {
                        colisionado = true;
                        break;
                    }

                    curGridX = nextGridX;
                    curGridY = nextGridY;
                }
            }

            for (const rec of this.receptores || []) {
                const rx = rec.gridX;
                const ry = rec.gridY;
                const isActivated = receptoresActivados.has(`${rx},${ry}`);

                if (isActivated) {
                    if (this.mapaMatriz[rec.gateY]?.[rec.gateX] === 24) {
                        this.mapaMatriz[rec.gateY][rec.gateX] = 0;
                        this.renderizador.reconstruirTile(rec.gateX, rec.gateY, 0);
                        this.uiManager.mostrarMensajeFlotante("⚡ Reja Abierta", rec.gateX * this.tileSize + this.tileSize/2, rec.gateY * this.tileSize);
                    }
                } else {
                    const otroReceptorActivo = this.receptores.some(r => r.gateX === rec.gateX && r.gateY === rec.gateY && receptoresActivados.has(`${r.gridX},${r.gridY}`));
                    if (!otroReceptorActivo && this.mapaMatriz[rec.gateY]?.[rec.gateX] === 0) {
                        const playerOnGate = (pGridX === rec.gateX && pGridY === rec.gateY);
                        const boxOnGate = this.cajas.some(c => c.gridX === rec.gateX && c.gridY === rec.gateY);
                        if (!playerOnGate && !boxOnGate) {
                            this.mapaMatriz[rec.gateY][rec.gateX] = 24;
                            this.renderizador.reconstruirTile(rec.gateX, rec.gateY, 24);
                        }
                    }
                }
            }
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
        if (this.handleKeyUp) {
            window.removeEventListener('keyup', this.handleKeyUp);
        }

        if (this.hudElement) {
            this.hudElement.remove();
            this.hudElement = null;
        }

        const freezeEl = document.getElementById('freezeMiniGame');
        if (freezeEl) {
            freezeEl.remove();
        }

        const reviveBarEl = document.getElementById('reviveProgressBar');
        if (reviveBarEl) {
            reviveBarEl.remove();
        }

        if (this.laserGraphics) {
            this.laserGraphics.destroy(true);
            this.laserGraphics = null;
        }
        if (this.cajasSprites) {
            for (const item of this.cajasSprites) {
                if (item.view) item.view.destroy(true);
            }
            this.cajasSprites = null;
        }
        if (this.espejosSprites) {
            for (const item of this.espejosSprites) {
                if (item.view) item.view.destroy(true);
            }
            this.espejosSprites = null;
        }
        if (this.holdoutGraphicsList) {
            for (const item of this.holdoutGraphicsList) {
                if (item.circle) item.circle.destroy(true);
                if (item.text) item.text.destroy(true);
            }
            this.holdoutGraphicsList = null;
        }
        if (this.secuenciaPuzzlesList) {
            for (const item of this.secuenciaPuzzlesList) {
                for (const pg of item.pasosGraphics) {
                    if (pg.graphics) pg.graphics.destroy(true);
                }
            }
            this.secuenciaPuzzlesList = null;
        }
        if (this.capaPuzzles) {
            this.capaPuzzles.destroy(true);
            this.capaPuzzles = null;
        }

        // Limpiar los sprites de jugadores remotos
        if (this.remotePlayers) {
            this.remotePlayers.forEach(rp => {
                if (rp.sprite) rp.sprite.destroy({ children: true });
            });
            this.remotePlayers.clear();
        }

        const managers = [this.inputManager, this.renderizador, this.uiManager, this.enemyManager, this.networkManager];
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
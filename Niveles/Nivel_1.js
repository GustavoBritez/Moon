class Nivel_1 {
    constructor(canvas, config, onWin) {
        // 1. MODO DETECTIVE: Imprimimos en consola EXACTAMENTE qué llegó
        console.log("👀 MODO DETECTIVE - Datos recibidos por el motor:", config);

        // 2. LA BARRERA ESTRICTA (Si no hay matriz, el programa explota a propósito)
        if (!config || !config.matriz || !Array.isArray(config.matriz)) {
            console.error("🚨 ¡ALTO AHÍ! El Orquestador no envió la matriz.");
            throw new Error("Arquitectura estricta: Nivel abortado por falta de matriz. Revisá console.log de arriba.");
        }

        // 3. ASIGNACIONES NORMALES (Solo llega acá si la matriz es válida)
        this.canvas = canvas;
        this.config = config;
        this.onWin = onWin;
        this.mapaMatriz = config.matriz; // <-- Esta es la única asignación que necesitás

        // 1. INICIALIZAR PIXI.JS
        this.app = new PIXI.Application({
            view: canvas,
            width: 800,
            height: 600,
            backgroundColor: 0xffb7c5,
            resolution: window.devicePixelRatio || 1,
        });

        this.tileSize = 50;

        // Capas para mantener el orden visual
        this.capaFondo = new PIXI.Container();
        this.capaEntidades = new PIXI.Container();
        this.app.stage.addChild(this.capaFondo);
        this.app.stage.addChild(this.capaEntidades);

        // Variables de estado del jugador
        this.player = {
            gridX: 0,
            gridY: 0,
            sprite: null,
            isMoving: false
        };

        // Controles
        this.keys = {};
        this.handleKeyDown = (e) => this.keys[e.key] = true;
        this.handleKeyUp = (e) => this.keys[e.key] = false;

        // Arrancamos
        this.start();
    }

    start() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        this.construirMapa();

        this.app.ticker.add(() => this.update());

        this.conectarControlesAudio();
    }

    construirMapa() {
        for (let y = 0; y < this.mapaMatriz.length; y++) {
            for (let x = 0; x < this.mapaMatriz[y].length; x++) {

                let tipoCelda = this.mapaMatriz[y][x];
                let posX = x * this.tileSize;
                let posY = y * this.tileSize;


                let suelo = new PIXI.Graphics();
                suelo.beginFill(0xffe4e1); // Color suelo pastel
                suelo.drawRect(0, 0, this.tileSize, this.tileSize);
                suelo.endFill();
                suelo.x = posX;
                suelo.y = posY;
                this.capaFondo.addChild(suelo);

                // Si es PARED (1)
                if (tipoCelda === 1) {
                    let pared = new PIXI.Graphics();
                    pared.beginFill(0xff8b94); // Color pared
                    pared.drawRoundedRect(0, 0, this.tileSize, this.tileSize, 8); // Bordes redondeados
                    pared.endFill();
                    pared.x = posX;
                    pared.y = posY;
                    this.capaFondo.addChild(pared);
                }
                // Si es META (2)
                else if (tipoCelda === 2) {
                    let meta = new PIXI.Graphics();
                    meta.beginFill(0xffd3b6); // Color meta
                    meta.drawRect(0, 0, this.tileSize, this.tileSize);
                    meta.endFill();
                    meta.x = posX;
                    meta.y = posY;
                    this.capaFondo.addChild(meta);
                }
                // Si es el JUGADOR (3)
                else if (tipoCelda === 3) {
                    // Guardamos sus coordenadas en la libreta lógica de la matriz
                    this.player.gridX = x;
                    this.player.gridY = y;

                    // Creamos su gráfico
                    this.player.sprite = new PIXI.Graphics();
                    this.player.sprite.beginFill(0x3498db); // Color Azul
                    this.player.sprite.drawCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 2.5);
                    this.player.sprite.endFill();

                    // Lo posicionamos físicamente en la pantalla
                    this.player.sprite.x = posX;
                    this.player.sprite.y = posY;

                    this.capaEntidades.addChild(this.player.sprite);

                    // Limpiamos la matriz para que ese casillero vuelva a ser un "0" (suelo pisable)
                    this.mapaMatriz[y][x] = 0;
                }
            }
        }
    }

    update() {
        // Si GSAP todavía está animando el movimiento hacia el bloque actual, frenamos el código
        if (this.player.isMoving) return;

        let nextGridX = this.player.gridX;
        let nextGridY = this.player.gridY;

        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) nextGridY--;
        else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) nextGridY++;
        else if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) nextGridX--;
        else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) nextGridX++;

        // Si el usuario intentó moverse
        if (nextGridX !== this.player.gridX || nextGridY !== this.player.gridY) {

            // ¿Qué hay en esa celda futura? (Manejando límites de la matriz para evitar errores de índice)
            if (nextGridY >= 0 && nextGridY < this.mapaMatriz.length &&
                nextGridX >= 0 && nextGridX < this.mapaMatriz[0].length) {

                let destino = this.mapaMatriz[nextGridY][nextGridX];

                // Si NO es una pared (1)
                if (destino !== 1) {
                    this.player.isMoving = true; // Bloqueamos nuevas órdenes de teclado
                    this.player.gridX = nextGridX; // Actualizamos la matriz interna
                    this.player.gridY = nextGridY;

                    // GSAP hace la magia visual de deslizar al personaje al siguiente bloque
                    gsap.to(this.player.sprite, {
                        x: nextGridX * this.tileSize,
                        y: nextGridY * this.tileSize,
                        duration: 0.15, // Velocidad de paso
                        ease: "power1.inOut",
                        onComplete: () => {
                            this.player.isMoving = false; // Liberamos para el próximo paso

                            // Chequeo de Victoria
                            if (destino === 2) {
                                console.log("¡Llegaste a la mesa VIP!");
                                this.destroy();
                                this.onWin();
                            }
                        }
                    });
                }
            }
        }
    }

    destroy() {
        // Limpieza profunda de memoria
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    }

    conectarControlesAudio() {
        const btnMusic = document.getElementById('btnMusic');
        const volRange = document.getElementById('volRange');

        if (!btnMusic || !volRange) return;

        btnMusic.onclick = () => {
            const playing = window.audioManager.togglePlay();
            btnMusic.innerText = playing ? "🎵 Music ON" : "🔇 Music OFF";
        };

        volRange.oninput = (e) => {
            window.audioManager.setVolume(e.target.value);
        };
    }
}

¡Qué genialidad que ya esté funcionando! Ver ese bloque azul moverse por el mapa generado por código es un hito tremendo.

Y tenés una visión de diseño perfecta.Ese laberinto gigante que pasaste en la segunda imagen es imposible de meter en una pantalla de 800x600 sin que los pasillos queden del tamaño de una hormiga.

Lo que estás pidiendo se conoce en el desarrollo de videojuegos como el Patrón de Cámara(Camera Pattern).

¿Cómo funciona una "Cámara" en 2D ?
    Acá hay un truco mental espectacular: la cámara en realidad no se mueve, el que se mueve es el mundo entero en la dirección contraria.Imaginate que la pantalla de tu computadora(el canvas de 800x600) es una ventana de vidrio fijo.El nivel(tu laberinto de 40x40) es una cartulina gigante que está detrás.Para que parezca que Kitty / Daniel camina hacia la derecha, lo que hacemos es deslizar la cartulina gigante hacia la izquierda.

Para lograr esto en PixiJS, solo tenemos que meter todas tus capas adentro de una gran "Caja Maestra"(el Mundo) y decirle a GSAP que mueva esa caja al mismo tiempo que mueve al jugador.

Aquí tenés los 3 cambios exactos que tenés que hacer en tu Nivel_1.js para tener una cámara profesional que siga al personaje.

    PASO 1: Crear la "Caja Maestra" del Mundo
En el constructor de tu Nivel_1.js, buscá donde creás las capas y reemplazalo por esto.Agregamos this.mundo.

    JavaScript
this.tileSize = 50;

// 🔥 EL TRUCO DE LA CÁMARA: Creamos un Contenedor Maestro
this.mundo = new PIXI.Container();

// Capas internas (van ADENTRO del mundo, no sueltas en el stage)
this.capaFondo = new PIXI.Container();
this.capaEntidades = new PIXI.Container();

this.mundo.addChild(this.capaFondo);
this.mundo.addChild(this.capaEntidades);

// Y al lienzo principal de Pixi solo le pasamos el Mundo
this.app.stage.addChild(this.mundo);
PASO 2: Enfocar la cámara al arrancar el nivel
Justo al final de tu función construirMapa(), cuando el bucle ya terminó de armar todas las paredes y de posicionar al jugador, agregá estas líneas para que la cámara arranque centrada en vos y no en la esquina del mapa.

    JavaScript
construirMapa() {
    // ... (todo tu bucle for que ya tenés) ...

    // 🔥 NUEVO: Centramos la cámara en el jugador apenas arranca
    const mitadPantallaX = this.app.screen.width / 2;
    const mitadPantallaY = this.app.screen.height / 2;

    // Movemos el MUNDO en la dirección opuesta al jugador
    this.mundo.x = mitadPantallaX - (this.player.sprite.x + this.tileSize / 2);
    this.mundo.y = mitadPantallaY - (this.player.sprite.y + this.tileSize / 2);
}
PASO 3: Mover el mundo junto con el jugador
En tu función update(), donde tenés la animación de GSAP, vamos a decirle que no solo mueva el sprite del jugador, sino que mueva todo el this.mundo al mismo tiempo.

Reemplazá tu bloque de gsap.to por este:

JavaScript
// GSAP hace la magia visual
const destinoPixelX = nextGridX * this.tileSize;
const destinoPixelY = nextGridY * this.tileSize;

// 1. Movemos al personaje
gsap.to(this.player.sprite, {
    x: destinoPixelX,
    y: destinoPixelY,
    duration: 0.15,
    ease: "power1.inOut"
});

// 2. 🔥 Movemos la CÁMARA (El mundo va en reversa)
const mitadPantallaX = this.app.screen.width / 2;
const mitadPantallaY = this.app.screen.height / 2;

gsap.to(this.mundo, {
    x: mitadPantallaX - (destinoPixelX + this.tileSize / 2),
    y: mitadPantallaY - (destinoPixelY + this.tileSize / 2),
    duration: 0.15,
    ease: "power1.inOut",
    onComplete: () => {
        this.player.isMoving = false; // Liberamos para el próximo paso

        // Chequeo de Victoria
        if (destino === 2) {
            console.log("¡Llegaste a la meta!");
            this.destroy();
            this.onWin();
        }
    }
});
¡El mapa ahora es infinito!
Con este cambio, podés ir a tu levels.js y hacer una matriz brutal de 30x30 o 50x50 copiando el diseño del laberinto blanco y negro que me pasaste.

El canvas seguirá midiendo 800x600(para no romper la estética de tu web ni saturar la memoria), pero adentro, el jugador va a sentir que está explorando un mapa gigante porque la cámara lo va a seguir suavemente con cada paso que dé.

Avisame cuando implementes esto. ¡La sensación de caminar y que el mapa se revele es increíble!
// https://opengameart.org/content/lpc-house-interior-and-decorations
class Nivel_1 {
    constructor(canvas, config, onWin) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.onWin = onWin;
        this.animationFrameId = null;

        // 1. CARGA DE IMÁGENES EN CACHÉ
        this.imagenes = {
            pared: new Image(),
            reja: new Image(),
            pozo: new Image(),
            win: new Image()
        };
        this.imagenes.pared.src = './Assets/img/Nivel_1/muro.png';
        this.imagenes.reja.src = './Assets/img/Nivel_1/Reja.png';
        this.imagenes.pozo.src = './Assets/img/Nivel_1/Pozo.png';
        this.imagenes.win.src = './Assets/img/DearDaniel_Base.svg';

        // 2. ESTADO DEL JUGADOR
        this.player = {
            x: config.playerStartX,
            y: config.playerStartY,
            w: 40,
            h: 40,
            color: '#3498db',
            speed: 5,
            hp: 3, // Puntos de vida
            invulnerable: 0 // Temporizador de daño
        };

        // Copiamos los enemigos del config para poder modificarlos en tiempo real
        this.enemigos = JSON.parse(JSON.stringify(config.enemigos));

        this.keys = {};
        this.handleKeyDown = (e) => this.keys[e.key] = true;
        this.handleKeyUp = (e) => this.keys[e.key] = false;
    }

    start() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.gameLoop();
    }

    // 🔥 MOTOR MATEMÁTICO AABB: Comprueba si dos rectángulos se están tocando
    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.y + rect1.h > rect2.y
        );
    }

    update() {
        // 🔥 SOLUCIÓN 1: El reloj de invulnerabilidad (Se había borrado por accidente)
        // Esto le resta 1 en cada frame. Cuando llega a 0, podés volver a recibir daño.
        if (this.player.invulnerable > 0) {
            this.player.invulnerable--;
        }

        // --- MOVIMIENTO DEL JUGADOR CON PREDICCIÓN DE COLISIÓN ---
        let nextX = this.player.x;
        let nextY = this.player.y;
        let currentSpeed = this.player.speed;

        if (this.keys['c'] || this.keys['C']) {
            currentSpeed = 9;
            this.player.color = '#00ffff';
        } else {
            this.player.color = '#3498db';
        }

        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) nextY -= currentSpeed;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) nextY += currentSpeed;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) nextX -= currentSpeed;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) nextX += currentSpeed;

        // Límites del mapa para el jugador
        if (nextX < 0) nextX = 0;
        if (nextY < 0) nextY = 0;
        if (nextX + this.player.w > this.canvas.width) nextX = this.canvas.width - this.player.w;
        if (nextY + this.player.h > this.canvas.height) nextY = this.canvas.height - this.player.h;

        // Caja de colisión futura del JUGADOR
        let playerFutureRect = { x: nextX, y: nextY, w: this.player.w, h: this.player.h };
        let chocoContraFisica = false;

        for (let obs of this.config.obstaculos) {
            if (this.checkCollision(playerFutureRect, obs)) {
                chocoContraFisica = true;
                this.aplicarEfectoObstaculo(obs.tipo);
                break;
            }
        }

        if (!chocoContraFisica) {
            this.player.x = nextX;
            this.player.y = nextY;
        }

        // --- SOLUCIÓN 2: LÓGICA DE ENEMIGOS (Ahora respetan las paredes) ---
        this.enemigos.forEach(e => {
            if (e.tipo === "Baku") {
                // Baku preajusta su futuro en el eje X
                let futureEnemyRect = { x: e.x + e.dx, y: e.y, w: e.w, h: e.h };
                let chocaFisica = false;

                // Revisamos si en su próximo paso hay una pared o reja
                for (let obs of this.config.obstaculos) {
                    if (this.checkCollision(futureEnemyRect, obs)) { chocaFisica = true; break; }
                }

                // Si choca contra obstáculo o contra el borde de la pantalla, rebota
                if (chocaFisica || futureEnemyRect.x <= 0 || futureEnemyRect.x + e.w >= this.canvas.width) {
                    e.dx *= -1;
                } else {
                    e.x += e.dx;
                }
            }
            else if (e.tipo === "Berry") {
                // Berry preajusta su futuro en el eje Y
                let futureEnemyRect = { x: e.x, y: e.y + e.dy, w: e.w, h: e.h };
                let chocaFisica = false;

                for (let obs of this.config.obstaculos) {
                    if (this.checkCollision(futureEnemyRect, obs)) { chocaFisica = true; break; }
                }

                if (chocaFisica || futureEnemyRect.y <= 0 || futureEnemyRect.y + e.h >= this.canvas.height) {
                    e.dy *= -1;
                } else {
                    e.y += e.dy;
                }
            }
            else if (e.tipo === "Badtz") {
                let dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                if (dist < 250) {
                    // Badtz calcula su paso hacia vos, pero frena si hay pared
                    let nextEx = e.x, nextEy = e.y;
                    if (e.x < this.player.x) nextEx += e.speed;
                    if (e.x > this.player.x) nextEx -= e.speed;
                    if (e.y < this.player.y) nextEy += e.speed;
                    if (e.y > this.player.y) nextEy -= e.speed;

                    let futureEnemyRect = { x: nextEx, y: nextEy, w: e.w, h: e.h };
                    let chocaFisica = false;
                    for (let obs of this.config.obstaculos) {
                        if (this.checkCollision(futureEnemyRect, obs)) { chocaFisica = true; break; }
                    }

                    if (!chocaFisica) {
                        e.x = nextEx;
                        e.y = nextEy;
                    }
                }
            }

            // ¿El enemigo tocó al jugador?
            if (this.checkCollision(this.player, e)) {
                this.aplicarEfectoObstaculo("enemigo");
            }
        });

        // --- CONDICIÓN DE VICTORIA ---
        let winRect = { x: this.config.winX, y: this.config.winY, w: this.config.winW, h: this.config.winH };
        if (this.checkCollision(this.player, winRect)) {
            console.log("¡Llegaste a la mesa VIP!");
            this.destroy();
            this.onWin();
        }
    }

    aplicarEfectoObstaculo(tipo) {
        if (tipo === "pozo") {
            console.log("¡Caíste al pozo! Game Over.");
            this.reiniciarNivel();
        }
        else if ((tipo === "reja" || tipo === "enemigo") && this.player.invulnerable <= 0) {
            this.player.hp -= 1;
            this.player.invulnerable = 60;

            console.log(`¡Auch! Vidas restantes: ${this.player.hp}`);

            if (this.player.hp <= 0) {
                console.log("Sin vidas. Game Over.");
                this.reiniciarNivel();
            } else {
                this.player.x = this.config.playerStartX;
                this.player.y = this.config.playerStartY;
            }
        }
    }

    reiniciarNivel() {
        this.player.x = this.config.playerStartX;
        this.player.y = this.config.playerStartY;
        this.player.hp = 3;
        this.enemigos = JSON.parse(JSON.stringify(this.config.enemigos)); // Reseteamos posiciones
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar Victoria (Kitty)
        if (this.imagenes.win.complete) {
            this.ctx.drawImage(this.imagenes.win, this.config.winX, this.config.winY, this.config.winW, this.config.winH);
        }

        // Dibujar Obstáculos
        this.config.obstaculos.forEach(obs => {
            let img = this.imagenes[obs.tipo];
            if (img && img.complete) {
                this.ctx.drawImage(img, obs.x, obs.y, obs.w, obs.h);
            } else {
                // Fallback si la imagen no cargó aún
                this.ctx.fillStyle = "gray";
                this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            }
        });

        // Dibujar Enemigos
        this.enemigos.forEach(e => {
            this.ctx.fillStyle = e.color;
            this.ctx.fillRect(e.x, e.y, e.w, e.h);
        });

        // Dibujar Jugador (Titila si es invulnerable)
        if (this.player.invulnerable % 10 < 5) {
            this.ctx.fillStyle = this.player.color;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);
        }

        // Dibujar HUD (Vidas)
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText(`Vidas: ${this.player.hp}`, 20, 30);
    }

    gameLoop = () => {
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    conectarControlesAudio() {
        const btnMusic = document.getElementById('btnMusic');
        const volRange = document.getElementById('volRange');

        if (!btnMusic) return; // Por si acaso

        btnMusic.onclick = () => {
            const playing = window.audioManager.togglePlay();
            btnMusic.innerText = playing ? "🎵 Music ON" : "🔇 Music OFF";
        };

        volRange.oninput = (e) => {
            window.audioManager.setVolume(e.target.value);
        };
    } /// ver que onda aqui
}
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
        this.imagenes.pared.src = './Assets/img/Pared.png';
        this.imagenes.reja.src = './Assets/img/Reja.png';
        this.imagenes.pozo.src = './Assets/img/Pozo.png';
        this.imagenes.win.src = './Assets/img/DearDaniel_Win.png';

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
        // Reducir temporizador de invulnerabilidad
        // --- MOVIMIENTO DEL JUGADOR CON PREDICCIÓN DE COLISIÓN ---
        let nextX = this.player.x;
        let nextY = this.player.y;

        // 🔥 LÓGICA DE SPRINT: Si tocás la 'C', la velocidad pasa de 5 a 9
        let currentSpeed = this.player.speed;
        if (this.keys['c'] || this.keys['C']) {
            currentSpeed = 9;
            // Podés cambiarle el color temporalmente para que se note el "turbo"
            this.player.color = '#00ffff'; // Celeste brillante
        } else {
            this.player.color = '#3498db'; // Azul normal
        }

        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) nextY -= currentSpeed;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) nextY += currentSpeed;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) nextX -= currentSpeed;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) nextX += currentSpeed;

        // Límites del mapa
        if (nextX < 0) nextX = 0;
        if (nextY < 0) nextY = 0;
        if (nextX + this.player.w > this.canvas.width) nextX = this.canvas.width - this.player.w;
        if (nextY + this.player.h > this.canvas.height) nextY = this.canvas.height - this.player.h;

        // Caja de colisión futura
        let playerFutureRect = { x: nextX, y: nextY, w: this.player.w, h: this.player.h };
        let chocoContraFisica = false;

        // Verificar colisión contra obstáculos
        for (let obs of this.config.obstaculos) {
            if (this.checkCollision(playerFutureRect, obs)) {
                chocoContraFisica = true; // Es sólido, no podemos avanzar
                this.aplicarEfectoObstaculo(obs.tipo);
                break; // Cortamos el bucle, ya chocamos
            }
        }

        // Si el camino está libre, avanzamos realmente
        if (!chocoContraFisica) {
            this.player.x = nextX;
            this.player.y = nextY;
        }

        // --- LÓGICA DE ENEMIGOS E INTELIGENCIA ARTIFICIAL ---
        this.enemigos.forEach(e => {
            if (e.tipo === "Baku") {
                e.x += e.dx;
                // Si toca los bordes, rebota invirtiendo su velocidad
                if (e.x <= 0 || e.x + e.w >= this.canvas.width) e.dx *= -1;
            }
            else if (e.tipo === "Berry") {
                e.y += e.dy;
                if (e.y <= 0 || e.y + e.h >= this.canvas.height) e.dy *= -1;
            }
            else if (e.tipo === "Badtz") {
                // Teorema de Pitágoras para calcular distancia al jugador
                let dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                if (dist < 250) { // Radio de visión
                    if (e.x < this.player.x) e.x += e.speed;
                    if (e.x > this.player.x) e.x -= e.speed;
                    if (e.y < this.player.y) e.y += e.speed;
                    if (e.y > this.player.y) e.y -= e.speed;
                }
            }

            // ¿El enemigo tocó al jugador actual?
            if (this.checkCollision(this.player, e)) {
                this.aplicarEfectoObstaculo("enemigo"); // Funciona igual que la reja
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
            this.player.invulnerable = 60; // 1 segundo de invulnerabilidad (a 60 FPS)
            console.log(`¡Auch! Vidas restantes: ${this.player.hp}`);

            if (this.player.hp <= 0) {
                console.log("Sin vidas. Game Over.");
                this.reiniciarNivel();
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
}
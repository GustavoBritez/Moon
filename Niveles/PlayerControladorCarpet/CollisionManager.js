export class CollisionManager {
    constructor(mapaMatriz, tileSize) {
        this.mapaMatriz = mapaMatriz;
        this.tileSize = tileSize;
    }

    // --- COLISIONES CON EL ENTORNO (Grid Espacial O(1)) ---

    // Método privado para saber si una coordenada choca con un bloque
    esPared(x, y) {
        const col = Math.floor(x / this.tileSize);
        const fila = Math.floor(y / this.tileSize);

        // Protección contra salidas del mapa (abismos)
        if (fila < 0 || fila >= this.mapaMatriz.length || col < 0 || col >= this.mapaMatriz[0].length) {
            return true;
        }

        // El 1 representa un bloque sólido en tu matriz
        return this.mapaMatriz[fila][col] === 1;
    }

    // El controlador llama a esto para calcular el deslizamiento contra muros
    resolverMovimiento(player, vx, vy, dt) {
        let proximoX = player.x + vx * dt;
        let proximoY = player.y + vy * dt;
        const radio = this.tileSize * 0.25; // Tamaño físico de Kitty

        // Evaluación Eje X
        let chocaX = false;
        if (vx > 0) {
            if (this.esPared(proximoX + radio, player.y - radio) ||
                this.esPared(proximoX + radio, player.y + radio)) chocaX = true;
        } else if (vx < 0) {
            if (this.esPared(proximoX - radio, player.y - radio) ||
                this.esPared(proximoX - radio, player.y + radio)) chocaX = true;
        }
        const finalX = chocaX ? player.x : proximoX;

        // Evaluación Eje Y
        let chocaY = false;
        if (vy > 0) {
            if (this.esPared(finalX - radio, proximoY + radio) ||
                this.esPared(finalX + radio, proximoY + radio)) chocaY = true;
        } else if (vy < 0) {
            if (this.esPared(finalX - radio, proximoY - radio) ||
                this.esPared(finalX + radio, proximoY - radio)) chocaY = true;
        }
        const finalY = chocaY ? player.y : proximoY;

        return { x: finalX, y: finalY };
    }

    // --- COLISIONES DE COMBATE ---

    // Nivel_1 llamará a esto pasándole a Kitty y la lista de enemigos activos
    verificarColisionesJugadorEnemigo(player, enemies) {
        if (player.isDead) return;

        // Radios de colisión (Hitboxes circulares)
        const radioJugador = this.tileSize * 0.25;
        const radioEnemigo = this.tileSize * 0.22;
        const distanciaMinima = radioJugador + radioEnemigo;

        for (let i = 0; i < enemies.length; i++) {
            const enemigo = enemies[i];

            // Teorema de Pitágoras para distancia entre dos puntos
            const dx = player.x - enemigo.x;
            const dy = player.y - enemigo.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia < distanciaMinima) {
                // ¡Hubo un choque físico! 
                console.log("¡Kitty chocó contra un enemigo!");

                // Aquí delegamos la lógica a quien corresponda. 
                // El CollisionManager detecta el choque, pero NO resta vidas.
                // Eso lo hará el Nivel_1 o el PlayerController en el futuro.
                return true;
            }
        }
        return false;
    }
}
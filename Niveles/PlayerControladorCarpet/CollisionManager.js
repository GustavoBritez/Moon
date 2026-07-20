import { TILE_DICT } from '../../Service/TilemapRenderer.js';

export class CollisionManager {
    constructor(mapaMatriz, tileSize) {
        this.mapaMatriz = mapaMatriz;
        this.tileSize = tileSize;
        this.nivel = null;
    }

    // --- COLISIONES CON EL ENTORNO (Grid Espacial O(1)) ---
    esPared(x, y) {
        const col = Math.floor(x / this.tileSize);
        const fila = Math.floor(y / this.tileSize);

        if (fila < 0 || fila >= this.mapaMatriz.length || col < 0 || col >= this.mapaMatriz[0].length) {
            return true;
        }

        if (this.nivel && this.nivel.cajas && this.nivel.cajas.some(c => c.gridX === col && c.gridY === fila)) {
            return true;
        }

        return TILE_DICT[this.mapaMatriz[fila][col]]?.solido === true;
    }

    resolverMovimiento(player, vx, vy, dt) {
        let proximoX = player.x + vx * dt;
        let proximoY = player.y + vy * dt;
        const radio = this.tileSize * 0.25; // Tamaño físico de Kitty

        let chocaX = false;
        if (vx > 0) {
            if (this.esPared(proximoX + radio, player.y - radio) ||
                this.esPared(proximoX + radio, player.y + radio)) chocaX = true;
        } else if (vx < 0) {
            if (this.esPared(proximoX - radio, player.y - radio) ||
                this.esPared(proximoX - radio, player.y + radio)) chocaX = true;
        }
        const finalX = chocaX ? player.x : proximoX;

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

    verificarColisionesJugadorEnemigo(player, enemies) {
        if (player.isDead) return null;

        const radioJugador = this.tileSize * 0.25;

        for (let i = 0; i < enemies.length; i++) {
            const enemigo = enemies[i];
            if (enemigo.isDead) continue;

            const dx = player.x - enemigo.x;
            const dy = player.y - enemigo.y;

            const distSq = (dx * dx) + (dy * dy);

            const radioEnemigo = enemigo.radioColision !== undefined ? enemigo.radioColision : (this.tileSize * 0.35);
            const distanciaMinima = radioJugador + radioEnemigo;

            const distanciaMinimaSq = distanciaMinima * distanciaMinima;

            if (distSq < distanciaMinimaSq) {
                return enemigo;
            }
        }
        return null;
    }
}
import { TILE_DICT } from '../../Service/TilemapRenderer.js';

export class PlayerController {
    // + constructor(player, inputManager, collisionManager)
    constructor(player, inputManager, collisionManager) {
        // Guardamos las dependencias inyectadas por Nivel_1
        this.player = player;
        this.inputManager = inputManager;
        this.collisionManager = collisionManager;
    }

    // + update(dt: Number): void
    update(dt) {
        // 1. Si Kitty está muerta, no procesamos ningún movimiento
        if (this.player.isDead) return;

        // 2. Calculamos la intención de movimiento del usuario
        const vectorVelocidad = this.calcularVelocidadActual();
        const vx = vectorVelocidad.vx;
        const vy = vectorVelocidad.vy;

        // 3. Si hay intención de moverse, le pedimos al árbitro (CollisionManager) que valide la física
        if (vx !== 0 || vy !== 0) {
            // resolverMovimiento nos devuelve la posición (x, y) ya ajustada si chocamos contra una pared
            const nuevaPos = this.collisionManager.resolverMovimiento(this.player, vx, vy, dt);

            // Actualizamos la posición lógica en el modelo
            this.player.x = nuevaPos.x;
            this.player.y = nuevaPos.y;
        }

        // 4. Sincronizamos la parte visual (Si implementaste el método actualizarPosicionVisual en Player)
        if (typeof this.player.actualizarPosicionVisual === 'function') {
            this.player.actualizarPosicionVisual();
        } else if (this.player.sprite) {
            // Fallback por si aún manejas el sprite directamente
            this.player.sprite.x = this.player.x;
            this.player.sprite.y = this.player.y;
        }
    }

    // - calcularVelocidadActual(): Object
    calcularVelocidadActual() {
            let vx = 0;
            let vy = 0;
            let multiplicador = 1;

            // 1. Calculamos la posición en la matriz directamente desde el controlador
            const col = Math.floor(this.player.x / this.collisionManager.tileSize);
            const fila = Math.floor(this.player.y / this.collisionManager.tileSize);
            const matriz = this.collisionManager.mapaMatriz;

            // 2. Verificamos que Kitty no esté fuera del mapa
            if (fila >= 0 && fila < matriz.length && col >= 0 && col < matriz[0].length) {
                const tileId = matriz[fila][col];
                // Leemos el multiplicador del diccionario (asumiendo que lo importaste)
                multiplicador = TILE_DICT[tileId]?.multiplicadorVel || 1;
            }

            // 3. Calculamos la velocidad final
            const velocidadBase = this.player.speed * multiplicador;

            if (this.inputManager.isActionPressed('MOVE_UP')) vy -= velocidadBase;
            if (this.inputManager.isActionPressed('MOVE_DOWN')) vy += velocidadBase;
            if (this.inputManager.isActionPressed('MOVE_LEFT')) vx -= velocidadBase;
            if (this.inputManager.isActionPressed('MOVE_RIGHT')) vx += velocidadBase;

            if (vx !== 0 && vy !== 0) {
                vx *= Math.SQRT1_2;
                vy *= Math.SQRT1_2;
            }

            return { vx, vy };
        }
}
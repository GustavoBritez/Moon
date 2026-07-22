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

        // 2. Deslizamiento en Hielo
        const col = Math.floor(this.player.x / this.collisionManager.tileSize);
        const fila = Math.floor(this.player.y / this.collisionManager.tileSize);
        const tileId = this.collisionManager.mapaMatriz[fila]?.[col] ?? 0;
        const isOnIce = (tileId === 4 || tileId === 7);

        if (isOnIce && !this.player.isFrozen) {
            if (!this.player.isSliding) {
                let dx = 0, dy = 0;
                if (this.inputManager.isActionPressed('MOVE_UP')) dy = -1;
                else if (this.inputManager.isActionPressed('MOVE_DOWN')) dy = 1;
                if (this.inputManager.isActionPressed('MOVE_LEFT')) dx = -1;
                else if (this.inputManager.isActionPressed('MOVE_RIGHT')) dx = 1;

                if (dx !== 0 || dy !== 0) {
                    this.player.isSliding = true;
                    this.player.slideDir = { dx, dy };
                }
            }
        } else {
            this.player.isSliding = false;
        }

        // 3. Calculamos la intención de movimiento del usuario o inercia
        let vx = 0, vy = 0;
        if (this.player.isSliding && this.player.slideDir) {
            const speed = this.player.speed * 1.4;
            vx = this.player.slideDir.dx * speed;
            vy = this.player.slideDir.dy * speed;
        } else {
            const vectorVelocidad = this.calcularVelocidadActual();
            vx = vectorVelocidad.vx;
            vy = vectorVelocidad.vy;
        }

        // 4. Si hay intención de moverse, le pedimos al árbitro (CollisionManager) que valide la física
        if (vx !== 0 || vy !== 0) {
            const anteriorX = this.player.x;
            const anteriorY = this.player.y;

            const nuevaPos = this.collisionManager.resolverMovimiento(this.player, vx, vy, dt);

            if (this.player.isSliding) {
                const distSq = Math.pow(nuevaPos.x - anteriorX, 2) + Math.pow(nuevaPos.y - anteriorY, 2);
                if (distSq < 0.01) {
                    this.player.isSliding = false;
                }
            }

            // Actualizamos la posición lógica en el modelo
            this.player.x = nuevaPos.x;
            this.player.y = nuevaPos.y;

            // Intentar empujar cajas
            this.verificarEmpujeCajas(vx, vy);
        }

        // 5. Sincronizamos la parte visual (Si implementaste el método actualizarPosicionVisual en Player)
        if (typeof this.player.actualizarPosicionVisual === 'function') {
            this.player.actualizarPosicionVisual();
        } else if (this.player.sprite) {
            this.player.sprite.x = this.player.x;
            this.player.sprite.y = this.player.y;
        }
    }

    verificarEmpujeCajas(vx, vy) {
        if (!this.nivel || !this.nivel.cajas) return;
        const dx = Math.sign(vx);
        const dy = Math.sign(vy);

        if ((dx !== 0) !== (dy !== 0)) {
            const pGridX = Math.floor(this.player.x / this.collisionManager.tileSize);
            const pGridY = Math.floor(this.player.y / this.collisionManager.tileSize);

            const boxGridX = pGridX + dx;
            const boxGridY = pGridY + dy;

            const box = this.nivel.cajas.find(c => c.gridX === boxGridX && c.gridY === boxGridY);
            if (box) {
                const destGridX = boxGridX + dx;
                const destGridY = boxGridY + dy;

                const destTile = this.collisionManager.mapaMatriz[destGridY]?.[destGridX] ?? 1;
                const isSolid = TILE_DICT[destTile]?.solido === true;

                const tieneOtraCaja = this.nivel.cajas.some(c => c.gridX === destGridX && c.gridY === destGridY);
                const tieneEnemigo = this.nivel.enemigos?.some(en => en.gridX === destGridX && en.gridY === destGridY);

                if (!isSolid && !tieneOtraCaja && !tieneEnemigo) {
                    box.gridX = destGridX;
                    box.gridY = destGridY;
                    if (this.player.isSliding) {
                        this.player.isSliding = false;
                    }

                    // Notificar a la red sobre el movimiento de la caja Sokoban
                    const boxIndex = this.nivel.cajas.indexOf(box);
                    if (boxIndex !== -1 && typeof this.nivel.onBoxPushed === 'function') {
                        this.nivel.onBoxPushed(boxIndex, destGridX, destGridY);
                    }
                }
            }
        }
    }

    // - calcularVelocidadActual(): Object
    calcularVelocidadActual() {
            if (this.player.isFrozen) {
                return { vx: 0, vy: 0 };
            }

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

export class TilemapRenderer {
    constructor(contenedor, matriz, tileSize) {
        this.contenedor = contenedor;
        this.matriz = matriz;
        this.tileSize = tileSize;
        this.poolBloques = [];
        this.filasPantalla = 0;
        this.colsPantalla = 0;
    }

    // --------------------------------------------------------
    // 1. EL CONSTRUCTOR DEL POOL (O(N) - Solo al inicio)
    // --------------------------------------------------------
    inicializarPool(ancho, alto) {
        this.colsPantalla = Math.ceil(ancho / this.tileSize) + 2;
        this.filasPantalla = Math.ceil(alto / this.tileSize) + 2;
        const totalBloques = this.colsPantalla * this.filasPantalla;

        // TRUCO POKI: PixiJS tiene una textura de 1x1 píxel en memoria.
        // No necesitas cargar imágenes PNG externas (ahorras muchísimos KB).
        const texturaBase = PIXI.Texture.WHITE;

        for (let i = 0; i < totalBloques; i++) {
            // Usamos Sprites, que la GPU procesa miles de veces más rápido que Graphics
            const sprite = new PIXI.Sprite(texturaBase);

            // Escalamos el píxel de 1x1 al tamaño de tu bloque (ej: 48x48)
            sprite.width = this.tileSize;
            sprite.height = this.tileSize;

            // Tintamos el sprite blanco al color que queramos (gris pared)
            sprite.tint = 0x444444;

            // Optimización: Desactivamos eventos del ratón para este bloque
            sprite.eventMode = 'none';
            sprite.visible = false;
            this.poolBloques.push(sprite);
            this.contenedor.addChild(sprite);
        }
    }

    // --------------------------------------------------------
    // 2. EL MOTOR GRÁFICO (O(M) - Donde M es la pantalla visible)
    // --------------------------------------------------------
actualizarVista(camaraX, camaraY) {
        const startCol = Math.floor((camaraX - window.innerWidth / 2) / this.tileSize);
        const startRow = Math.floor((camaraY - window.innerHeight / 2) / this.tileSize);

        let index = 0;

        // Aquí es donde recorremos la porción VISIBLE de la matriz
        for (let row = 0; row < this.filasPantalla; row++) {
            for (let col = 0; col < this.colsPantalla; col++) {

                const sprite = this.poolBloques[index++];
                const mRow = startRow + row;
                const mCol = startCol + col;

                // Si estamos dentro del mapa válido
                if (mRow >= 0 && mRow < this.matriz.length && mCol >= 0 && mCol < this.matriz[0].length) {

                    // 1. Leemos el número de la matriz (ej. 4 para Hielo)
                    const tipoNumero = this.matriz[mRow][mCol];

                    // 2. ¡CORREGIDO!: Buscamos sus reglas usando el nombre correcto del catálogo
                    const visual = TILE_DICT[tipoNumero] || TILE_DICT[0]; // Fallback al Suelo (0) por si hay un error

                    // 3. Aplicamos el visual de forma dinámica utilizando sus propiedades
                    // Si el tile es el ID 1 (Pared_Base), no tiene propiedad "dibuja" explícita, 
                    // pero al existir en el diccionario podemos validar si queremos renderizarlo.
                    // Tip: Asegúrate de que tus objetos del diccionario tengan propiedades consistentes 
                    // o simplemente usa el color si existe.
                    if (visual) {
                        sprite.tint = visual.color; // Pintamos del color correspondiente (ej: 0xe67e22 para Lava)
                        sprite.x = mCol * this.tileSize;
                        sprite.y = mRow * this.tileSize;
                        if (!sprite.visible) sprite.visible = true;
                    } else {
                        if (sprite.visible) sprite.visible = false;
                    }
                } else {
                    if (sprite.visible) sprite.visible = false;
                }
            }
        }
    }
    // --------------------------------------------------------
    // 3. MÉTODOS DE SEGURIDAD Y SOPORTE
    // --------------------------------------------------------

    obtenerDatosTileProtegido(gridX, gridY) {
        if (gridY < 0 || gridY >= this.matriz.length ||
            gridX < 0 || gridX >= this.matriz[0].length) {
            return null;
        }
        const idTile = this.matriz[gridY][gridX];
        return TILE_DICT[idTile];
    }

    redimensionarPantalla(nuevoAncho, nuevoAlto) {
        // Limpiar el pool viejo para evitar Memory Leaks
        for (const sprite of this.poolBloques) {
            sprite.destroy();
        }
        this.poolBloques = [];
        this.contenedor.removeChildren();

        // Reconstruir con el nuevo tamaño
        this.inicializarPool(nuevoAncho, nuevoAlto);
    }

    destroy() {
        for (const sprite of this.poolBloques) {
            sprite.destroy();
        }
        this.poolBloques = [];
        this.matriz = null;
    }
}



export const TILE_DICT = {
    // Básicos y Sistema (0-3)
    0: { name: 'Suelo', color: 0x2c3e50, solido: false },
    1: { name: 'Pared_Base', color: 0x7f8c8d, solido: true },
    2: { name: 'Meta', color: 0xf1c40f, solido: false, esMeta: true },
    3: { name: 'Spawn', color: 0x00ffff, solido: false },

    // Bioma: Hielo (4-7)
    4: { name: 'Hielo', color: 0xa4ebf3, solido: false, friccion: 0.2 }, // Resbala
    5: { name: 'Nieve', color: 0xffffff, solido: false, multiplicadorVel: 0.6 }, // Lento
    6: { name: 'Pared_Hielo', color: 0x2980b9, solido: true },
    7: { name: 'Agua_Congelada', color: 0x1abc9c, solido: false, daño: 1 }, // Frío

    // Bioma: Volcánico (8-11)
    8: { name: 'Piedra_Volcanica', color: 0x34495e, solido: false },
    9: { name: 'Lava', color: 0xe67e22, solido: false, daño: 15 }, // Quema
    10: { name: 'Ceniza', color: 0x111111, solido: false, multiplicadorVel: 0.8 },
    11: { name: 'Muro_Obsidiana', color: 0x000000, solido: true },

    // Bioma: Pantano/Bosque (12-15)
    12: { name: 'Pasto', color: 0x2ecc71, solido: false },
    13: { name: 'Pantano', color: 0x145a32, solido: false, multiplicadorVel: 0.4 }, // Muy lento
    14: { name: 'Tronco', color: 0x8e44ad, solido: true },
    15: { name: 'Veneno', color: 0x00ff00, solido: false, daño: 5 },

    // Bioma: Tech / Laboratorio (16-19)
    16: { name: 'Baldosa_Metal', color: 0xbdc3c7, solido: false },
    17: { name: 'Muro_Titanio', color: 0x2c3e50, solido: true },
    18: { name: 'Acido', color: 0x39ff14, solido: false, daño: 20 },
    19: { name: 'Portal_Lab', color: 0x9b59b6, solido: false, esTeleport: true, destino: 3 }
};
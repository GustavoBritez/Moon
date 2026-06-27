import { TILE_DICT } from './TileTypes.js';

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
    // 1. EL CONSTRUCTOR DEL POOL (Se llama 1 sola vez al inicio)
    // --------------------------------------------------------
    inicializarPool(ancho, alto) {
        // Calculamos cuántos bloques caben en pantalla + 2 de margen (buffer)
        this.colsPantalla = Math.ceil(ancho / this.tileSize) + 2;
        this.filasPantalla = Math.ceil(alto / this.tileSize) + 2;
        const totalBloques = this.colsPantalla * this.filasPantalla;

        // Creamos los objetos gráficos una sola vez
        for (let i = 0; i < totalBloques; i++) {
            const grafico = new PIXI.Graphics();
            this.poolBloques.push(grafico);
            this.contenedor.addChild(grafico);
        }
    }

    // --------------------------------------------------------
    // 2. EL MOTOR GRÁFICO (Se llama 60 veces por segundo)
    // --------------------------------------------------------
    actualizarVista(camaraX, camaraY) {
        const startCol = Math.floor((camaraX - window.innerWidth / 2) / this.tileSize);
        const startRow = Math.floor((camaraY - window.innerHeight / 2) / this.tileSize);

        let index = 0;
        for (let row = 0; row < this.filasPantalla; row++) {
            for (let col = 0; col < this.colsPantalla; col++) {
                const bloque = this.poolBloques[index++];
                const mRow = startRow + row;
                const mCol = startCol + col;

                if (mRow >= 0 && mRow < this.matriz.length && mCol >= 0 && mCol < this.matriz[0].length) {
                    const tipo = this.matriz[mRow][mCol];

                    if (tipo === 1) {
                        bloque.clear();
                        bloque.beginFill(0x444444); // Color gris pared
                        bloque.drawRect(mCol * this.tileSize, mRow * this.tileSize, this.tileSize, this.tileSize);
                        bloque.endFill();
                        bloque.renderable = true;
                    } else {
                        bloque.renderable = false;
                    }
                } else {
                    bloque.renderable = false;
                }
            }
        }
    }

    // --------------------------------------------------------
    // 3. MÉTODOS DE SEGURIDAD Y SOPORTE
    // --------------------------------------------------------

    // Un método vital para evitar que el juego explote si la cámara 
    // intenta leer la posición -1 o la 101 (fuera de la matriz de 100x100)
    obtenerDatosTileProtegido(gridX, gridY) {
        if (gridY < 0 || gridY >= this.matriz.length ||
            gridX < 0 || gridX >= this.matriz[0].length) {
            return null; // Si está fuera de los límites, devolvemos vacío (un abismo negro)
        }
        const idTile = this.matriz[gridY][gridX];
        return TILE_DICT[idTile];
    }

    // Si el jugador rota el celular o cambia el tamaño de la ventana del navegador,
    // necesitamos recalcular el pool (capaz ahora caben más bloques en pantalla).
    redimensionarPantalla(nuevoAncho, nuevoAlto) {
        // Limpiamos el pool viejo y llamamos a inicializarPool() de nuevo.
    }
}
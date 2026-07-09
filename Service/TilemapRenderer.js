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

        // LA MAGIA: Dibujamos una baldosa 3D con bordes redondeados, sombra y bisel usando SVG
        const svgTile = `
        <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="7" width="58" height="55" rx="12" fill="#000000" opacity="0.3"/>
            <rect x="3" y="3" width="58" height="53" rx="12" fill="#ffffff"/>
            <rect x="3" y="3" width="58" height="12" rx="12" fill="#ffffff" opacity="0.7"/>
        </svg>`;
        
        // PixiJS lee el código de arriba y crea una textura nativa
        const urlTextura = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svgTile);
        const texturaBase = PIXI.Texture.from(urlTextura);

        for (let i = 0; i < totalBloques; i++) {
            const sprite = new PIXI.Sprite(texturaBase);

            // Ya no necesitamos restar márgenes matemáticos, el SVG ya trae su propio espaciado interno
            sprite.width = this.tileSize;
            sprite.height = this.tileSize;

            sprite.tint = 0x444444;
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
        const tiempo = performance.now() / 1000;

        for (let row = 0; row < this.filasPantalla; row++) {
            for (let col = 0; col < this.colsPantalla; col++) {

                const sprite = this.poolBloques[index++];
                const mRow = startRow + row;
                const mCol = startCol + col;

                if (mRow >= 0 && mRow < this.matriz.length && mCol >= 0 && mCol < this.matriz[0].length) {

                    const tipoNumero = this.matriz[mRow][mCol];
                    const visual = TILE_DICT[tipoNumero] || TILE_DICT[0]; 

                    if (visual) {
                        sprite.tint = visual.color; 
                        
                        // Posición directa y exacta
                        sprite.x = mCol * this.tileSize;
                        sprite.y = mRow * this.tileSize;

                        sprite.blendMode = PIXI.BLEND_MODES.NORMAL;
                        let opacidadFinal = visual.alpha || 1.0;

                        // SHADERS
                        if (tipoNumero === 4) { 
                            const semillaDestello = Math.sin(mRow * 12.9898 + mCol * 78.233 + tiempo * 8);
                            if (semillaDestello > 0.98) {
                                sprite.tint = 0xFFFFFF;
                                sprite.blendMode = PIXI.BLEND_MODES.ADD;
                                opacidadFinal = 1.0;
                            } else {
                                sprite.tint = visual.color; 
                                sprite.blendMode = PIXI.BLEND_MODES.NORMAL;
                                const olaFrio = Math.sin((mRow + mCol) * 0.5 - tiempo * 3); 
                                opacidadFinal = 0.6 + (olaFrio * 0.2); 
                            }
                        } else if (tipoNumero === 9) { 
                            sprite.blendMode = PIXI.BLEND_MODES.ADD;
                            opacidadFinal = 0.7 + (Math.sin(tiempo * 5) * 0.3); 
                        } else if (tipoNumero === 19) { 
                            sprite.blendMode = PIXI.BLEND_MODES.ADD;
                            opacidadFinal = Math.random() > 0.05 ? 1.0 : 0.2;
                            sprite.tint = (Math.sin(tiempo * 10) > 0) ? 0x9b59b6 : 0x8e44ad;
                        } else if (tipoNumero === 2) {
                            sprite.blendMode = PIXI.BLEND_MODES.ADD;
                            opacidadFinal = 0.8 + (Math.abs(Math.cos(tiempo * 8)) * 0.2);
                        } else if (!visual.solido) {
                            // Suelos base
                            if ((mRow + mCol) % 2 === 0) opacidadFinal *= 0.85; 
                        }

                        sprite.alpha = opacidadFinal;
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
        for (const sprite of this.poolBloques) {
            sprite.destroy();
        }
        this.poolBloques = [];
        this.contenedor.removeChildren();
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
export class TilemapRenderer {
    constructor(contenedor, matriz, tileSize) {
        this.contenedor = contenedor;
        this.matriz = matriz;
        this.tileSize = tileSize;
        this.poolBloques = [];
        this.filasPantalla = 0;
        this.colsPantalla = 0;
        this.texturasTiles = new Map();
    }

    colorAHex(color) {
        return `#${color.toString(16).padStart(6, '0')}`;
    }

    ajustarColor(color, factor) {
        const rojo = (color >> 16) & 255;
        const verde = (color >> 8) & 255;
        const azul = color & 255;

        const ajustarCanal = (canal) => {
            const valor = factor >= 0
                ? canal + (255 - canal) * factor
                : canal * (1 + factor);
            return Math.max(0, Math.min(255, Math.round(valor)));
        };

        return (ajustarCanal(rojo) << 16) | (ajustarCanal(verde) << 8) | ajustarCanal(azul);
    }

    obtenerColorCute(tipoNumero, visual) {
        const paletaCute = {
            0: 0xcfe8ff,
            1: 0xaab8c8,
            2: 0xffdd7d,
            3: 0x9df5e0,
            4: 0xb9f0ff,
            5: 0xf9fbff,
            6: 0x97d8ff,
            7: 0x8debd9,
            8: 0xc7cbe8,
            9: 0xffa7a7,
            10: 0x645a74,
            11: 0x8b7aa8,
            12: 0xbef2b6,
            13: 0xa6d9b1,
            14: 0xd9b7ff,
            15: 0xb7ffb0,
            16: 0xd9e0ea,
            17: 0x8fa0b8,
            18: 0xa8ff7a,
            19: 0xf0a7ff,
            20: 0xdfa375
        };

        return paletaCute[tipoNumero] || visual.color || 0xffffff;
    }

    crearSvgTile(tipoNumero, visual) {
        const colorBase = this.obtenerColorCute(tipoNumero, visual);
        const colorLuz = this.colorAHex(this.ajustarColor(colorBase, 0.34));
        const colorMedio = this.colorAHex(colorBase);
        const colorSombra = this.colorAHex(this.ajustarColor(colorBase, -0.18));
        const colorProfundo = this.colorAHex(this.ajustarColor(colorBase, -0.42));
        const borde = visual.solido ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.28)';

        let decoracion = '';

        switch (tipoNumero) {
            case 2:
                decoracion = `
                    <g opacity="0.95">
                        <circle cx="32" cy="32" r="10" fill="rgba(255,255,255,0.18)"/>
                        <circle cx="32" cy="32" r="6" fill="#ffffff" opacity="0.92"/>
                        <path d="M32 16 L35 27 L46 32 L35 37 L32 48 L29 37 L18 32 L29 27 Z" fill="rgba(255,255,255,0.45)"/>
                    </g>`;
                break;
            case 4:
                decoracion = `
                    <g opacity="0.58">
                        <path d="M10 44 L20 28 L28 36 L38 18 L48 30 L56 22" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 19 L22 26 L17 38" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
                        <path d="M44 43 L53 31 L58 39" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
                    </g>`;
                break;
            case 9:
                decoracion = `
                    <g opacity="0.8">
                        <circle cx="32" cy="34" r="14" fill="rgba(255,190,110,0.18)"/>
                        <circle cx="32" cy="34" r="7" fill="rgba(255,255,255,0.15)"/>
                        <path d="M18 50 C24 41, 27 36, 32 28 C37 36, 40 41, 46 50" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-linecap="round"/>
                    </g>`;
                break;
            case 19:
            case 21:
                decoracion = `
                    <g opacity="0.95">
                        <circle cx="32" cy="32" r="18" fill="none" stroke="rgba(255,255,255,0.32)" stroke-width="3"/>
                        <circle cx="32" cy="32" r="11" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>
                        <path d="M21 26 C26 18, 39 18, 43 27 C37 24, 29 24, 21 26 Z" fill="rgba(255,255,255,0.18)"/>
                    </g>`;
                break;
            case 20: // Cofre
                decoracion = `
                    <g opacity="0.95">
                        <!-- Madera inferior -->
                        <rect x="14" y="26" width="36" height="24" rx="4" fill="#a0522d" stroke="#5c2e16" stroke-width="2"/>
                        <!-- Tapa arqueada -->
                        <path d="M14 26 C14 12, 50 12, 50 26 Z" fill="#8b4513" stroke="#5c2e16" stroke-width="2"/>
                        <!-- Herraje y cerradura -->
                        <rect x="29" y="22" width="6" height="8" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>
                        <circle cx="32" cy="26" r="1.5" fill="#000000"/>
                        <!-- Ribetes metálicos laterales -->
                        <rect x="17" y="26" width="3" height="24" fill="#dcdde1" opacity="0.4"/>
                        <rect x="44" y="26" width="3" height="24" fill="#dcdde1" opacity="0.4"/>
                    </g>`;
                break;
            case 23: // Placa de Presión
                decoracion = `
                    <g opacity="0.95">
                        <rect x="18" y="18" width="28" height="28" rx="4" fill="#e1b12c" stroke="#f5cd79" stroke-width="2"/>
                        <circle cx="32" cy="32" r="5" fill="#f5cd79"/>
                    </g>`;
                break;
            case 24: // Muro Conectado
                decoracion = `
                    <g opacity="0.95">
                        <rect x="8" y="8" width="48" height="48" rx="6" fill="#2c3e50" stroke="#44bd32" stroke-width="3"/>
                        <line x1="8" y1="32" x2="56" y2="32" stroke="#44bd32" stroke-width="2"/>
                        <line x1="32" y1="8" x2="32" y2="56" stroke="#44bd32" stroke-width="2"/>
                    </g>`;
                break;
            case 25: // Receptor Láser
                decoracion = `
                    <g opacity="0.95">
                        <rect x="8" y="8" width="48" height="48" rx="6" fill="#12cbc4" stroke="#dff9fb" stroke-width="3"/>
                        <circle cx="32" cy="32" r="10" fill="#dff9fb"/>
                        <circle cx="32" cy="32" r="4" fill="#ff7f50"/>
                    </g>`;
                break;
            default:
                decoracion = `
                    <circle cx="20" cy="19" r="6" fill="rgba(255,255,255,0.18)"/>
                    <circle cx="42" cy="44" r="4" fill="rgba(0,0,0,0.08)"/>`;
                break;
        }

        return `
            <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="tileGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${colorLuz}"/>
                        <stop offset="55%" stop-color="${colorMedio}"/>
                        <stop offset="100%" stop-color="${colorSombra}"/>
                    </linearGradient>
                    <radialGradient id="tileGlow" cx="0.26" cy="0.18" r="0.9">
                        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
                        <stop offset="55%" stop-color="#ffffff" stop-opacity="0.12"/>
                        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                    </radialGradient>
                    <filter id="softShadow" x="-15%" y="-15%" width="130%" height="140%">
                        <feDropShadow dx="0" dy="3" stdDeviation="2.2" flood-color="#000000" flood-opacity="0.18"/>
                    </filter>
                </defs>
                <rect x="4" y="6" width="56" height="54" rx="16" fill="${colorProfundo}" opacity="0.22" filter="url(#softShadow)"/>
                <rect x="3" y="3" width="58" height="54" rx="16" fill="url(#tileGrad)" stroke="${borde}" stroke-width="1.15"/>
                <rect x="3" y="3" width="58" height="16" rx="16" fill="url(#tileGlow)" opacity="0.95"/>
                <rect x="7" y="7" width="50" height="8" rx="8" fill="#ffffff" opacity="0.22"/>
                <rect x="8" y="46" width="48" height="6" rx="6" fill="#ffffff" opacity="0.08"/>
                ${decoracion}
            </svg>`;
    }

    obtenerTexturaTile(tipoNumero, visual) {
        if (this.texturasTiles.has(tipoNumero)) {
            return this.texturasTiles.get(tipoNumero);
        }

        const svgTile = this.crearSvgTile(tipoNumero, visual);
        const urlTextura = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svgTile);
        const textura = PIXI.Texture.from(urlTextura);
        this.texturasTiles.set(tipoNumero, textura);

        return textura;
    }

    // --------------------------------------------------------
    // 1. EL CONSTRUCTOR DEL POOL (O(N) - Solo al inicio)
    // --------------------------------------------------------

    inicializarPool(ancho, alto) {
        this.colsPantalla = Math.ceil(ancho / this.tileSize) + 2;
        this.filasPantalla = Math.ceil(alto / this.tileSize) + 2;
        const totalBloques = this.colsPantalla * this.filasPantalla;

        for (let i = 0; i < totalBloques; i++) {
            const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);

            sprite.width = this.tileSize;
            sprite.height = this.tileSize;

            sprite.tint = 0xffffff;
            sprite.eventMode = 'none';
            sprite.visible = false;
            sprite._tileId = -1;

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
                        if (sprite._tileId !== tipoNumero) {
                            sprite.texture = this.obtenerTexturaTile(tipoNumero, visual);
                            sprite._tileId = tipoNumero;
                        }

                        sprite.tint = 0xffffff;

                        // Posición directa y exacta
                        sprite.x = mCol * this.tileSize;
                        sprite.y = mRow * this.tileSize;

                        sprite.blendMode = PIXI.BLEND_MODES.NORMAL;
                        let opacidadFinal = visual.alpha || 1.0;

                        // SHADERS
                        if (tipoNumero === 4) {
                            const semillaDestello = Math.sin(mRow * 12.9898 + mCol * 78.233 + tiempo * 8);
                            if (semillaDestello > 0.98) {
                                sprite.blendMode = PIXI.BLEND_MODES.ADD;
                                opacidadFinal = 1.0;
                            } else {
                                sprite.blendMode = PIXI.BLEND_MODES.NORMAL;
                                const olaFrio = Math.sin((mRow + mCol) * 0.5 - tiempo * 3);
                                opacidadFinal = 0.6 + (olaFrio * 0.2);
                            }
                        } else if (tipoNumero === 9) {
                            sprite.blendMode = PIXI.BLEND_MODES.ADD;
                            opacidadFinal = 0.7 + (Math.sin(tiempo * 5) * 0.3);
                        } else if (tipoNumero === 19 || tipoNumero === 21) {
                            sprite.blendMode = PIXI.BLEND_MODES.ADD;
                            opacidadFinal = Math.random() > 0.05 ? 1.0 : 0.2;
                        } else if (tipoNumero === 2) {
                            sprite.blendMode = PIXI.BLEND_MODES.ADD;
                            opacidadFinal = 0.9 + (Math.abs(Math.cos(tiempo * 8)) * 0.1);
                        } else if (!visual.solido) {
                            // Suelos base
                            if ((mRow + mCol) % 2 === 0) opacidadFinal *= 0.93;
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
    5: { name: 'Nieve', color: 0xffffff, solido: false, multiplicadorVel: 0.95 }, // Ralentización del 5%
    6: { name: 'Pared_Hielo', color: 0x2980b9, solido: true },
    7: { name: 'Agua_Congelada', color: 0x1abc9c, solido: false, daño: 1 }, // Frío

    // Bioma: Volcánico (8-11)
    8: { name: 'Piedra_Volcanica', color: 0x34495e, solido: false },
    9: { name: 'Lava', color: 0xe67e22, solido: false, daño: 15 }, // Quema
    10: { name: 'Ceniza', color: 0x111111, solido: false, multiplicadorVel: 0.99 }, // Ralentización del 1%
    11: { name: 'Muro_Obsidiana', color: 0x000000, solido: true },

    // Bioma: Pantano/Bosque (12-15)
    12: { name: 'Pasto', color: 0x2ecc71, solido: false },
    13: { name: 'Pantano', color: 0x145a32, solido: false, multiplicadorVel: 0.98 }, // Ralentización del 2%
    14: { name: 'Tronco', color: 0x8e44ad, solido: true },
    15: { name: 'Veneno', color: 0x00ff00, solido: false, daño: 5 },

    // Bioma: Tech / Laboratorio (16-19)
    16: { name: 'Baldosa_Metal', color: 0xbdc3c7, solido: false, multiplicadorVel: 1.05 }, // Acelera 5%
    17: { name: 'Muro_Titanio', color: 0x2c3e50, solido: true },
    18: { name: 'Acido', color: 0x39ff14, solido: false, daño: 20 },
    19: { name: 'Portal_Lab', color: 0x9b59b6, solido: false, esTeleport: true, destino: 3 },
    20: { name: 'Cofre', color: 0x8b5a2b, solido: false, esCofre: true },
    21: { name: 'Portal_Salida', color: 0xdfb4ff, solido: false, esTeleport: true },
    23: { name: 'Placa_Presion', color: 0xe1b12c, solido: false },
    24: { name: 'Muro_Conectado', color: 0x2c3e50, solido: true },
    25: { name: 'Receptor_Laser', color: 0x12cbc4, solido: true }
};
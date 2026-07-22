export class FieldOfView {
    constructor(tileSize, tileDict) {
        this.tileSize = tileSize;
        this.tileDict = tileDict;
    }

    // Helper: is a tile solid?
    isSolid(matriz, c, r) {
        if (r < 0 || r >= matriz.length || c < 0 || c >= matriz[0].length) return true; // Fuera del mapa es sólido
        const tileId = matriz[r][c];
        const info = this.tileDict[tileId];
        return info ? info.solido : false;
    }

    // Encuentra la intersección entre un rayo (px, py, dx, dy) y un segmento (x1, y1, x2, y2)
    getIntersection(px, py, dx, dy, x1, y1, x2, y2) {
        const r_px = px;
        const r_py = py;
        const r_dx = dx;
        const r_dy = dy;

        const s_px = x1;
        const s_py = y1;
        const s_dx = x2 - x1;
        const s_dy = y2 - y1;

        const r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
        if(r_mag === 0) return null;

        const T2 = r_dx * s_dy - r_dy * s_dx;
        if (T2 === 0) return null; // Paralelos

        const T1 = (s_px - r_px) * s_dy - (s_py - r_py) * s_dx;
        const U1 = (s_px - r_px) * r_dy - (s_py - r_py) * r_dx;

        const t = T1 / T2;
        const u = U1 / T2;

        if (t >= 0 && u >= 0 && u <= 1) {
            return {
                x: r_px + r_dx * t,
                y: r_py + r_dy * t,
                param: t
            };
        }
        return null;
    }

    calcularPoligono(px, py, radioCeldas, matriz) {
        const pCol = Math.floor(px / this.tileSize);
        const pFila = Math.floor(py / this.tileSize);

        const minCol = pCol - radioCeldas;
        const maxCol = pCol + radioCeldas;
        const minFila = pFila - radioCeldas;
        const maxFila = pFila + radioCeldas;

        const segments = [];
        const endpoints = [];

        const addSegment = (x1, y1, x2, y2) => {
            segments.push({ x1, y1, x2, y2 });
            endpoints.push({ x: x1, y: y1 });
            endpoints.push({ x: x2, y: y2 });
        };

        // Extraer segmentos de bordes visibles de muros
        for (let r = minFila; r <= maxFila; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (this.isSolid(matriz, c, r)) {
                    const x = c * this.tileSize;
                    const y = r * this.tileSize;
                    const s = this.tileSize;

                    // Si el vecino de arriba no es sólido, la pared superior es visible
                    if (!this.isSolid(matriz, c, r - 1)) addSegment(x, y, x + s, y);
                    // Abajo
                    if (!this.isSolid(matriz, c, r + 1)) addSegment(x, y + s, x + s, y + s);
                    // Izquierda
                    if (!this.isSolid(matriz, c - 1, r)) addSegment(x, y, x, y + s);
                    // Derecha
                    if (!this.isSolid(matriz, c + 1, r)) addSegment(x + s, y, x + s, y + s);
                }
            }
        }

        // Bounding box del área de visión
        const bMinX = minCol * this.tileSize;
        const bMinY = minFila * this.tileSize;
        const bMaxX = (maxCol + 1) * this.tileSize;
        const bMaxY = (maxFila + 1) * this.tileSize;

        addSegment(bMinX, bMinY, bMaxX, bMinY);
        addSegment(bMaxX, bMinY, bMaxX, bMaxY);
        addSegment(bMaxX, bMaxY, bMinX, bMaxY);
        addSegment(bMinX, bMaxY, bMinX, bMinY);

        // Limpiar endpoints duplicados
        const uniqueEndpoints = [];
        const set = new Set();
        for (let ep of endpoints) {
            const key = ep.x + "," + ep.y;
            if (!set.has(key)) {
                set.add(key);
                uniqueEndpoints.push(ep);
            }
        }

        // Para cada endpoint, calcular el ángulo y trazar 3 rayos
        const rays = [];
        for (let ep of uniqueEndpoints) {
            const angle = Math.atan2(ep.y - py, ep.x - px);
            rays.push(angle - 0.00001);
            rays.push(angle);
            rays.push(angle + 0.00001);
        }

        // Ordenar rayos
        rays.sort((a, b) => a - b);

        const polygon = [];

        for (let angle of rays) {
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            let closestIntersect = null;
            let minT = Infinity;

            for (let seg of segments) {
                const intersect = this.getIntersection(px, py, dx, dy, seg.x1, seg.y1, seg.x2, seg.y2);
                if (intersect && intersect.param < minT) {
                    minT = intersect.param;
                    closestIntersect = intersect;
                }
            }

            if (closestIntersect) {
                polygon.push(closestIntersect);
            }
        }

        return polygon;
    }
}

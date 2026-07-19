export const NIVEL_PACK = {
    principal: {
        matriz: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 1],
            [1, 0, 3, 0, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 1],
            [1, 0, 0, 14, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 14, 1],
            [1, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 14, 14, 1],
            [1, 0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 0, 0, 0, 14, 1],
            [1, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 14, 1],
            [1, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 1],
            [1, 14, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 1],
            [1, 14, 0, 0, 0, 5, 5, 0, 14, 0, 0, 0, 0, 5, 0, 0, 0, 0, 14, 1],
            [1, 14, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 14, 1],
            [1, 14, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 14, 14, 14, 14, 14, 14, 14, 1],
            [1, 14, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 14, 1],
            [1, 14, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 14, 1],
            [1, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 1],
            [1, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 1],
            [1, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 1],
            [1, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 1],
            [1, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        enemigos: [
            { type: 'BASE', tipo: 'BASE', gridX: 3, gridY: 3, vida: 50, velocidad: 80, defensa: 10, resistencias: {}, decoradores: ['SPLITTER'], danioBase: 2, tipoDanio: 'PORCENTAJE_BASE' },
            { type: 'BASE', tipo: 'BASE', gridX: 3, gridY: 4, vida: 50, velocidad: 80, defensa: 10, resistencias: {}, decoradores: ['SPLITTER'], danioBase: 2, tipoDanio: 'PORCENTAJE_BASE' },
            { type: 'MONSTER_SPAWNER', tipo: 'MONSTER_SPAWNER', gridX: 9, gridY: 7, vida: 300, velocidad: 0, defensa: 15, resistencias: {}, decoradores: [], danioBase: 0, tipoDanio: 'PORCENTAJE_BASE' },
            { type: 'NECROMANCER', tipo: 'NECROMANCER', gridX: 14, gridY: 4, vida: 220, velocidad: 90, defensa: 5, resistencias: {}, decoradores: [], danioBase: 3, tipoDanio: 'PORCENTAJE_BASE' },
            { type: 'ORC_BOSS', tipo: 'ORC_BOSS', gridX: 15, gridY: 17, vida: 450, velocidad: 75, defensa: 20, resistencias: {}, decoradores: [], danioBase: 5, tipoDanio: 'PORCENTAJE_BASE' }
        ],
        portales: []
    }
};

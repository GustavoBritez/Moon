
import { NIVEL_PACK } from './Mapa_1.js';

export const GAME_LEVELS = {
    1: {
        type: "lobby",
        title: "Lobby",
        text: " Hola soy tu avatar ",
    },
    2: {
        type: "Nivel_1",
        title: "¡Prueba de Estrés 100x100!",
        pack: NIVEL_PACK
    }
};
// 3. CONFIGURACIÓN GLOBAL DE FÍSICAS
window.GAME_TUNING = window.GAME_TUNING || {
    tileSize: 48,
    playerHP: 100,
    playerSpeed: 170,
    berrySpeedBoost: 0.5,
    berryVisionTiles: 5,
    bulletSpeed: 420,
    bulletRadius: 6,
    bulletCooldown: 220,
    turboMultiplier: 1.6,
    turboDurationMs: 2000,
    enemyDamageCooldownMs: 900
};
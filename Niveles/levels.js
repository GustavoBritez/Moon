// =================================================================
// CONFIGURACIÓN DE NIVELES (DATA-DRIVEN)
// =================================================================
const GAME_LEVELS = {
    1: {
        type: "lobby",
        title: "Lobby",
        text: " Hola soy tu avatar ",
    },
    2: {
        type: "grum",
        title: "¡Llevando los tragos!",
        matriz: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 4, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 5, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 2, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        enemigos: [
            { tipo: "Baku", gridX: 8, gridY: 1, color: "#8a2be2" },
            { tipo: "Badtz", gridX: 4, gridY: 7, color: "#f1c40f" },
            { tipo: "Berry", gridX: 13, gridY: 8, color: "#2ecc71" }
        ]
    },
    3: {
        type: "nivel 2", //
        title: " BackRooms", // 
        subtitle: " Sin Salida ",
        rows: 6,
        cols: 6,
        moves: 4,
        emojis: ['🎀', '🌸', '⭐', '💖'],
        mode: "jelly"
    },
    4: {
        type: "nivel 3",
        avatar: "dear-daniel",
        title: " ??? ",
        text: `[INFO] Sin escribir `,
        buttonText: " Sin Escribir "

    }
};
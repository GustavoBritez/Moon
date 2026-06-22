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
        playerStartX: 50,
        playerStartY: 50,
        winX: 700,
        winY: 500,
        winW: 50,
        winH: 50,
        // LISTA DE OBSTÁCULOS FÍSICOS
        obstaculos: [
            // Primer bloque: Te obliga a ir hacia abajo
            { tipo: "pared", x: 150, y: 0, w: 40, h: 450 },
            // Deja un pasillo chiquito abajo de todo
            { tipo: "pared", x: 150, y: 530, w: 40, h: 70 },

            // Segundo bloque: Te obliga a volver a subir
            { tipo: "pared", x: 350, y: 100, w: 40, h: 500 },

            // Tercer bloque: Pasillo final hacia la derecha
            { tipo: "pared", x: 550, y: 0, w: 40, h: 350 },

            // Trampas en el medio de los pasillos
            { tipo: "reja", x: 190, y: 250, w: 160, h: 40 },
            { tipo: "pozo", x: 420, y: 450, w: 80, h: 80 }
        ],
        // LISTA DE ENEMIGOS REPOSICIONADOS
        enemigos: [
            // Baku patrulla el pasillo de arriba donde está la salida
            { tipo: "Baku", x: 400, y: 50, w: 40, h: 40, speed: 6, dx: 6, color: "#8a2be2" },
            // Berry sube y baja molestando cerca de la reja
            { tipo: "Badtz", x: 250, y: 350, w: 40, h: 40, speed: 3, dy: 3, color: "#f1c40f" },
            // Badtz te espera cerca de la entrada al VIP para perseguirte al final
            { tipo: "Berry", x: 600, y: 450, w: 40, h: 40, speed: 3, color: "#2ecc71" }
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
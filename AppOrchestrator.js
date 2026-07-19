import { GAME_LEVELS } from './Niveles/levels.js';
import { GameFactory } from './Service/GameFactory.js';

export class AppOrchestrator {
    constructor(contenedorId) {
        this.contenedor = document.getElementById(contenedorId);
        this.currentEngine = null;
        this.gameState = "MENU";

        this.currentLevelId = 1;

        // Inicializar Estado Global del Jugador
        if (!window.playerState) {
            window.playerState = {
                clase: "knight", // 'knight' o 'mage'
                gemas: 5,
                monedas: 150,
                nivel: 1,
                xpActual: 0.0,
                inventario: {
                    pocion_vida: 2,
                    escudo_hierro: 2,
                    daga_doble: 0,
                    martillo_rebote: 0
                },
                slots: [
                    "espada_basica",
                    null,
                    null,
                    null,
                    null
                ],
                durabilidad: {
                    espada_basica: 100,
                    daga_doble: 100,
                    martillo_rebote: 100
                },
                activeSlotIndex: 0
            };
        }
        if (window.playerState.nivel === undefined) window.playerState.nivel = 1;
        if (window.playerState.xpActual === undefined) window.playerState.xpActual = 0.0;

        this.crearCortinaTransicion();
    }

    crearCortinaTransicion() {
        this.cortina = document.createElement('div');
        this.cortina.style = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #14121f; z-index: 9999; pointer-events: none; opacity: 1;
        `;
        document.body.appendChild(this.cortina);
    }

    transitionTo(levelId) {
        if (this.gameState === "LOADING") return;
        this.gameState = "LOADING";

        // Bajamos la cortina (Fade a negro)
        gsap.to(this.cortina, {
            opacity: 1, duration: 0.4, onComplete: () => {

                // Limpieza del motor viejo
                if (this.currentEngine && typeof this.currentEngine.destroy === 'function') {
                    this.currentEngine.destroy();
                }
                this.currentEngine = null;

                // Construimos el nuevo nivel
                this.renderLevel(levelId);
            }
        });
    }

    renderLevel(levelId) {
        const datosNivel = GAME_LEVELS[levelId];

        if (!datosNivel) {
            console.error(`El nivel ${levelId} no existe en GAME_LEVELS`);
            return;
        }

        this.currentLevelId = levelId;

        const alTerminarNivel = (status) => this.procesarVictoria(status === 'LEVEL_VICTORY');
        const alSeleccionarNivel = (idDestino) => this.transitionTo(idDestino);

        const productoMecanico = GameFactory.build(
            datosNivel.type,
            datosNivel,
            alTerminarNivel,
            alSeleccionarNivel
        );

        if (!productoMecanico) return;

        this.contenedor.innerHTML = productoMecanico.template;

        this.gameState = datosNivel.type === "lobby" ? "MENU" : "PLAYING";
        this.currentEngine = productoMecanico.init();

        gsap.to(this.cortina, { opacity: 0, duration: 0.4 });
    }

    procesarVictoria(esVictoria = true) {
        if (this.gameState === "VICTORY" || this.gameState === "DEFEAT") return;
        this.gameState = esVictoria ? "VICTORY" : "DEFEAT";
        
        if (esVictoria) {
            this.mostrarPantallaFinal(true);
        } else {
            console.log("Derrota: Relanzando la partida...");
            this.transitionTo(this.currentLevelId);
        }
    }


    mostrarPantallaFinal(esVictoria) {
        const modalViejo = document.getElementById('modalResultadoFinal');
        if (modalViejo) modalViejo.remove();

        const modal = document.createElement('div');
        modal.id = 'modalResultadoFinal';

        // Estilo del fondo difuminado
        modal.style = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(20, 18, 31, 0.75); backdrop-filter: blur(8px); 
            z-index: 1000; display: flex; flex-direction: column; 
            align-items: center; justify-content: center; opacity: 0;
        `;

        // Textos y colores dinámicos (Verde vs Rosa)
        const titulo = esVictoria ? "✨ ¡VICTORIA! ✨" : "💔 ¡DERROTA! 💔";
        const subtitulo = esVictoria ? "¡Mazmorra Superada!" : "Héroe Caído";
        const mensaje = esVictoria ? "¡Completaste el calabozo con éxito!" : "Tu héroe se ha quedado sin salud en la mazmorra...";
        const colorPrincipal = esVictoria ? "#2ecc71" : "#ff6584";
        const colorSombra = esVictoria ? "#27ae60" : "#d11a5b";
        const colorTexto = esVictoria ? "#a8e6cf" : "#ffb7c5";

        const nivelActual = this.currentLevelId;

        modal.innerHTML = `
            <div id="cajaResultadoFinal" style="background: #211933; border: 4px solid ${colorPrincipal}; border-radius: 28px; padding: 40px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.6); max-width: 400px; transform: scale(0.8);">
                
                <h1 style="color: ${colorTexto}; font-size: 2.8rem; margin: 0 0 10px 0; text-shadow: 3px 3px 0px ${colorSombra}; font-family: 'Comic Sans MS', sans-serif;">
                    ${titulo}
                </h1>
                
                <h2 style="color: white; font-size: 1.6rem; margin: 0 0 15px 0;">${subtitulo}</h2>
                <p style="color: #ddd; margin-bottom: 35px; font-size: 1.1rem; line-height: 1.5;">${mensaje}</p>

                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button onclick="window.orquestador.transitionTo(${nivelActual})" style="background: ${colorPrincipal}; color: white; border: none; padding: 16px 20px; border-radius: 16px; font-size: 1.2rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 0 ${colorSombra}; transition: transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        🔄 ${esVictoria ? "Jugar de Nuevo" : "Intentarlo de Nuevo"}
                    </button>
                    
                    <button onclick="window.orquestador.transitionTo(1)" style="background: rgba(0,0,0,0.3); color: ${colorTexto}; border: 2px solid ${colorPrincipal}; padding: 16px 20px; border-radius: 16px; font-size: 1.2rem; font-weight: bold; cursor: pointer; transition: all 0.2s;">
                        🏠 Volver al Lobby
                    </button>
                </div>
            </div>
        `;

        this.contenedor.appendChild(modal);

        gsap.to(modal, { opacity: 1, duration: 0.3 });
        gsap.to('#cajaResultadoFinal', { scale: 1, duration: 0.5, ease: "back.out(1.5)" });

        const btnPrincipal = modal.querySelector('button');
        if (btnPrincipal) {
            btnPrincipal.addEventListener('mousedown', () => btnPrincipal.style.transform = 'translateY(4px)');
            btnPrincipal.addEventListener('mouseup', () => btnPrincipal.style.transform = 'translateY(0)');
        }
    }
}
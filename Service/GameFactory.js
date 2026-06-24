class GameFactory {
    static build(tipo, datosNivel, alTerminarNivel, alSeleccionarNivel) {

        switch (tipo) {
            case "nivel 1":
                return {
                    template: `
                        <div class="slide active" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #1a1a2e; overflow: hidden;">
                            <h2 style="color: #ffb7c5; margin-bottom: 10px;">${datosNivel.title}</h2>
                            
                            <canvas id="clubCanvas" width="800" height="600" style="background: #16213e; border: 4px solid #d11a5b; border-radius: 12px; max-width: 100%; max-height: 70vh;"></canvas>
                            
                            <div id="mobileControls" style="display: flex; width: 100%; max-width: 800px; justify-content: space-between; padding: 20px; position: absolute; bottom: 0; box-sizing: border-box; z-index: 10; touch-action: none;">
                                
                                <div style="display: grid; grid-template-columns: 60px 60px 60px; grid-gap: 5px;">
                                    <div></div>
                                    <button id="btnW" style="height: 60px; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; touch-action: none;">W</button>
                                    <div></div>
                                    <button id="btnA" style="height: 60px; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; touch-action: none;">A</button>
                                    <button id="btnS" style="height: 60px; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; touch-action: none;">S</button>
                                    <button id="btnD" style="height: 60px; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; touch-action: none;">D</button>
                                </div>

                                <div style="display: flex; align-items: flex-end;">
                                    <button id="btnC" style="width: 80px; height: 80px; background: rgba(52,152,219,0.4); border: 2px solid #3498db; border-radius: 50%; color: white; font-weight: bold; font-size: 16px; touch-action: none;">SPRINT</button>
                                </div>
                            </div>
                        </div>`,
                    init: () => {
                        // 1. Capturamos el canvas del HTML
                        const canvas = document.getElementById('clubCanvas');

                        // 2. Instanciamos el juego pasándole el canvas y la función que se ejecuta al ganar
                        // (Asumo que "alTerminarNivel" es tu función global del Orquestador)
                        const juegoNivel1 = new Nivel_1(canvas, {}, alTerminarNivel);

                        // 3. Sistema para conectar los botones táctiles al juego
                        const conectarBotonMovil = (btnId, tecla) => {
                            const btn = document.getElementById(btnId);
                            if (btn) {
                                // Eventos para Celular (Touch)
                                btn.addEventListener('touchstart', (e) => { e.preventDefault(); juegoNivel1.keys[tecla] = true; });
                                btn.addEventListener('touchend', (e) => { e.preventDefault(); juegoNivel1.keys[tecla] = false; });

                                // Eventos para Mouse (Por si testeás en PC)
                                btn.addEventListener('mousedown', () => juegoNivel1.keys[tecla] = true);
                                btn.addEventListener('mouseup', () => juegoNivel1.keys[tecla] = false);
                                btn.addEventListener('mouseleave', () => juegoNivel1.keys[tecla] = false);
                            }
                        };

                        // 4. Conectamos cada botón a su letra correspondiente
                        conectarBotonMovil('btnW', 'w');
                        conectarBotonMovil('btnS', 's');
                        conectarBotonMovil('btnA', 'a');
                        conectarBotonMovil('btnD', 'd');
                        conectarBotonMovil('btnC', 'c');

                        // 5. Retornamos la instancia para que el Orquestador la pueda destruir si cambiamos de nivel
                        return juegoNivel1;
                    }
                };
            case "nivel 2":
                return {
                    template: `
                        <div class="slide active">
                            <h2>${datosNivel.title}</h2>
                            <div id="marioCanvas" style="width:100%; height:400px; background:#87CEEB; position:relative; overflow:hidden;"></div>
                        </div>`,
                    init: () => {
                        const canvasEl = document.getElementById('marioCanvas');
                        const engine = new Nivel_2(canvasEl, datosNivel, alTerminarNivel);
                        engine.start();
                        return engine;
                    }
                };

            case "nivel 3":
                return {
                    template: `
                        <div class="story-container">
                            <div class="avatar-marco" style="width: 150px; height: 150px; margin-bottom: 0; position: relative;">
                                <div id="jugadorAvatar" class="daniel-oficial-avatar" style="width: 110px; height: 110px;"></div>
                                
                                <button id="btnCambiarAvatar" style="position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); background: #ff6584; color: white; border: none; border-radius: 20px; padding: 4px 12px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); z-index: 10;">
                                    🔄 
                                </button>
                            </div>
                            
                            <div class="story-card">
                                <h1>¡Próximamente!</h1>
                                <p>Dear Daniel todavía está programando las físicas de este nivel. ¡Vuelve pronto!</p>
                                <button class="btn btn-acepto" id="btnVolverLobby">Volver al Menú</button>
                            </div>
                        </div>`,
                    init: () => {
                        console.log("Nivel 3 cargado. Iniciando temporizador de regreso...");

                        // 1. EL BOTÓN MANUAL (Siempre dejalo activo como plan B)
                        const btnVolver = document.getElementById('btnVolverLobby');
                        btnVolver.addEventListener('click', () => {
                            console.log("El jugador forzó el regreso haciendo clic.");
                            alTerminarNivel();
                        });

                        // 2. EL REGRESO AUTOMÁTICO (Subimos a 4000ms para que tengan tiempo de leer)
                        setTimeout(() => {
                            console.log("Se acabó el tiempo automático. Regresando...");
                            // Hacemos clic virtualmente en el botón para unificar la lógica
                            btnVolver.click();
                        }, 4000);

                        return null;
                    }
                };
            case "lobby":
                // Dentro del case "lobby"
                let menuHtml = `
                    <div class="lobby-pantalla">
                        <div class="lobby-top">
                            
                            <div class="avatar-marco" style="width: 150px; height: 150px; margin-bottom: 0; position: relative;">
                                <div id="jugadorAvatar" class="daniel-oficial-avatar" style="width: 110px; height: 110px;"></div>
                                
                                <button id="btnCambiarAvatar" style="position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); background: #ff6584; color: white; border: none; border-radius: 20px; padding: 4px 12px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); z-index: 10;">
                                    🔄 
                                </button>
                            </div>

                            <div class="lobby-recursos">
                                <div class="recurso-item"><div class="recurso-circulo">☁️</div><span class="recurso-cantidad">150</span></div>
                                <div class="recurso-item"><div class="recurso-circulo">☕</div><span class="recurso-cantidad">5</span></div>
                            </div>
                            
                            <div id="audio-container" style="position: absolute; bottom: 20px; right: 20px; z-index: 100; display: flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.4); padding: 10px 15px; border-radius: 16px; backdrop-filter: blur(5px); border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                                <button id="btnMusic" style="background: none; border: none; font-weight: bold; color: #d11a5b; cursor: pointer; font-size: 1rem;">🎵 Music ON</button>
                                <input type="range" id="volRange" min="0" max="100" value="50" style="width: 80px; cursor: pointer;">
                            </div>
                        </div>

                        <div class="lobby-bottom">
                            <button class="btn-historia" id="btnHistoriaLobby"> Historia </button>
                            <button class="btn-puzzle" id="btnPuzzleLobby"> Puzzle </button>
                        </div>
                    </div>

                    <div class="modal-overlay" id="modalNiveles" style="opacity: 0; visibility: hidden;">
                        <div class="modal-menu">
                            <button class="btn-cerrar-modal" id="btnCerrarModal">✖</button>
                            <h2 class="modal-titulo"> Que haremos hoy ? </h2>
                            
                            <button class="btn-nivel" data-id="2">Nivel 1: Historia</button>
                            <button class="btn-nivel" data-id="3">Nivel 2: Plataformas</button>
                            <button class="btn-nivel" data-id="4">Nivel 3: ¿?</button>
                        </div>
                    </div>

                    <div id="cartelAviso" style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: #ff6584; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 1.2rem; opacity: 0; visibility: hidden; z-index: 999; box-shadow: 0 4px 15px rgba(209, 26, 91, 0.4);">
                        🚧 Nivel no escrito aún
                    </div>
                `;

                return {
                    template: menuHtml,

                    init: () => {
                        setTimeout(() => {
                            // 1. Mapeamos todos los elementos del DOM
                            const elementos = {
                                'modalNiveles': document.getElementById('modalNiveles'),
                                'btnHistoriaLobby': document.getElementById('btnHistoriaLobby'),
                                'btnPuzzleLobby': document.getElementById('btnPuzzleLobby'), // Nuevo botón Puzzle
                                'btnCerrarModal': document.getElementById('btnCerrarModal'),
                                'btnMusic': document.getElementById('btnMusic'),
                                'volRange': document.getElementById('volRange'),
                                'avatarDiv': document.getElementById('jugadorAvatar'),
                                'btnCambiarAvatar': document.getElementById('btnCambiarAvatar')
                            };

                            // 2. Escudo de seguridad para evitar errores de null
                            for (const [nombre, elemento] of Object.entries(elementos)) {
                                if (!elemento) {
                                    console.error(`¡ERROR! El elemento con ID "${nombre}" no se encuentra en el DOM.`);
                                    return;
                                }
                            }

                            // 3. Extraemos TODAS las variables
                            const {
                                modalNiveles: modal,
                                btnHistoriaLobby: btnJugar,
                                btnPuzzleLobby: btnPuzzle,
                                btnCerrarModal: btnCerrar,
                                btnMusic,
                                volRange,
                                avatarDiv,
                                btnCambiarAvatar
                            } = elementos;

                            const cartel = document.getElementById('cartelAviso');
                            const botonesNivel = document.querySelectorAll('.btn-nivel');

                            // --- LÓGICA DE AVATARES ---
                            if (avatarDiv && btnCambiarAvatar) {
                                const catalogoAvatares = ['daniel-oficial-avatar', 'kitty-oficial-avatar'];

                                let avatarGuardado = localStorage.getItem('avatarPreferido') || 'daniel-oficial-avatar';
                                avatarDiv.className = avatarGuardado;

                                btnCambiarAvatar.addEventListener('click', () => {
                                    let indiceActual = catalogoAvatares.indexOf(avatarGuardado);

                                    indiceActual = (indiceActual + 1) % catalogoAvatares.length;
                                    avatarGuardado = catalogoAvatares[indiceActual];

                                    avatarDiv.className = avatarGuardado;

                                    localStorage.setItem('avatarPreferido', avatarGuardado);

                                    gsap.fromTo(avatarDiv,
                                        { scale: 0.8, rotation: -10 },
                                        { duration: 0.4, scale: 1, rotation: 0, ease: "back.out(1.5)" }
                                    );
                                });
                            }

                            // --- LÓGICA DEL BOTÓN HISTORIA (Abre el Modal) ---
                            btnJugar.addEventListener('click', () => {
                                gsap.to(modal, { duration: 0.2, autoAlpha: 1, ease: "power2.out" });
                                gsap.fromTo(".modal-menu",
                                    { scale: 0.5, y: 50 },
                                    { duration: 0.4, scale: 1, y: 0, ease: "back.out(1.5)" }
                                );
                            });

                            // --- LÓGICA DEL BOTÓN PUZZLE ---
                            btnPuzzle.addEventListener('click', () => {
                                gsap.to(".lobby-pantalla", {
                                    duration: 0.5,
                                    opacity: 0,
                                    onComplete: () => {
                                        console.log("¡Yendo a los Puzzles!");
                                        // window.juego.renderCurrentLevel('puzzle'); // Descomentar cuando exista el nivel
                                    }
                                });
                            });

                            // --- LÓGICA DE AUDIO ---
                            btnMusic.addEventListener('click', () => {
                                const playing = window.audioManager.togglePlay();
                                btnMusic.innerText = playing ? "🎵 Music ON" : "🔇 Music OFF";
                            });

                            volRange.addEventListener('input', (e) => {
                                window.audioManager.setVolume(e.target.value);
                            });

                            // --- CERRAR MODAL ---
                            btnCerrar.addEventListener('click', () => {
                                gsap.to(modal, { duration: 0.3, autoAlpha: 0, ease: "power2.in" });
                            });

                            // --- SALTAR AL NIVEL SELECCIONADO DESDE EL MODAL ---
                            botonesNivel.forEach(btn => {
                                btn.addEventListener('click', (e) => {
                                    const idDestino = Number(e.target.getAttribute('data-id'));

                                    if (idDestino === 4) {
                                        if (cartel) {
                                            gsap.to(cartel, { duration: 0.3, autoAlpha: 1, y: 20, ease: "back.out(2)" });
                                            gsap.to(cartel, { duration: 0.3, autoAlpha: 0, y: 0, delay: 2 });
                                        }
                                        return;
                                    }

                                    gsap.to(modal, { duration: 0.2, autoAlpha: 0 });
                                    // Asumimos que alSeleccionarNivel está definida globalmente en tu Orquestador
                                    alSeleccionarNivel(idDestino, 'kitty');
                                });
                            });

                        }, 0);

                        return null;
                    }
                };
            case "grum":
                return {
                    template: `
                        <div class="slide active" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #1a1a2e; overflow: hidden;">
                            <h2 style="color: #ffb7c5; margin-bottom: 10px;">${datosNivel.title}</h2>
                            
                            <canvas id="clubCanvas" width="800" height="600" style="background: #16213e; border: 4px solid #d11a5b; border-radius: 12px; max-width: 100%; max-height: 70vh; box-shadow: 0 0 20px rgba(209,26,91,0.3);"></canvas>
                            
                            <div id="mobileControls" style="display: flex; width: 100%; max-width: 800px; justify-content: space-between; padding: 20px; position: absolute; bottom: 0; box-sizing: border-box; z-index: 10; touch-action: none;">
                                
                                <div style="display: grid; grid-template-columns: 60px 60px 60px; grid-gap: 5px;">
                                    <div></div>
                                    <button id="btnW" style="height: 60px; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; touch-action: none;">W</button>
                                    <div></div>
                                    <button id="btnA" style="height: 60px; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; touch-action: none;">A</button>
                                    <button id="btnS" style="height: 60px; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; touch-action: none;">S</button>
                                    <button id="btnD" style="height: 60px; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; touch-action: none;">D</button>
                                </div>

                                <div style="display: flex; align-items: flex-end;">
                                    <button id="btnC" style="width: 80px; height: 80px; background: rgba(52,152,219,0.4); border: 2px solid #3498db; border-radius: 50%; color: white; font-weight: bold; font-size: 16px; touch-action: none;">SPRINT</button>
                                </div>
                            </div>
                        </div>`,
                    init: () => {
                        const canvasEl = document.getElementById('clubCanvas');

                        // Instanciamos el motor. IMPORTANTE: No llamamos a engine.start() porque ya se llama solo.
                        const engine = new Nivel_1(canvasEl, datosNivel, alTerminarNivel);

                        // Conexión de botones táctiles
                        const conectarBotonMovil = (btnId, tecla) => {
                            const btn = document.getElementById(btnId);
                            if (btn) {
                                btn.addEventListener('touchstart', (e) => { e.preventDefault(); engine.keys[tecla] = true; });
                                btn.addEventListener('touchend', (e) => { e.preventDefault(); engine.keys[tecla] = false; });
                                btn.addEventListener('mousedown', () => engine.keys[tecla] = true);
                                btn.addEventListener('mouseup', () => engine.keys[tecla] = false);
                                btn.addEventListener('mouseleave', () => engine.keys[tecla] = false);
                            }
                        };

                        conectarBotonMovil('btnW', 'w');
                        conectarBotonMovil('btnS', 's');
                        conectarBotonMovil('btnA', 'a');
                        conectarBotonMovil('btnD', 'd');
                        conectarBotonMovil('btnC', 'c');

                        return engine;
                    }
                };
            default:
                console.error(`La Fábrica no sabe cómo construir el juego: ${tipo}`);
                return null;
        }
    }
}
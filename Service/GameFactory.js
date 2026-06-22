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
                        document.getElementById('btnNext').addEventListener('click', alTerminarNivel);
                        return null;
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
                            <div class="avatar-marco">
                                <div class="daniel-oficial-avatar"></div>
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
                            <div class="avatar-marco" style="width: 150px; height: 150px; margin-bottom: 0;">
                                <div class="daniel-oficial-avatar" style="width: 110px; height: 110px;"></div>
                            </div>
                            <div class="lobby-recursos">
                                <div class="recurso-item"><div class="recurso-circulo">☁️</div><span class="recurso-cantidad">150</span></div>
                                <div class="recurso-item"><div class="recurso-circulo">☕</div><span class="recurso-cantidad">5</span></div>
                            </div>
                            
                            <div id="audio-container" style="position: absolute; top: 10px; right: 10px; z-index: 100;">
                                <button id="btnMusic" style="padding: 10px; border-radius: 5px; cursor: pointer; background: rgba(255,255,255,0.2); color: white; border: 1px solid white;">🎵 Music ON</button>
                                <input type="range" id="volRange" min="0" max="100" value="50" style="width: 80px; vertical-align: middle;">
                            </div>
                        </div>

                        <div class="lobby-bottom">
                            <button class="btn-jugar" id="btnJugarLobby">JUGAR</button>
                        </div>
                    </div>

                    <div class="modal-overlay" id="modalNiveles" style="opacity: 0; visibility: hidden;">
                        <div class="modal-menu">
                            <button class="btn-cerrar-modal" id="btnCerrarModal">✖</button>
                            <h2 class="modal-titulo">Elegí tu destino</h2>
                            
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
                            const elementos = {
                                'modalNiveles': document.getElementById('modalNiveles'),
                                'btnJugarLobby': document.getElementById('btnJugarLobby'),
                                'btnCerrarModal': document.getElementById('btnCerrarModal'),
                                'btnMusic': document.getElementById('btnMusic'),
                                'volRange': document.getElementById('volRange')
                            };

                            for (const [nombre, elemento] of Object.entries(elementos)) {
                                if (!elemento) {
                                    console.error(`¡ERROR! El elemento con ID "${nombre}" no se encuentra en el DOM.`);
                                    return;
                                }
                            }

                            const { modalNiveles: modal, btnJugarLobby: btnJugar, btnCerrarModal: btnCerrar, btnMusic, volRange } = elementos;
                            const cartel = document.getElementById('cartelAviso');
                            const botonesNivel = document.querySelectorAll('.btn-nivel');

                            btnJugar.addEventListener('click', () => {
                                gsap.to(modal, { duration: 0.2, autoAlpha: 1, ease: "power2.out" });
                                gsap.fromTo(".modal-menu",
                                    { scale: 0.5, y: 50 },
                                    { duration: 0.4, scale: 1, y: 0, ease: "back.out(1.5)" }
                                );
                            });

                            btnMusic.addEventListener('click', () => {
                                const playing = window.audioManager.togglePlay();
                                btnMusic.innerText = playing ? "🎵 Music ON" : "🔇 Music OFF";
                            });

                            volRange.addEventListener('input', (e) => {
                                window.audioManager.setVolume(e.target.value);
                            });

                            btnCerrar.addEventListener('click', () => {
                                gsap.to(modal, { duration: 0.3, autoAlpha: 0, ease: "power2.in" });
                            });

                            botonesNivel.forEach(btn => {
                                btn.addEventListener('click', (e) => {
                                    const idDestino = Number(e.target.getAttribute('data-id'));

                                    if (idDestino === 4) {
                                        if (cartel) { // Validamos que el cartel exista por seguridad
                                            gsap.to(cartel, { duration: 0.3, autoAlpha: 1, y: 20, ease: "back.out(2)" });
                                            gsap.to(cartel, { duration: 0.3, autoAlpha: 0, y: 0, delay: 2 });
                                        }
                                        return;
                                    }

                                    gsap.to(modal, { duration: 0.2, autoAlpha: 0 });
                                    alSeleccionarNivel(idDestino, 'kitty');
                                });
                            });

                        }, 0); // 🔥 2. ACÁ CERRAMOS EL SETTIMEOUT CORRECTAMENTE

                        return null; // 🔥 3. Y ACÁ TERMINA LA FUNCIÓN INIT
                    }
                };
            case "grum":
                return {
                    template: `
                        <div class="slide active" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #1a1a2e;">
                            <h2 style="color: #ffb7c5; margin-bottom: 10px;">${datosNivel.title}</h2>
                            <canvas id="clubCanvas" width="800" height="600" style="background: #16213e; border: 4px solid #d11a5b; border-radius: 12px; box-shadow: 0 0 20px rgba(209,26,91,0.3);"></canvas>
                            <p style="color: white; margin-top: 15px; font-weight: bold;">Usa W A S D o las Flechas para moverte</p>
                        </div>`,
                    init: () => {
                        const canvasEl = document.getElementById('clubCanvas');
                        // Instanciamos el nuevo motor pasándole el canvas y la config
                        const engine = new Nivel_1(canvasEl, datosNivel, alTerminarNivel);
                        engine.start();
                        return engine; // Devolvemos el motor para que el Orquestador lo pueda destruir después
                    }
                };
            default:
                console.error(`La Fábrica no sabe cómo construir el juego: ${tipo}`);
                return null;
        }
    }
}
import { Nivel_1 } from '../Niveles/Nivel_1.js';

export class GameFactory {
    static build(tipo, datosNivel, alTerminarNivel, alSeleccionarNivel) {

        switch (tipo) {
            case "lobby":
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
                            const elementos = {
                                'modalNiveles': document.getElementById('modalNiveles'),
                                'btnHistoriaLobby': document.getElementById('btnHistoriaLobby'),
                                'btnPuzzleLobby': document.getElementById('btnPuzzleLobby'),
                                'btnCerrarModal': document.getElementById('btnCerrarModal'),
                                'btnMusic': document.getElementById('btnMusic'),
                                'volRange': document.getElementById('volRange'),
                                'avatarDiv': document.getElementById('jugadorAvatar'),
                                'btnCambiarAvatar': document.getElementById('btnCambiarAvatar')
                            };

                            for (const [nombre, elemento] of Object.entries(elementos)) {
                                if (!elemento) return;
                            }

                            const {
                                modalNiveles: modal, btnHistoriaLobby: btnJugar,
                                btnPuzzleLobby: btnPuzzle, btnCerrarModal: btnCerrar,
                                btnMusic, volRange, avatarDiv, btnCambiarAvatar
                            } = elementos;

                            const cartel = document.getElementById('cartelAviso');
                            const botonesNivel = document.querySelectorAll('.btn-nivel');

                            // LÓGICA DE AVATAR (Sin LocalStorage)
                            if (avatarDiv && btnCambiarAvatar) {
                                const catalogoAvatares = ['daniel-oficial-avatar', 'kitty-oficial-avatar'];
                                let avatarActual = 'daniel-oficial-avatar'; // Siempre empieza en Daniel
                                avatarDiv.className = avatarActual;

                                btnCambiarAvatar.addEventListener('click', () => {
                                    let indiceActual = catalogoAvatares.indexOf(avatarActual);
                                    indiceActual = (indiceActual + 1) % catalogoAvatares.length;
                                    avatarActual = catalogoAvatares[indiceActual];

                                    avatarDiv.className = avatarActual;
                                    gsap.fromTo(avatarDiv, { scale: 0.8, rotation: -10 }, { duration: 0.4, scale: 1, rotation: 0, ease: "back.out(1.5)" });
                                });
                            }

                            btnJugar.addEventListener('click', () => {
                                gsap.to(modal, { duration: 0.2, autoAlpha: 1, ease: "power2.out" });
                                gsap.fromTo(".modal-menu", { scale: 0.5, y: 50 }, { duration: 0.4, scale: 1, y: 0, ease: "back.out(1.5)" });
                            });

                            btnPuzzle.addEventListener('click', () => {
                                gsap.to(".lobby-pantalla", { duration: 0.5, opacity: 0 });
                            });

                            btnMusic.addEventListener('click', () => {
                                if (window.audioManager) {
                                    const playing = window.audioManager.togglePlay();
                                    btnMusic.innerText = playing ? "🎵 Music ON" : "🔇 Music OFF";
                                }
                            });

                            if (window.audioManager) {
                                volRange.addEventListener('input', (e) => window.audioManager.setVolume(e.target.value));
                            }

                            btnCerrar.addEventListener('click', () => gsap.to(modal, { duration: 0.3, autoAlpha: 0, ease: "power2.in" }));

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
                                    alSeleccionarNivel(idDestino);
                                });
                            });

                        }, 0);
                        return null;
                    }
                };

            case "Nivel_1":
                return {
                    template: `
                        <div class="slide active" style="position: relative; width: 100vw; height: 100vh; background: #1a1a2e; overflow: hidden;">
                            
                            <canvas id="clubCanvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #16213e; z-index: 1;"></canvas>
                            
                            <h2 style="position: absolute; top: 20px; width: 100%; text-align: center; color: #ffb7c5; margin: 0; z-index: 10; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); pointer-events: none;">
                                ${datosNivel.title}
                            </h2>
                            
                            <div id="mobileControls" style="display: flex; width: 100%; justify-content: space-between; padding: 30px; position: absolute; bottom: 0; box-sizing: border-box; z-index: 10; touch-action: none;">
                                <div style="display: grid; grid-template-columns: 60px 60px 60px; grid-gap: 5px;">
                                    <div></div>
                                    <button id="btnW" style="height: 60px; background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; backdrop-filter: blur(4px);">W</button>
                                    <div></div>
                                    <button id="btnA" style="height: 60px; background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; backdrop-filter: blur(4px);">A</button>
                                    <button id="btnS" style="height: 60px; background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; backdrop-filter: blur(4px);">S</button>
                                    <button id="btnD" style="height: 60px; background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; backdrop-filter: blur(4px);">D</button>
                                </div>
                                <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; gap: 10px;">
                                    <button id="btnShift" style="width: 80px; height: 50px; background: rgba(241,196,15,0.6); border: 2px solid #f1c40f; border-radius: 12px; color: white; font-weight: bold; backdrop-filter: blur(4px);">TURBO</button>
                                    <button id="btnSpace" style="width: 80px; height: 80px; background: rgba(52,152,219,0.6); border: 2px solid #3498db; border-radius: 50%; color: white; font-weight: bold; backdrop-filter: blur(4px);">DISPARO</button>
                                </div>
                            </div>

                            <div id="menuPausa" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(20, 18, 31, 0.85); z-index: 100; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(6px);">
                                <h2 style="color: #ffffff; font-size: 3rem; margin-bottom: 40px; text-shadow: 0 0 15px #d11a5b; font-family: sans-serif;">JUEGO PAUSADO</h2>
                                
                                <button id="btnContinuar" style="margin-bottom: 20px; padding: 15px 40px; font-size: 1.2rem; font-weight: bold; color: white; background: transparent; border: 3px solid #3498db; border-radius: 12px; cursor: pointer; transition: 0.2s; text-transform: uppercase;">
                                    ▶ Continuar
                                </button>
                                
                                <button id="btnSalirLobby" style="padding: 15px 40px; font-size: 1.2rem; font-weight: bold; color: white; background: #d11a5b; border: none; border-radius: 12px; cursor: pointer; transition: 0.2s; text-transform: uppercase; box-shadow: 0 4px 15px rgba(209, 26, 91, 0.4);">
                                    ✖ Volver al Lobby
                                </button>
                            </div>

                        </div>`,
                    init: () => {
                        const canvasEl = document.getElementById('clubCanvas');
                        const engine = new Nivel_1(canvasEl, datosNivel, alTerminarNivel);

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

                        conectarBotonMovil('btnW', 'w'); conectarBotonMovil('btnS', 's');
                        conectarBotonMovil('btnA', 'a'); conectarBotonMovil('btnD', 'd');

                        const btnSpace = document.getElementById('btnSpace');
                        const btnShift = document.getElementById('btnShift');
                        if (btnSpace) { btnSpace.addEventListener('touchstart', (e) => { e.preventDefault(); engine.disparar(); }); btnSpace.addEventListener('mousedown', () => engine.disparar()); }
                        if (btnShift) { btnShift.addEventListener('touchstart', (e) => { e.preventDefault(); engine.activarTurbo(); }); btnShift.addEventListener('mousedown', () => engine.activarTurbo()); }

                        const btnContinuar = document.getElementById('btnContinuar');
                        const btnSalirLobby = document.getElementById('btnSalirLobby');

                        if (btnContinuar) {
                            btnContinuar.addEventListener('click', () => {
                                engine.togglePause(); 
                            });
                        }

                        if (btnSalirLobby) {
                            btnSalirLobby.addEventListener('click', () => {
                                window.orquestador.transitionTo(1);
                            });
                        }

                        return engine;
                    }
                };

            default:
                console.error(`La Fábrica no sabe cómo construir el juego: ${tipo}`);
                return null;
        }
    }
}
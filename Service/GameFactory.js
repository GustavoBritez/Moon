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

                            <div class="lobby-recursos" style="display: flex; gap: 15px; align-items: center;">
                                <div class="recurso-item"><div class="recurso-circulo">☁️</div><span class="recurso-cantidad" id="txtLobbyNubes">150</span></div>
                                <div class="recurso-item"><div class="recurso-circulo">☕</div><span class="recurso-cantidad" id="txtLobbyCafe">5</span></div>
                                <button id="btnInventarioLobby" style="background: #ffd700; border: none; border-radius: 12px; font-size: 1.5rem; width: 45px; height: 45px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: transform 0.1s; display: flex; align-items: center; justify-content: center; z-index: 10;">📦</button>
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

                    <div class="modal-overlay" id="modalInventarioTienda" style="opacity: 0; visibility: hidden; z-index: 1001; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(20, 18, 31, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;">
                        <div class="modal-menu" style="width: 450px; max-height: 85vh; overflow-y: auto; background: #211933; border: 4px solid #ff6584; border-radius: 28px; padding: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.6); position: relative; display: flex; flex-direction: column; gap: 15px; color: white;">
                            <button class="btn-cerrar-modal" id="btnCerrarInventario" style="position: absolute; top: 12px; right: 15px; background: none; border: none; color: #ff6584; font-size: 1.5rem; cursor: pointer; z-index: 1020;">✖</button>
                            
                            <!-- Pestañas -->
                            <div style="display: flex; gap: 10px; margin-bottom: 10px; margin-right: 35px;">
                                <button id="tabInventario" style="flex: 1; padding: 10px; font-weight: bold; background: #ff6584; color: white; border: none; border-radius: 12px; cursor: pointer;">🎒 Inventario</button>
                                <button id="tabTienda" style="flex: 1; padding: 10px; font-weight: bold; background: rgba(255,255,255,0.1); color: #ffb7c5; border: 2px solid #ff6584; border-radius: 12px; cursor: pointer;">🏪 Tienda</button>
                            </div>

                            <!-- Contenido pestaña Inventario -->
                            <div id="contentInventario" style="display: flex; flex-direction: column; gap: 15px;">
                                <h3 style="color: #ffb7c5; margin: 0; text-align: center; font-size: 1.1rem;">Slots Activos (Equipa tus consumibles/armas)</h3>
                                <div style="display: flex; justify-content: space-between; gap: 5px;" id="lobbySlotsContainer">
                                    <!-- Se genera por JS -->
                                </div>

                                <h3 style="color: #ffb7c5; margin: 10px 0 0 0; text-align: center; font-size: 1.1rem;">Mochila (Haz clic para equipar)</h3>
                                <div id="lobbyMochilaContainer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <!-- Se genera por JS -->
                                </div>
                            </div>

                            <!-- Contenido pestaña Tienda -->
                            <div id="contentTienda" style="display: none; flex-direction: column; gap: 15px;">
                                <h3 style="color: #ffb7c5; margin: 0; text-align: center; font-size: 1.1rem;">Comprar con Café (☕ <span id="shopCafeSaldo">0</span>)</h3>
                                <div style="display: flex; flex-direction: column; gap: 10px;" id="shopItemsContainer">
                                    <!-- Se genera por JS -->
                                </div>
                            </div>
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

                            // --- LÓGICA DE INVENTARIO Y TIENDA ---
                            const txtNubes = document.getElementById('txtLobbyNubes');
                            const txtCafe = document.getElementById('txtLobbyCafe');
                            if (txtNubes) txtNubes.innerText = window.playerState.nubes;
                            if (txtCafe) txtCafe.innerText = window.playerState.cafe;

                            const modalInv = document.getElementById('modalInventarioTienda');
                            const btnInv = document.getElementById('btnInventarioLobby');
                            const btnCerrarInv = document.getElementById('btnCerrarInventario');
                            const tabInv = document.getElementById('tabInventario');
                            const tabTnd = document.getElementById('tabTienda');
                            const contentInv = document.getElementById('contentInventario');
                            const contentTnd = document.getElementById('contentTienda');

                            if (tabInv && tabTnd && contentInv && contentTnd) {
                                tabInv.addEventListener('click', () => {
                                    tabInv.style.background = '#ff6584';
                                    tabInv.style.color = 'white';
                                    tabTnd.style.background = 'rgba(255,255,255,0.1)';
                                    tabTnd.style.color = '#ffb7c5';
                                    contentInv.style.display = 'flex';
                                    contentTnd.style.display = 'none';
                                    renderLobbyInventario();
                                });
                                tabTnd.addEventListener('click', () => {
                                    tabTnd.style.background = '#ff6584';
                                    tabTnd.style.color = 'white';
                                    tabInv.style.background = 'rgba(255,255,255,0.1)';
                                    tabInv.style.color = '#ffb7c5';
                                    contentInv.style.display = 'none';
                                    contentTnd.style.display = 'flex';
                                    renderLobbyTienda();
                                });
                            }

                            if (btnInv && modalInv && btnCerrarInv) {
                                btnInv.addEventListener('click', () => {
                                    renderLobbyInventario();
                                    gsap.to(modalInv, { duration: 0.2, autoAlpha: 1, ease: "power2.out" });
                                });
                                btnCerrarInv.addEventListener('click', () => {
                                    gsap.to(modalInv, { duration: 0.2, autoAlpha: 0, ease: "power2.in" });
                                });
                            }

                            function renderLobbyInventario() {
                                const slotsContainer = document.getElementById('lobbySlotsContainer');
                                const mochilaContainer = document.getElementById('lobbyMochilaContainer');
                                if (!slotsContainer || !mochilaContainer) return;

                                let slotsHtml = '';
                                const nombresDisplay = {
                                    "arma_basica": "🔫 Básica",
                                    "arma_doble": "雙 Doble",
                                    "arma_rebotadora": "🪃 Rebote",
                                    "botiquin": "🧪 Botiquín",
                                    "escudo": "🛡️ Escudo"
                                };

                                for (let i = 0; i < 5; i++) {
                                    const item = window.playerState.slots[i];
                                    const esPrimero = i === 0;
                                    const border = esPrimero ? 'border: 2px dashed #ffd700;' : 'border: 2px solid #ff6584;';
                                    const bg = item ? 'background: rgba(255, 101, 132, 0.15);' : 'background: rgba(0,0,0,0.2);';
                                    const cursor = esPrimero ? 'cursor: not-allowed;' : 'cursor: pointer;';
                                    const label = item ? nombresDisplay[item] : 'Vacío';

                                    let countLabel = '';
                                    if (esPrimero) countLabel = ' (∞)';
                                    else if (item === 'botiquin') countLabel = ` (x${window.playerState.inventario.botiquin})`;
                                    else if (item === 'escudo') countLabel = ` (x${window.playerState.inventario.escudo})`;
                                    else if (item === 'arma_doble') countLabel = ` (${window.playerState.balas.arma_doble})`;
                                    else if (item === 'arma_rebotadora') countLabel = ` (${window.playerState.balas.arma_rebotadora})`;

                                    slotsHtml += `
                                        <div style="flex: 1; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; ${border} ${bg} ${cursor} color: white; font-size: 0.7rem; text-align: center; overflow: hidden; padding: 2px;" onclick="desequiparSlot(${i})">
                                            <span style="font-weight: bold; color: #ff6584; font-size: 0.65rem;">Slot ${i+1}</span>
                                            <span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 100%;">${label}${countLabel}</span>
                                        </div>
                                    `;
                                }
                                slotsContainer.innerHTML = slotsHtml;

                                let mochilaHtml = '';
                                const itemsDisponibles = [
                                    { key: "arma_doble", label: "雙 Arma Doble", count: window.playerState.inventario.arma_doble > 0 ? 1 : 0, desc: `${window.playerState.balas.arma_doble} balas` },
                                    { key: "arma_rebotadora", label: "🪃 Arma Rebotadora", count: window.playerState.inventario.arma_rebotadora > 0 ? 1 : 0, desc: `${window.playerState.balas.arma_rebotadora} balas` },
                                    { key: "botiquin", label: "🧪 Botiquín", count: window.playerState.inventario.botiquin, desc: "Cura 50 HP (Máx. 5)" },
                                    { key: "escudo", label: "🛡️ Escudo", count: window.playerState.inventario.escudo, desc: "Inmune 3s (Máx. 5)" }
                                ];

                                for (const it of itemsDisponibles) {
                                    if (it.count > 0) {
                                        mochilaHtml += `
                                            <div style="padding: 8px; background: rgba(255,255,255,0.05); border: 2px solid #5c4e75; border-radius: 12px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: background 0.2s;" onclick="equiparEnSlotLibre('${it.key}')" onmouseover="this.style.background='rgba(255,101,132,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                                                <span style="font-weight: bold; color: #ffb7c5; font-size: 0.85rem;">${it.label}</span>
                                                <span style="font-size: 0.7rem; color: #ddd;">Stock: ${it.count}</span>
                                                <span style="font-size: 0.65rem; color: #ff6584; font-weight: bold; margin-top: 2px;">${it.desc}</span>
                                            </div>
                                        `;
                                    }
                                }

                                if (mochilaHtml === '') {
                                    mochilaHtml = `<div style="grid-column: span 2; text-align: center; color: #aaa; padding: 15px; font-size: 0.85rem;">Tu mochila está vacía. Compra artículos en la tienda.</div>`;
                                }
                                mochilaContainer.innerHTML = mochilaHtml;
                            }

                            window.equiparEnSlotLibre = (key) => {
                                if (key.startsWith('arma') && window.playerState.slots.includes(key)) {
                                    alert("Esta arma ya está equipada en un slot.");
                                    return;
                                }

                                let indexLibre = -1;
                                for (let i = 1; i < 5; i++) {
                                    if (window.playerState.slots[i] === null) {
                                        indexLibre = i;
                                        break;
                                    }
                                }

                                if (indexLibre !== -1) {
                                    window.playerState.slots[indexLibre] = key;
                                    renderLobbyInventario();
                                } else {
                                    alert("Todos los slots están ocupados. Desequipa uno haciendo clic sobre él.");
                                }
                            };

                            window.desequiparSlot = (index) => {
                                if (index === 0) return;
                                window.playerState.slots[index] = null;
                                renderLobbyInventario();
                            };

                            function renderLobbyTienda() {
                                const shopContainer = document.getElementById('shopItemsContainer');
                                const shopCafeSaldo = document.getElementById('shopCafeSaldo');
                                if (!shopContainer || !shopCafeSaldo) return;

                                shopCafeSaldo.innerText = window.playerState.cafe;

                                const catalogoTienda = [
                                    { key: "arma_doble", label: "雙 Arma Doble", costo: 5, entrega: "+100 Balas", desc: "Disparo doble rápido (0.10s, Daño: 10)" },
                                    { key: "arma_rebotadora", label: "🪃 Arma Rebotadora", costo: 5, entrega: "+50 Balas", desc: "Rebota en paredes (0.15s, Daño: 40)" },
                                    { key: "botiquin", label: "🧪 Botiquín", costo: 10, entrega: "+1 Botiquín", desc: "Cura 50 de vida al usarse" },
                                    { key: "escudo", label: "🛡️ Escudo", costo: 10, entrega: "+1 Escudo", desc: "Inmune por 3 segundos" }
                                ];

                                let shopHtml = '';
                                for (const prod of catalogoTienda) {
                                    shopHtml += `
                                        <div style="padding: 10px; background: rgba(0,0,0,0.2); border: 2px solid #5c4e75; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.85rem;">
                                            <div style="display: flex; flex-direction: column;">
                                                <span style="font-weight: bold; color: #ffb7c5; font-size: 0.9rem;">${prod.label} <span style="font-size: 0.75rem; color: #ffd700;">(${prod.entrega})</span></span>
                                                <span style="font-size: 0.7rem; color: #aaa; margin-top: 1px;">${prod.desc}</span>
                                            </div>
                                            <button onclick="comprarArticulo('${prod.key}', ${prod.costo})" style="background: #ffd700; color: #14121f; border: none; padding: 6px 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: transform 0.1s; display: flex; align-items: center; gap: 4px; font-size: 0.8rem;">
                                                ☕ ${prod.costo}
                                            </button>
                                        </div>
                                    `;
                                }
                                shopContainer.innerHTML = shopHtml;
                            }

                            window.comprarArticulo = (key, costo) => {
                                if (window.playerState.cafe < costo) {
                                    alert("No tienes suficiente café ☕.");
                                    return;
                                }

                                if (key === 'botiquin') {
                                    if (window.playerState.inventario.botiquin >= 5) {
                                        alert("Límite de 5 botiquines alcanzado.");
                                        return;
                                    }
                                    window.playerState.inventario.botiquin++;
                                } else if (key === 'escudo') {
                                    if (window.playerState.inventario.escudo >= 5) {
                                        alert("Límite de 5 escudos alcanzado.");
                                        return;
                                    }
                                    window.playerState.inventario.escudo++;
                                } else if (key === 'arma_doble') {
                                    window.playerState.inventario.arma_doble = 1;
                                    window.playerState.balas.arma_doble += 100;
                                } else if (key === 'arma_rebotadora') {
                                    window.playerState.inventario.arma_rebotadora = 1;
                                    window.playerState.balas.arma_rebotadora += 50;
                                }

                                window.playerState.cafe -= costo;
                                txtCafe.innerText = window.playerState.cafe;
                                renderLobbyTienda();
                                alert("¡Comprado con éxito!");
                            };

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
                            
                            <div id="mobileControls" style="display: flex; width: 100%; justify-content: space-between; padding: 30px; position: absolute; bottom: 0; box-sizing: border-box; z-index: 10; touch-action: none; pointer-events: none;">
                                <!-- Joystick WASD -->
                                <div style="display: grid; grid-template-columns: 60px 60px 60px; grid-gap: 5px;">
                                    <div></div>
                                    <button id="btnW" style="height: 60px; background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; backdrop-filter: blur(4px); pointer-events: auto;">W</button>
                                    <div></div>
                                    <button id="btnA" style="height: 60px; background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; backdrop-filter: blur(4px); pointer-events: auto;">A</button>
                                    <button id="btnS" style="height: 60px; background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; backdrop-filter: blur(4px); pointer-events: auto;">S</button>
                                    <button id="btnD" style="height: 60px; background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.5); border-radius: 10px; color: white; font-weight: bold; font-size: 20px; backdrop-filter: blur(4px); pointer-events: auto;">D</button>
                                </div>
                                
                                <!-- Botones de Acción -->
                                <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; gap: 10px;">
                                    <button id="btnShift" style="width: 80px; height: 50px; background: rgba(241,196,15,0.6); border: 2px solid #f1c40f; border-radius: 12px; color: white; font-weight: bold; backdrop-filter: blur(4px); pointer-events: auto;">TURBO</button>
                                    <button id="btnSpace" style="width: 80px; height: 80px; background: rgba(52,152,219,0.6); border: 2px solid #3498db; border-radius: 50%; color: white; font-weight: bold; backdrop-filter: blur(4px); pointer-events: auto;">DISPARO</button>
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
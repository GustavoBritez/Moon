import { Nivel_1 } from '../Niveles/Nivel_1.js';

export class GameFactory {
    static build(tipo, datosNivel, alTerminarNivel, alSeleccionarNivel) {

        switch (tipo) {
            case "lobby":
                let menuHtml = `
                    <div class="lobby-pantalla">
                        <div class="lobby-top">
                            <div class="avatar-marco" style="width: 150px; height: 150px; margin-bottom: 0; position: relative; border-color: #d69e2e;">
                                <div id="jugadorAvatar" class="knight-oficial-avatar" style="width: 110px; height: 110px;"></div>
                                <button id="btnCambiarAvatar" style="position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); background: #742a2a; color: #f6e05e; border: 2px solid #d69e2e; border-radius: 20px; padding: 4px 12px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.4); z-index: 10;">
                                    🔄 Clase
                                </button>
                            </div>

                            <div class="lobby-recursos" style="display: flex; gap: 15px; align-items: center;">
                                <!-- Barra de XP del Lobby -->
                                <div id="lobbyXpBarContainer" style="display: flex; flex-direction: column; gap: 5px; width: 180px; background: rgba(20, 18, 31, 0.85); padding: 8px 12px; border-radius: 12px; border: 2px solid #00d2ff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); color: white; margin-right: 15px;">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: bold;">
                                        <span style="color: #00d2ff;">LVL <span id="txtLobbyLvl">1</span></span>
                                        <span style="font-family: monospace;" id="txtLobbyXpVal">0.00 / 2.00 XP</span>
                                    </div>
                                    <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.15); border-radius: 4px; overflow: hidden; border: 1px solid rgba(0,210,255,0.3);">
                                        <div id="barLobbyXpFill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #0052d4, #4364f7, #6fb1fc); transition: width 0.3s;"></div>
                                    </div>
                                </div>

                                <div class="recurso-item"><div class="recurso-circulo">🪙</div><span class="recurso-cantidad" id="txtLobbyMonedas">150</span></div>
                                <div class="recurso-item"><div class="recurso-circulo">💎</div><span class="recurso-cantidad" id="txtLobbyGemas">5</span></div>
                                <div id="lobbyOnlineWidget" style="background: rgba(20, 18, 31, 0.85); padding: 8px 14px; border-radius: 12px; border: 2px solid #2ecc71; color: white; display: flex; align-items: center; gap: 6px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.4); font-size: 0.9rem;">
                                    <span style="color: #2ecc71; font-size: 1rem; text-shadow: 0 0 8px #2ecc71;">🟢</span> ONLINE: <span id="txtLobbyOnline" style="color: #2ecc71; font-size: 1rem;">1</span>
                                </div>
                                <button id="btnInventarioLobby" style="background: #d69e2e; color: #1a202c; border: none; border-radius: 12px; font-size: 1.5rem; width: 45px; height: 45px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.4); transition: transform 0.1s; display: flex; align-items: center; justify-content: center; z-index: 10;">🎒</button>
                            </div>
                            
                            <div id="audio-container" style="position: absolute; bottom: 20px; right: 20px; z-index: 100; display: flex; align-items: center; gap: 10px; background: rgba(30, 27, 41, 0.85); padding: 10px 15px; border-radius: 16px; backdrop-filter: blur(5px); border: 2px solid #d69e2e; box-shadow: 0 4px 10px rgba(0,0,0,0.4); font-weight: bold; color: #f6e05e;">
                                <button id="btnMusic" style="background: none; border: none; font-weight: bold; color: #f6e05e; cursor: pointer; font-size: 1rem;">🎵 Music ON</button>
                                <input type="range" id="volRange" min="0" max="100" value="50" style="width: 80px; cursor: pointer;">
                            </div>
                        </div>

                        <div class="lobby-bottom" style="display: flex; gap: 15px; justify-content: center;">
                            <button class="btn-historia" id="btnHistoriaLobby"> Mazmorras </button>
                            <button class="btn-puzzle" id="btnPuzzleLobby"> Desafío </button>
                            <button class="btn-editor" id="btnEditorLobby" onclick="window.open('./editor.html', '_blank')"> 🛠️ Editor </button>
                        </div>
                    </div>

                    <div class="modal-overlay" id="modalNiveles" style="opacity: 0; visibility: hidden;">
                        <div class="modal-menu">
                            <button class="btn-cerrar-modal" id="btnCerrarModal">✖</button>
                            <h2 class="modal-titulo" style="color: #f6e05e;"> ¿A qué calabozo entraremos hoy? </h2>
                            
                            <button class="btn-nivel" data-id="2">Mazmorra del Inframundo</button>
                            <button class="btn-nivel" data-id="3" style="opacity: 0.5;">Nivel 2: La Arena</button>
                            <button class="btn-nivel" data-id="4" style="opacity: 0.5;">Nivel 3: El Templo</button>
                        </div>
                    </div>

                    <div class="modal-overlay" id="modalInventarioTienda" style="opacity: 0; visibility: hidden; z-index: 1001; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 12, 22, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;">
                        <div class="modal-menu" style="width: 450px; max-height: 85vh; overflow-y: auto; background: #1e1b29; border: 4px solid #d69e2e; border-radius: 28px; padding: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.8); position: relative; display: flex; flex-direction: column; gap: 15px; color: white;">
                            <button class="btn-cerrar-modal" id="btnCerrarInventario" style="position: absolute; top: 12px; right: 15px; background: none; border: none; color: #f6e05e; font-size: 1.5rem; cursor: pointer; z-index: 1020;">✖</button>
                            
                            <!-- Pestañas -->
                            <div style="display: flex; gap: 10px; margin-bottom: 10px; margin-right: 35px;">
                                <button id="tabInventario" style="flex: 1; padding: 10px; font-weight: bold; background: #742a2a; color: #f6e05e; border: none; border-radius: 12px; cursor: pointer;">🎒 Inventario</button>
                                <button id="tabTienda" style="flex: 1; padding: 10px; font-weight: bold; background: rgba(255,255,255,0.05); color: #f6e05e; border: 2px solid #d69e2e; border-radius: 12px; cursor: pointer;">🏪 Tienda</button>
                            </div>

                            <!-- Contenido pestaña Inventario -->
                            <div id="contentInventario" style="display: flex; flex-direction: column; gap: 12px;">
                                <h3 style="color: #f6e05e; margin: 0; text-align: center; font-size: 1.1rem;">Slots Activos (Equipa consumibles/armas)</h3>
                                <div style="display: flex; justify-content: space-between; gap: 5px;" id="lobbySlotsContainer">
                                    <!-- Se genera por JS -->
                                </div>

                                <h3 style="color: #f6e05e; margin: 5px 0 0 0; text-align: center; font-size: 1.1rem;">Mochila (Haz clic para equipar)</h3>
                                <div id="lobbyMochilaContainer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                    <!-- Se genera por JS -->
                                </div>

                                <h3 style="color: #f6e05e; margin: 5px 0 0 0; text-align: center; font-size: 1.1rem;">🔨 Taller de Reparación (Coste: 1🪙 x 1%)</h3>
                                <div id="lobbyTallerContainer" style="display: flex; flex-direction: column; gap: 6px;">
                                    <!-- Se genera por JS -->
                                </div>
                            </div>

                            <!-- Contenido pestaña Tienda -->
                            <div id="contentTienda" style="display: none; flex-direction: column; gap: 15px;">
                                <h3 style="color: #f6e05e; margin: 0; text-align: center; font-size: 1.1rem;">Comprar con Gemas (💎 <span id="shopGemasSaldo">0</span>)</h3>
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

                            // LÓGICA DE CLASES AVATAR (5 Clases)
                            if (avatarDiv && btnCambiarAvatar) {
                                const clases = [
                                    { id: 'knight', css: 'knight-oficial-avatar' },
                                    { id: 'mage', css: 'mage-oficial-avatar' },
                                    { id: 'archer', css: 'archer-oficial-avatar' },
                                    { id: 'shaman', css: 'shaman-oficial-avatar' },
                                    { id: 'summoner', css: 'summoner-oficial-avatar' }
                                ];
                                
                                let currentIndex = clases.findIndex(c => c.id === window.playerState.clase);
                                if (currentIndex === -1) currentIndex = 0;
                                
                                avatarDiv.className = clases[currentIndex].css;

                                btnCambiarAvatar.addEventListener('click', () => {
                                    currentIndex = (currentIndex + 1) % clases.length;
                                    const nuevaClase = clases[currentIndex];

                                    avatarDiv.className = nuevaClase.css;
                                    window.playerState.clase = nuevaClase.id;
                                    console.log(`Clase del jugador cambiada a: ${window.playerState.clase}`);

                                    if (typeof gsap !== 'undefined') {
                                        gsap.fromTo(avatarDiv, { scale: 0.8, rotation: -10 }, { duration: 0.4, scale: 1, rotation: 0, ease: "back.out(1.5)" });
                                    }
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
                            const txtMonedas = document.getElementById('txtLobbyMonedas');
                            const txtGemas = document.getElementById('txtLobbyGemas');
                            if (txtMonedas) txtMonedas.innerText = window.playerState.monedas;
                            if (txtGemas) txtGemas.innerText = window.playerState.gemas;

                            const txtLobbyLvl = document.getElementById('txtLobbyLvl');
                            const txtLobbyXpVal = document.getElementById('txtLobbyXpVal');
                            const barLobbyXpFill = document.getElementById('barLobbyXpFill');
                            if (txtLobbyLvl && txtLobbyXpVal && barLobbyXpFill) {
                                const lvl = window.playerState.nivel || 1;
                                const xp = window.playerState.xpActual || 0.0;
                                const req = Math.pow(2, lvl);
                                txtLobbyLvl.innerText = lvl;
                                txtLobbyXpVal.innerText = `${xp.toFixed(2)} / ${req.toFixed(2)} XP`;
                                barLobbyXpFill.style.width = `${Math.min(100, (xp / req) * 100)}%`;
                            }

                            // --- CONTADOR ONLINE EN TIEMPO REAL ---
                            const updateLobbyOnline = (cnt) => {
                                const el = document.getElementById('txtLobbyOnline');
                                if (el) el.innerText = cnt || (window.networkManagerInstance?.onlineCount || 1);
                            };
                            if (window.networkManagerInstance) {
                                window.networkManagerInstance.onOnlineCountChangeCallback = updateLobbyOnline;
                                updateLobbyOnline(window.networkManagerInstance.onlineCount);
                            }

                            const modalInv = document.getElementById('modalInventarioTienda');
                            const btnInv = document.getElementById('btnInventarioLobby');
                            const btnCerrarInv = document.getElementById('btnCerrarInventario');
                            const tabInv = document.getElementById('tabInventario');
                            const tabTnd = document.getElementById('tabTienda');
                            const contentInv = document.getElementById('contentInventario');
                            const contentTnd = document.getElementById('contentTienda');

                            if (tabInv && tabTnd && contentInv && contentTnd) {
                                tabInv.addEventListener('click', () => {
                                    tabInv.style.background = '#742a2a';
                                    tabInv.style.color = '#f6e05e';
                                    tabTnd.style.background = 'rgba(255,255,255,0.05)';
                                    tabTnd.style.color = '#f6e05e';
                                    contentInv.style.display = 'flex';
                                    contentTnd.style.display = 'none';
                                    renderLobbyInventario();
                                });
                                tabTnd.addEventListener('click', () => {
                                    tabTnd.style.background = '#742a2a';
                                    tabTnd.style.color = '#f6e05e';
                                    tabInv.style.background = 'rgba(255,255,255,0.05)';
                                    tabInv.style.color = '#f6e05e';
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
                                    "espada_basica": "🗡️ Espada",
                                    "daga_doble": "⚔️ Dagas",
                                    "martillo_rebote": "🔨 Martillo",
                                    "pocion_vida": "🧪 Poción",
                                    "escudo_hierro": "🛡️ Escudo"
                                };

                                for (let i = 0; i < 5; i++) {
                                    const item = window.playerState.slots[i];
                                    const esPrimero = i === 0;
                                    const border = esPrimero ? 'border: 2px dashed #ffd700;' : 'border: 2px solid #d69e2e;';
                                    const bg = item ? 'background: rgba(116, 42, 42, 0.25);' : 'background: rgba(0,0,0,0.4);';
                                    const cursor = esPrimero ? 'cursor: not-allowed;' : 'cursor: pointer;';
                                    const label = item ? nombresDisplay[item] : 'Vacío';

                                    let countLabel = '';
                                    if (esPrimero) {
                                        const dur = window.playerState.durabilidad.espada_basica || 100;
                                        countLabel = ` (${dur.toFixed(0)}%)`;
                                    }
                                    else if (item === 'pocion_vida') countLabel = ` (x${window.playerState.inventario.pocion_vida})`;
                                    else if (item === 'escudo_hierro') countLabel = ` (x${window.playerState.inventario.escudo_hierro})`;
                                    else if (item === 'daga_doble') {
                                        const dur = window.playerState.durabilidad.daga_doble || 100;
                                        countLabel = ` (${dur.toFixed(0)}%)`;
                                    }
                                    else if (item === 'martillo_rebote') {
                                        const dur = window.playerState.durabilidad.martillo_rebote || 100;
                                        countLabel = ` (${dur.toFixed(0)}%)`;
                                    }

                                    slotsHtml += `
                                        <div style="flex: 1; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; ${border} ${bg} ${cursor} color: white; font-size: 0.7rem; text-align: center; overflow: hidden; padding: 2px;" onclick="desequiparSlot(${i})">
                                            <span style="font-weight: bold; color: #f6e05e; font-size: 0.65rem;">Slot ${i+1}</span>
                                            <span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 100%;">${label}${countLabel}</span>
                                        </div>
                                    `;
                                }
                                slotsContainer.innerHTML = slotsHtml;

                                let mochilaHtml = '';
                                const itemsDisponibles = [
                                    { key: "daga_doble", label: "⚔️ Dagas Dobles", count: window.playerState.inventario.daga_doble > 0 ? 1 : 0, desc: `Mant: ${(window.playerState.durabilidad.daga_doble || 100).toFixed(0)}%` },
                                    { key: "martillo_rebote", label: "🔨 Martillo Trueno", count: window.playerState.inventario.martillo_rebote > 0 ? 1 : 0, desc: `Mant: ${(window.playerState.durabilidad.martillo_rebote || 100).toFixed(0)}%` },
                                    { key: "pocion_vida", label: "🧪 Poción Vida", count: window.playerState.inventario.pocion_vida, desc: "Cura 50 HP (Máx. 5)" },
                                    { key: "escudo_hierro", label: "🛡️ Escudo Hierro", count: window.playerState.inventario.escudo_hierro, desc: "Inmune 3s (Máx. 5)" }
                                ];

                                for (const it of itemsDisponibles) {
                                    if (it.count > 0) {
                                        mochilaHtml += `
                                            <div style="padding: 8px; background: rgba(0,0,0,0.3); border: 2px solid #d69e2e; border-radius: 12px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: background 0.2s;" onclick="equiparEnSlotLibre('${it.key}')" onmouseover="this.style.background='rgba(116,42,42,0.25)'" onmouseout="this.style.background='rgba(0,0,0,0.3)'">
                                                <span style="font-weight: bold; color: #f6e05e; font-size: 0.85rem;">${it.label}</span>
                                                <span style="font-size: 0.7rem; color: #ddd;">Stock: ${it.count}</span>
                                                <span style="font-size: 0.65rem; color: #f6e05e; font-weight: bold; margin-top: 2px;">${it.desc}</span>
                                            </div>
                                        `;
                                    }
                                }

                                if (mochilaHtml === '') {
                                    mochilaHtml = `<div style="grid-column: span 2; text-align: center; color: #aaa; padding: 15px; font-size: 0.85rem;">Tu mochila está vacía. Compra artículos en la tienda.</div>`;
                                }
                                mochilaContainer.innerHTML = mochilaHtml;

                                // RENDERIZAR TALLER DE REPARACIÓN
                                const tallerContainer = document.getElementById('lobbyTallerContainer');
                                if (tallerContainer) {
                                    let tallerHtml = '';
                                    const armasParaReparar = [
                                        { key: "espada_basica", label: "🗡️ Espada Básica" },
                                        { key: "daga_doble", label: "⚔️ Dagas Dobles", desbloqueada: window.playerState.inventario.daga_doble > 0 },
                                        { key: "martillo_rebote", label: "🔨 Martillo de Trueno", desbloqueada: window.playerState.inventario.martillo_rebote > 0 }
                                    ];

                                    for (const arma of armasParaReparar) {
                                        if (arma.key === "espada_basica" || arma.desbloqueada) {
                                            const dur = window.playerState.durabilidad[arma.key] || 100;
                                            const costo = Math.ceil(100 - dur);
                                            const disabled = costo === 0 ? 'disabled style="opacity: 0.5; background: #3e3b4e; color: #7f8c8d; cursor: not-allowed;"' : '';
                                            
                                            tallerHtml += `
                                                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid #d69e2e; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; color: white;">
                                                    <span style="font-weight: bold; color: #f6e05e;">${arma.label}</span>
                                                    <span style="color: ${dur < 50 ? '#ff4757' : '#2ed573'}; font-weight: bold; font-family: monospace;">${dur.toFixed(1)}%</span>
                                                    <button onclick="repararArma('${arma.key}', ${costo})" ${disabled} style="background: #d69e2e; color: #110e19; border: none; padding: 4px 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.75rem; transition: transform 0.1s;">
                                                        🔧 Reparar (🪙 ${costo})
                                                     </button>
                                                </div>
                                            `;
                                        }
                                    }
                                    tallerContainer.innerHTML = tallerHtml;
                                }
                            }

                            window.equiparEnSlotLibre = (key) => {
                                if (window.playerState.slots.includes(key)) {
                                    alert("Este objeto ya está equipado en un slot.");
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
                                const shopGemasSaldo = document.getElementById('shopGemasSaldo');
                                if (!shopContainer || !shopGemasSaldo) return;

                                shopGemasSaldo.innerText = window.playerState.gemas;

                                const catalogoTienda = [
                                    { key: "daga_doble", label: "⚔️ Dagas Dobles", costo: 5, entrega: "+100 Dagas", desc: "Ráfaga rápida (0.10s, Daño: 10)" },
                                    { key: "martillo_rebote", label: "🔨 Martillo Trueno", costo: 5, entrega: "+50 Golpes", desc: "Rebota en muros (0.15s, Daño: 40)" },
                                    { key: "pocion_vida", label: "🧪 Poción de Vida", costo: 10, entrega: "+1 Poción", desc: "Cura 50 de vida al usarse" },
                                    { key: "escudo_hierro", label: "🛡️ Escudo de Hierro", costo: 10, entrega: "+1 Escudo", desc: "Inmune por 3 segundos" }
                                ];

                                let shopHtml = '';
                                for (const prod of catalogoTienda) {
                                    shopHtml += `
                                        <div style="padding: 10px; background: rgba(0,0,0,0.4); border: 2px solid #d69e2e; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.85rem;">
                                            <div style="display: flex; flex-direction: column;">
                                                <span style="font-weight: bold; color: #f6e05e; font-size: 0.9rem;">${prod.label} <span style="font-size: 0.75rem; color: #ffd700;">(${prod.entrega})</span></span>
                                                <span style="font-size: 0.7rem; color: #aaa; margin-top: 1px;">${prod.desc}</span>
                                            </div>
                                            <button onclick="comprarArticulo('${prod.key}', ${prod.costo})" style="background: #d69e2e; color: #14121f; border: none; padding: 6px 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: transform 0.1s; display: flex; align-items: center; gap: 4px; font-size: 0.8rem;">
                                                💎 ${prod.costo}
                                            </button>
                                        </div>
                                    `;
                                }
                                shopContainer.innerHTML = shopHtml;
                            }

                            window.repararArma = (key, costo) => {
                                if (window.playerState.monedas < costo) {
                                    alert("No tienes suficientes monedas de oro 🪙.");
                                    return;
                                }
                                window.playerState.monedas -= costo;
                                window.playerState.durabilidad[key] = 100;
                                
                                // Actualizar saldo visual en el lobby
                                const txtMonedas = document.getElementById('txtLobbyMonedas');
                                if (txtMonedas) txtMonedas.innerText = window.playerState.monedas;
                                
                                renderLobbyInventario();
                                alert("¡Arma reparada con éxito!");
                            };

                            window.comprarArticulo = (key, costo) => {
                                if (window.playerState.gemas < costo) {
                                    alert("No tienes suficientes gemas 💎.");
                                    return;
                                }

                                if (key === 'pocion_vida') {
                                    if (window.playerState.inventario.pocion_vida >= 5) {
                                        alert("Límite de 5 pociones alcanzado.");
                                        return;
                                    }
                                    window.playerState.inventario.pocion_vida++;
                                } else if (key === 'escudo_hierro') {
                                    if (window.playerState.inventario.escudo_hierro >= 5) {
                                        alert("Límite de 5 escudos alcanzado.");
                                        return;
                                    }
                                    window.playerState.inventario.escudo_hierro++;
                                } else if (key === 'daga_doble') {
                                    if (window.playerState.inventario.daga_doble > 0) {
                                        alert("¡Ya posees las Dagas Dobles! Repáralas en el taller si están gastadas.");
                                        return;
                                    }
                                    window.playerState.inventario.daga_doble = 1;
                                    window.playerState.durabilidad.daga_doble = 100;
                                } else if (key === 'martillo_rebote') {
                                    if (window.playerState.inventario.martillo_rebote > 0) {
                                        alert("¡Ya posees el Martillo de Trueno! Repáralo en el taller si está gastado.");
                                        return;
                                    }
                                    window.playerState.inventario.martillo_rebote = 1;
                                    window.playerState.durabilidad.martillo_rebote = 100;
                                }

                                window.playerState.gemas -= costo;
                                shopGemasSaldo.innerText = window.playerState.gemas;
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
                                btn.addEventListener('touchstart', (e) => { e.preventDefault(); if (engine.inputManager) engine.inputManager.keys[tecla] = true; });
                                btn.addEventListener('touchend', (e) => { e.preventDefault(); if (engine.inputManager) engine.inputManager.keys[tecla] = false; });
                                btn.addEventListener('mousedown', () => { if (engine.inputManager) engine.inputManager.keys[tecla] = true; });
                                btn.addEventListener('mouseup', () => { if (engine.inputManager) engine.inputManager.keys[tecla] = false; });
                                btn.addEventListener('mouseleave', () => { if (engine.inputManager) engine.inputManager.keys[tecla] = false; });
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
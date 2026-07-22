export class NetworkManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.myId = null;
        this.onInitCallback = null;
        this.onPlayerJoinCallback = null;
        this.onPlayerLeaveCallback = null;
        this.onMoveCallback = null;
        this.onShootCallback = null;
        this.onStateSyncCallback = null;
        this.onEnemyHitCallback = null;
        this.onEnemySyncCallback = null;
        this.onRoomStateCallback = null;
        this.onBoxMoveCallback = null;
        this.onOnlineCountChangeCallback = null;
        this.onlineCount = 1;

        if (window.networkManagerInstance && window.networkManagerInstance.socket) {
            const state = window.networkManagerInstance.socket.readyState;
            if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
                console.log("📡 Reutilizando conexión de red activa...");
                return window.networkManagerInstance;
            }
        }
        window.networkManagerInstance = this;
        this.connect();
    }

    connect() {
        try {
            const host = window.location.host ? window.location.host : "localhost:5000";
            const wsUrl = `ws://${host}/ws/`;
            console.log(`📡 Conectando al servidor C# multijugador en ${wsUrl}...`);
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                this.isConnected = true;
                console.log("🟢 Conexión establecida con el servidor C#.");
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handlePacket(data);
                } catch (e) {
                    console.error("Error parseando paquete:", e);
                }
            };

            this.socket.onclose = () => {
                this.isConnected = false;
                console.log("🔴 Desconectado del servidor C#. Reintentando en 3s...");
                setTimeout(() => this.connect(), 3000);
            };

            this.socket.onerror = (err) => {
                console.warn("⚠️ WebSocket error (Servidor C# no disponible o apagado).");
            };
        } catch (e) {
            console.warn("No se pudo conectar al servidor C#.");
        }
    }

    handlePacket(packet) {
        if (packet.onlineCount !== undefined) {
            this.onlineCount = packet.onlineCount;
            if (this.onOnlineCountChangeCallback) this.onOnlineCountChangeCallback(this.onlineCount);
        }

        switch (packet.type) {
            case "INIT":
                this.myId = packet.id;
                console.log(`🎮 Asignado ID de Jugador: ${this.myId}`);
                if (this.onInitCallback) this.onInitCallback(packet);
                break;
            case "PLAYER_JOIN":
                if (this.onPlayerJoinCallback) this.onPlayerJoinCallback(packet);
                break;
            case "PLAYER_LEAVE":
                if (this.onPlayerLeaveCallback) this.onPlayerLeaveCallback(packet);
                break;
            case "MOVE":
                if (this.onMoveCallback) this.onMoveCallback(packet);
                break;
            case "SHOOT":
                if (this.onShootCallback) this.onShootCallback(packet);
                break;
            case "BOX_MOVE":
                if (this.onBoxMoveCallback) this.onBoxMoveCallback(packet);
                break;
            case "STATE_SYNC":
                if (this.onStateSyncCallback) this.onStateSyncCallback(packet);
                break;
            case "ENEMY_HIT_SYNC":
                if (this.onEnemyHitCallback) this.onEnemyHitCallback(packet);
                break;
            case "ENEMY_SYNC":
                if (this.onEnemySyncCallback) this.onEnemySyncCallback(packet);
                break;
            case "ROOM_STATE":
                if (this.onRoomStateCallback) this.onRoomStateCallback(packet);
                break;
        }
    }

    sendMove(x, y, angle, clase, hp) {
        if (!this.isConnected) return;
        this.send({
            type: "MOVE",
            x: x,
            y: y,
            angle: angle,
            clase: clase,
            hp: hp
        });
    }

    sendShoot(x, y, angle, weapon) {
        if (!this.isConnected) return;
        this.send({
            type: "SHOOT",
            x: x,
            y: y,
            angle: angle,
            weapon: weapon
        });
    }

    sendBoxMove(boxId, gridX, gridY) {
        if (!this.isConnected) return;
        this.send({
            type: "BOX_MOVE",
            boxId: boxId,
            gridX: gridX,
            gridY: gridY
        });
    }

    sendEnemyHit(targetId, damage = 0, currentHp = -1, isDead = false) {
        if (!this.isConnected) return;
        this.send({
            type: "ENEMY_HIT",
            targetId: String(targetId),
            damage: damage,
            hp: currentHp,
            isDead: isDead
        });
    }

    /**
     * Registra los enemigos de una sala en el servidor.
     * Solo el primer cliente que lo envía inicializa la sala.
     */
    sendRegisterEnemies(roomId, enemyConfigs) {
        if (!this.isConnected) return;
        console.log(`📋 Registrando ${enemyConfigs.length} enemigos en sala '${roomId}'`);
        this.send({
            type: "REGISTER_ENEMIES",
            roomId: roomId,
            enemyConfigs: enemyConfigs
        });
    }

    /**
     * Notifica al servidor que el jugador cambió de sala (cruzó un portal).
     */
    sendChangeRoom(roomId) {
        if (!this.isConnected) return;
        console.log(`🚪 Cambiando a sala: '${roomId}'`);
        this.send({
            type: "CHANGE_ROOM",
            roomId: roomId
        });
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    destroy() {
        if (this.socket) {
            try {
                this.socket.onclose = null;
                this.socket.close();
            } catch (e) {}
            this.socket = null;
        }
        this.isConnected = false;
        this.onInitCallback = null;
        this.onPlayerJoinCallback = null;
        this.onPlayerLeaveCallback = null;
        this.onMoveCallback = null;
        this.onShootCallback = null;
        this.onStateSyncCallback = null;
        this.onEnemyHitCallback = null;
        this.onEnemySyncCallback = null;
        this.onRoomStateCallback = null;
        this.onBoxMoveCallback = null;
        this.onOnlineCountChangeCallback = null;
    }
}

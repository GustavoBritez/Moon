export class InputManager {
    constructor() {
        // Estado del teclado físico
        this.keys = {};
        // Nuevo: Estado de los botones virtuales / joystick táctil
        this.mobileActions = {};

        // Bindings para poder remover los eventos después y evitar fugas de memoria
        this.handleKeyDown = (e) => this.onKeyDown(e);
        this.handleKeyUp = (e) => this.onKeyUp(e);

        // Escuchamos los eventos globales del teclado (PC)
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    // --- NUEVO: Interfaz para controles táctiles ---
    // La UI (Tus botones en pantalla) llamará a este método al tocar y soltar
    setMobileAction(actionName, isPressed) {
        this.mobileActions[actionName] = isPressed;
    }

    // El método abstracto que consulta el PlayerController
    isActionPressed(actionName) {
        let isKeyPressed = false;

        // 1. Verificamos si la acción se está disparando por teclado (PC)
        switch (actionName) {
            case 'MOVE_UP':
                isKeyPressed = this.keys['w'] || this.keys['arrowup'];
                break;
            case 'MOVE_DOWN':
                isKeyPressed = this.keys['s'] || this.keys['arrowdown'];
                break;
            case 'MOVE_LEFT':
                isKeyPressed = this.keys['a'] || this.keys['arrowleft'];
                break;
            case 'MOVE_RIGHT':
                isKeyPressed = this.keys['d'] || this.keys['arrowright'];
                break;
            case 'SHOOT':
                isKeyPressed = this.keys[' '];
                break;
            case 'TURBO':
                isKeyPressed = this.keys['shift'];
                break;
            case 'SKILL_1':
                isKeyPressed = this.keys['q'];
                break;
            case 'SKILL_2':
                isKeyPressed = this.keys['e'];
                break;
            case 'ULTIMATE':
                isKeyPressed = this.keys['r'];
                break;
        }

        // 2. Retornamos TRUE si el teclado lo presiona OR (||) si el móvil lo presiona
        return isKeyPressed || (this.mobileActions[actionName] === true);
    }

    // Método vital para tu arquitectura de Nivel_1
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.keys = {};
        this.mobileActions = {};
    }
}
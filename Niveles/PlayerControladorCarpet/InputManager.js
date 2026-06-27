export class InputManager {
    constructor() {
        this.keys = {};

        // Escuchamos los eventos globales del navegador automáticamente
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    // El método de tu diagrama que abstrae la tecla física de la acción lógica
    isActionPressed(actionName) {
        switch (actionName) {
            case 'MOVE_UP': return this.keys['w'];
            case 'MOVE_DOWN': return this.keys['s'];
            case 'MOVE_LEFT': return this.keys['a'];
            case 'MOVE_RIGHT': return this.keys['d'];
            case 'SHOOT': return this.keys[' ']; // Tecla Espacio
            case 'TURBO': return this.keys['shift'];
            default: return false;
        }
    }
}
export class Player {
    constructor(x, y, speed, vidas) {
        this.x = x;
        this.y = y;

        this.speed = speed;
        this.vidas = vidas;
        this.sprite = null;

        // Estado actual
        this.isDead = false;
    }
}
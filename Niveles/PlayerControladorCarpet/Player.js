export class Player {
    constructor(x, y, speed, vidaMaxima) {
        this.x = x;
        this.y = y;

        this.speed = speed;
        this.vidaMaxima = vidaMaxima;
        this.vidaActual = vidaMaxima;
        this.sprite = null;

        this.isDead = false;
        this.isShielded = false;
        this.shieldTimer = 0;
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
    }

    recibirDanio(cantidad) {
        if (this.isDead) return;
        if (this.isInvulnerable) return;
        if (this.isShielded) {
            console.log("¡Daño bloqueado por el escudo!");
            return;
        }
        this.vidaActual -= cantidad;
        if (this.vidaActual <= 0) {
            this.vidaActual = 0;
            this.isDead = true;
        } else {
            this.isInvulnerable = true;
            this.invulnerableTimer = 1.0; // 1 segundo de invulnerabilidad
        }
    }

    setSprite(grafico) {
        this.sprite = grafico;
        if (this.sprite.position && typeof this.sprite.position.set === 'function') {
            this.sprite.position.set(this.x, this.y);
        } else {
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }
    }

    actualizarPosicionVisual() {
        if (this.sprite) {
            if (this.sprite.position && typeof this.sprite.position.set === 'function') {
                this.sprite.position.set(this.x, this.y);
            } else {
                this.sprite.x = this.x;
                this.sprite.y = this.y;
            }
        }
    }
}
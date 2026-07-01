import { EnemigoBase, ENEMY_CLASSES, FireDecorator } from './EnemigoBase.js';
export class EnemyManager {
    constructor(capaEntidades, tileSize, configEnemigos) {
        this.capaEntidades = capaEntidades;
        this.tileSize = tileSize;
        this.configEnemigos = configEnemigos;

        this.enemies = [];
        this.pool = [];
    }

    update(dt, player, engineRef) {
        // Recorremos al revés para limpiar de forma segura
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemigo = this.enemies[i];

            if (enemigo.isDead) {
                // Sacamos del array principal y mandamos al pool para reutilizar
                this.enemies.splice(i, 1);
                this.pool.push(enemigo);

                // Ocultamos el sprite (¡NO lo destruimos!)
                if (enemigo.sprite) enemigo.sprite.visible = false;
                continue;
            }

            enemigo.update(dt, player, engineRef);
        }
    }

    fabricaDeEnemigos(data) {
        // 1. Instanciamos la clase que corresponda
        // Si es un Baku, instancia Baku. Si es Base, instancia EnemigoBase.
        const EnemyClass = ENEMY_CLASSES[data.type] || EnemigoBase;
        let enemigo = new EnemyClass(data, this.tileSize);

        // 2. Si el enemigo DEBE llevar decoración extra (ej: un Baku de fuego),
        // se la ponemos aquí, pero solo si es necesario.
        if (data.decoradores) {
            for (const dec of data.decoradores) {
                if (dec === 'FIRE') enemigo = new FireDecorator(enemigo);
            }
        }
        // 3. Posicionamiento (Independiente de qué clase sea)
        enemigo.x = data.gridX * this.tileSize + (this.tileSize / 2);
        enemigo.y = data.gridY * this.tileSize + (this.tileSize / 2);

        this.enemies.push(enemigo);
        return enemigo;
    }

    inicializar() {
        // Validación de seguridad para evitar errores si la config está vacía
        if (!this.configEnemigos || !Array.isArray(this.configEnemigos)) {
            console.warn("EnemyManager: No se encontraron configuraciones de enemigos para inicializar.");
            return;
        }

        for (const data of this.configEnemigos) {
            const nuevoEnemigo = this.fabricaDeEnemigos(data);
            this.enemies.push(nuevoEnemigo);
        }

        console.log(`EnemyManager: Inicializados ${this.enemies.length} enemigos.`);
    }

    destroy() {
        for (const enemigo of this.enemies) {
            if (enemigo.sprite) enemigo.sprite.destroy();
        }
        this.enemies = [];
        this.pool = [];
    }
}

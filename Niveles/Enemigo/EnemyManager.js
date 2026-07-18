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
        const EnemyClass = ENEMY_CLASSES[data.type] || EnemigoBase;
        let enemigo = new EnemyClass(data, this.tileSize);

        // 2. Si el enemigo DEBE llevar decoración extra
        if (data.decoradores) {
            for (const dec of data.decoradores) {
                if (dec === 'FIRE') enemigo = new FireDecorator(enemigo);
            }
        }
        
        // 3. Posicionamiento 
        enemigo.x = data.gridX * this.tileSize + (this.tileSize / 2);
        enemigo.y = data.gridY * this.tileSize + (this.tileSize / 2);

        // ==========================================
        // 4. ¡LA SOLUCIÓN! DARLES CUERPO GRÁFICO (PIXI.Graphics)
        // ==========================================
        const cuerpoEnemigo = new PIXI.Graphics();
        
        // Verificamos el tipo para darle distinta forma y color
        if (data.type === 'BAKU' || enemigo.tipo === 'BAKU') {
            cuerpoEnemigo.beginFill(0x8e44ad); // Morado para Baku
            cuerpoEnemigo.drawRect(-12, -12, 24, 24); // Cuadrado
        } else {
            cuerpoEnemigo.beginFill(0xff0000); // Rojo para Enemigo Base
            cuerpoEnemigo.drawCircle(0, 0, 12); // Círculo
        }
        cuerpoEnemigo.endFill();

        enemigo.sprite = cuerpoEnemigo;
        
        // Los agregamos a la escena para que se puedan ver
        this.capaEntidades.addChild(enemigo.sprite);
        // ==========================================

        return enemigo;
    }

    inicializar() {
        if (!this.configEnemigos || !Array.isArray(this.configEnemigos)) {
            console.warn("EnemyManager: No se encontraron configuraciones de enemigos para inicializar.");
            return;
        }

        for (const data of this.configEnemigos) {
            const enemigo = this.fabricaDeEnemigos(data);
            this.enemies.push(enemigo);
        }

        console.log(`EnemyManager: Inicializados ${this.enemies.length} enemigos visibles.`);
    }

    destroy() {
        for (const enemigo of this.enemies) {
            if (enemigo.sprite) enemigo.sprite.destroy();
        }
        this.enemies = [];
        this.pool = [];
    }
}
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

<<<<<<< HEAD
        // 2. Si el enemigo DEBE llevar decoración extra
=======
        // 2. Decoradores
>>>>>>> 5e9e805 (stonk)
        if (data.decoradores) {
            for (const dec of data.decoradores) {
                if (dec === 'FIRE') enemigo = new FireDecorator(enemigo);
            }
        }
<<<<<<< HEAD
        
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

=======

        // 3. Posicionamiento
        enemigo.x = data.gridX * this.tileSize + (this.tileSize / 2);
        enemigo.y = data.gridY * this.tileSize + (this.tileSize / 2);

        // 4. Crear representación visual si no tiene sprite
        if (!enemigo.sprite) {
            const grafico = new PIXI.Graphics();
            let color = 0xff6584; // Color base (Rosa)
            let radio = this.tileSize * 0.35;

            if (data.type === 'BAKU') {
                color = 0x9b59b6; // Morado para Baku
            } else if (data.type === 'EXPLOSIVE_SHOOTER') {
                color = 0xe67e22; // Naranja para Boss
                radio = this.tileSize * 0.45; // Más grande
            } else if (data.type === 'SHOOTER_CHILD') {
                color = 0xf1c40f; // Amarillo para hijos
                radio = this.tileSize * 0.22; // Pequeño
            } else if (data.decoradores && data.decoradores.includes('SPLITTER')) {
                color = 0x2ecc71; // Verde para Splitter
            }

            grafico.lineStyle(2, 0xffffff, 0.8);
            grafico.beginFill(color);
            grafico.drawCircle(0, 0, radio);
            grafico.endFill();

            grafico.beginFill(0xffffff, 0.6);
            grafico.drawCircle(-radio * 0.2, -radio * 0.2, radio * 0.25);
            grafico.endFill();

            enemigo.sprite = grafico;
            this.capaEntidades.addChild(grafico);
        }

        if (enemigo.sprite) {
            enemigo.sprite.x = enemigo.x;
            enemigo.sprite.y = enemigo.y;
            enemigo.sprite.visible = true;
        }

        this.enemies.push(enemigo);
>>>>>>> 5e9e805 (stonk)
        return enemigo;
    }

    inicializar() {
        if (!this.configEnemigos || !Array.isArray(this.configEnemigos)) {
            console.warn("EnemyManager: No se encontraron configuraciones de enemigos para inicializar.");
            return;
        }

        for (const data of this.configEnemigos) {
            this.fabricaDeEnemigos(data);
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
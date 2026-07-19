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
        const type = data.type || data.tipo || 'BASE';
        const EnemyClass = ENEMY_CLASSES[type] || EnemigoBase;
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
        if (type === 'MONSTER_SPAWNER') {
            // Generador de Monstruos (Portal de piedra)
            cuerpoEnemigo.beginFill(0x2d3748);
            cuerpoEnemigo.drawRect(-18, -18, 36, 36, 6);
            cuerpoEnemigo.endFill();
            // Núcleo energético oscilante
            cuerpoEnemigo.beginFill(0x805ad5);
            cuerpoEnemigo.drawEllipse(0, 0, 10, 14);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0xb794f4, 0.6);
            cuerpoEnemigo.drawCircle(0, 0, 6);
            cuerpoEnemigo.endFill();
        } else if (type === 'NECROMANCER') {
            // Nigromante (Túnica oscura, capucha y báculo)
            cuerpoEnemigo.beginFill(0x1a202c);
            cuerpoEnemigo.drawCircle(0, 0, 14);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0x4a5568);
            cuerpoEnemigo.drawCircle(0, -5, 10);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0xedf2f7);
            cuerpoEnemigo.drawEllipse(0, -3, 6, 7);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0x319795); // Ojos cian
            cuerpoEnemigo.drawCircle(-2, -3, 1.5);
            cuerpoEnemigo.drawCircle(2, -3, 1.5);
            cuerpoEnemigo.endFill();
            // Báculo
            cuerpoEnemigo.lineStyle(1.5, 0x718096);
            cuerpoEnemigo.moveTo(10, 10);
            cuerpoEnemigo.lineTo(10, -10);
            cuerpoEnemigo.lineStyle(0);
            cuerpoEnemigo.beginFill(0x319795, 0.9);
            cuerpoEnemigo.drawCircle(10, -12, 3);
            cuerpoEnemigo.endFill();
        } else if (type === 'ORC_BOSS') {
            // Jefe Orco Gigante
            cuerpoEnemigo.beginFill(0x22543d); // Verde orco oscuro
            cuerpoEnemigo.drawCircle(0, 0, 22);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0x744210); // Hombreras cuero
            cuerpoEnemigo.drawRect(-24, -12, 10, 10, 2);
            cuerpoEnemigo.drawRect(14, -12, 10, 10, 2);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0xd69e2e); // Pincho
            cuerpoEnemigo.drawCircle(-19, -12, 2.5);
            cuerpoEnemigo.drawCircle(19, -12, 2.5);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0x4a5568); // Yelmo
            cuerpoEnemigo.drawRect(-10, -16, 20, 14, 3);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0xe53e3e); // Ojos rojos
            cuerpoEnemigo.drawCircle(-4, -12, 2);
            cuerpoEnemigo.drawCircle(4, -12, 2);
            cuerpoEnemigo.endFill();
            // Hacha dorada
            cuerpoEnemigo.beginFill(0xd69e2e);
            cuerpoEnemigo.drawRect(16, -26, 6, 12);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.lineStyle(2, 0x718096);
            cuerpoEnemigo.moveTo(19, -14);
            cuerpoEnemigo.lineTo(19, 10);
            cuerpoEnemigo.lineStyle(0);
        } else if (type === 'BAKU') {
            // Orco normal
            cuerpoEnemigo.beginFill(0x27ae60);
            cuerpoEnemigo.drawRect(-16, -16, 32, 32);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0xd69e2e);
            cuerpoEnemigo.drawCircle(-16, -16, 5);
            cuerpoEnemigo.drawCircle(16, -16, 5);
            cuerpoEnemigo.endFill();
        } else if (type === 'EXPLOSIVE_SHOOTER') {
            // Chamán Esqueleto / Mago Oscuro
            cuerpoEnemigo.beginFill(0x2f3542);
            cuerpoEnemigo.drawCircle(0, 0, 14);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0x8e44ad);
            cuerpoEnemigo.drawCircle(0, -6, 9);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0xff3f34);
            cuerpoEnemigo.drawCircle(-4, -1, 2);
            cuerpoEnemigo.drawCircle(4, -1, 2);
            cuerpoEnemigo.endFill();
        } else if (type === 'SHOOTER_CHILD') {
            // Espectro / Cráneo pequeño
            cuerpoEnemigo.beginFill(0xf1f2f6, 0.85);
            cuerpoEnemigo.drawCircle(0, 0, 8);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0x34e7f4);
            cuerpoEnemigo.drawCircle(-2, -1, 1.5);
            cuerpoEnemigo.drawCircle(2, -1, 1.5);
            cuerpoEnemigo.endFill();
        } else {
            // BASE: Esqueleto
            cuerpoEnemigo.beginFill(0xdfe4ea);
            cuerpoEnemigo.drawCircle(0, 0, 12);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0xff3f34);
            cuerpoEnemigo.drawCircle(-3, -2, 2.5);
            cuerpoEnemigo.drawCircle(3, -2, 2.5);
            cuerpoEnemigo.endFill();
            cuerpoEnemigo.beginFill(0x2f3542);
            cuerpoEnemigo.drawCircle(0, 2, 1.5);
            cuerpoEnemigo.endFill();
        }

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
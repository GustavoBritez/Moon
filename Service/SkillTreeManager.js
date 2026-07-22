import { AlliedEntity } from '../Niveles/Enemigo/AlliedEntity.js';

export class SkillTreeManager {
    constructor(nivel) {
        this.nivel = nivel;
        this.player = nivel.player;
        this.clase = window.playerState?.clase || 'knight';
        
        // Carga de ultimate (0 a 100)
        this.ultimateCharge = 0;
        
        // Cooldowns
        this.cooldowns = {
            skill1: 0,
            skill2: 0,
            ultimate: 0
        };

        // Estado activo de skills
        this.activeBuffs = {
            berserker: 0,
            pasosViento: 0,
            totemVida: 0
        };

        this.esbirros = []; // Para el invocador
        this.initPassive();
    }

    initPassive() {
        // Inicializar pasivas según la clase
        switch (this.clase) {
            case 'knight':
                // Piel de Hierro: Incrementa defensa y reduce empujones
                this.player.defensaBase = (this.player.defensaBase || 0) + 10;
                this.player.inmuneEmpuje = false; // Se activará con pasiva si es necesario
                break;
            case 'mage':
                // Escudo de Maná: Absorbe daño (se maneja en recibirDanio o update)
                this.player.escudoManaActivo = true;
                break;
            case 'archer':
                // Pasos de Viento: Aumenta velocidad de movimiento
                this.player.speed *= 1.15;
                break;
            case 'shaman':
                // Bendición del Dragón: Probabilidad de crítico (se puede usar al atacar)
                window.playerState.probCritico = (window.playerState.probCritico || 0) + 0.15;
                break;
            case 'summoner':
                // Pacto de Almas: Esbirros heredan stats (se aplica al invocar)
                break;
        }
    }

    update(dt) {
        // Reducir cooldowns
        if (this.cooldowns.skill1 > 0) this.cooldowns.skill1 -= dt;
        if (this.cooldowns.skill2 > 0) this.cooldowns.skill2 -= dt;
        if (this.cooldowns.ultimate > 0) this.cooldowns.ultimate -= dt;

        // Reducir duración de buffs
        for (let key in this.activeBuffs) {
            if (this.activeBuffs[key] > 0) {
                this.activeBuffs[key] -= dt;
                if (this.activeBuffs[key] <= 0) {
                    this.removeBuff(key);
                }
            }
        }

        this.handleInputs();
        this.updateClassSpecifics(dt);
    }

    removeBuff(key) {
        if (key === 'berserker') {
            this.player.speed /= 1.5;
            this.player.danioMultiplicador = 1.0;
            this.player.inmuneEmpuje = false;
            this.nivel.uiManager.mostrarMensajeFlotante("Furia Terminada", this.player.x, this.player.y - 30);
        }
    }

    handleInputs() {
        if (this.nivel.inputManager.isActionPressed('SKILL_1') && this.cooldowns.skill1 <= 0) {
            this.useSkill1();
        }
        if (this.nivel.inputManager.isActionPressed('SKILL_2') && this.cooldowns.skill2 <= 0) {
            this.useSkill2();
        }
        if (this.nivel.inputManager.isActionPressed('ULTIMATE') && this.ultimateCharge >= 100 && this.cooldowns.ultimate <= 0) {
            this.useUltimate();
        }
    }

    addUltimateCharge(amount) {
        this.ultimateCharge = Math.min(100, this.ultimateCharge + amount);
    }

    // ==========================================
    // EJECUCIÓN DE HABILIDADES POR CLASE
    // ==========================================

    useSkill1() {
        switch (this.clase) {
            case 'knight':
                // Corte Torbellino
                this.cooldowns.skill1 = 4.0;
                this.skillCorteTorbellino();
                break;
            case 'mage':
                // Bolas de Energía Inagotables (Auto-ataque) - Generalmente pasivo o click
                // Aquí lo mapeamos como un disparo potente si se presiona Q
                this.cooldowns.skill1 = 1.0;
                this.nivel.disparar();
                break;
            case 'archer':
                // Disparo Múltiple
                this.cooldowns.skill1 = 3.0;
                this.skillDisparoMultiple();
                break;
            case 'shaman':
                // Cura de Naturaleza
                this.cooldowns.skill1 = 8.0;
                this.skillCuraNaturaleza();
                break;
            case 'summoner':
                // Invocar Bestia Sombría
                this.cooldowns.skill1 = 10.0;
                this.skillInvocarBestia();
                break;
        }
    }

    useSkill2() {
        switch (this.clase) {
            case 'knight':
                // Golpe Sísmico
                this.cooldowns.skill2 = 6.0;
                this.skillGolpeSismico();
                break;
            case 'mage':
                // Rayo Arcano
                this.cooldowns.skill2 = 5.0;
                this.skillRayoArcano();
                break;
            case 'archer':
                // Flecha Venenosa
                this.cooldowns.skill2 = 4.0;
                this.skillFlechaVenenosa();
                break;
            case 'shaman':
                // Ataque de Rayo
                this.cooldowns.skill2 = 5.0;
                this.skillAtaqueRayo();
                break;
            case 'summoner':
                // Explosión de Esbirro
                this.cooldowns.skill2 = 8.0;
                this.skillExplosionEsbirro();
                break;
        }
    }

    useUltimate() {
        this.ultimateCharge = 0; // Consumir carga
        this.cooldowns.ultimate = 2.0; // Pequeño delay de reuso
        
        switch (this.clase) {
            case 'knight':
                // Furia Berserker
                this.activeBuffs.berserker = 10.0;
                this.player.speed *= 1.5;
                this.player.danioMultiplicador = 2.0;
                this.player.inmuneEmpuje = true;
                this.nivel.uiManager.mostrarMensajeFlotante("¡FURIA BERSERKER!", this.player.x, this.player.y - 40);
                break;
            case 'mage':
                // Lluvia de Meteoros
                this.nivel.uiManager.mostrarMensajeFlotante("¡LLUVIA DE METEOROS!", this.player.x, this.player.y - 40);
                this.skillLluviaMeteoros();
                break;
            case 'archer':
                // Lluvia de Flechas Celestiales
                this.nivel.uiManager.mostrarMensajeFlotante("¡FLECHAS CELESTIALES!", this.player.x, this.player.y - 40);
                this.skillLluviaMeteoros(); // Reutiliza lógica de lluvia
                break;
            case 'shaman':
                // Tótem de Vida y Tormenta
                this.nivel.uiManager.mostrarMensajeFlotante("¡TÓTEM DE TORMENTA!", this.player.x, this.player.y - 40);
                this.activeBuffs.totemVida = 10.0;
                break;
            case 'summoner':
                // Invocación del Golem Titánico
                this.nivel.uiManager.mostrarMensajeFlotante("¡GOLEM TITÁNICO!", this.player.x, this.player.y - 40);
                this.skillInvocarGolem();
                break;
        }
    }

    // ==========================================
    // IMPLEMENTACIONES ESPECÍFICAS
    // ==========================================

    skillCorteTorbellino() {
        const radio = 80;
        this.nivel.uiManager.mostrarMensajeFlotante("Torbellino", this.player.x, this.player.y - 20);
        this.nivel.enemyManager.enemies.forEach(enemigo => {
            if (!enemigo.isDead) {
                const dist = Math.hypot(enemigo.x - this.player.x, enemigo.y - this.player.y);
                if (dist < radio) {
                    enemigo.recibirGolpe(30, 'knight');
                }
            }
        });
    }

    skillGolpeSismico() {
        const radio = 120;
        this.nivel.uiManager.mostrarMensajeFlotante("Golpe Sísmico", this.player.x, this.player.y - 20);
        this.nivel.enemyManager.enemies.forEach(enemigo => {
            if (!enemigo.isDead) {
                const dist = Math.hypot(enemigo.x - this.player.x, enemigo.y - this.player.y);
                if (dist < radio) {
                    enemigo.recibirGolpe(20, 'knight');
                    enemigo.estadoComportamiento = "ATURDIDO";
                    enemigo.estadoTimer = 3.0; // Aturdido 3 segundos
                }
            }
        });
    }

    skillDisparoMultiple() {
        const mouseX = this.nivel.mouseX - this.nivel.mundo.x;
        const mouseY = this.nivel.mouseY - this.nivel.mundo.y;
        const anguloBase = Math.atan2(mouseY - this.player.y, mouseX - this.player.x);
        
        for (let i = -1; i <= 1; i++) {
            const angulo = anguloBase + (i * 0.2);
            this.crearProyectil(angulo, 15, 0x00ff00, false); // Flecha verde
        }
    }

    skillFlechaVenenosa() {
        const mouseX = this.nivel.mouseX - this.nivel.mundo.x;
        const mouseY = this.nivel.mouseY - this.nivel.mundo.y;
        const angulo = Math.atan2(mouseY - this.player.y, mouseX - this.player.x);
        this.crearProyectil(angulo, 25, 0x800080, true); // Flecha venenosa
    }

    skillRayoArcano() {
        const mouseX = this.nivel.mouseX - this.nivel.mundo.x;
        const mouseY = this.nivel.mouseY - this.nivel.mundo.y;
        const angulo = Math.atan2(mouseY - this.player.y, mouseX - this.player.x);
        // Rayo que atraviesa (isPiercing)
        this.crearProyectil(angulo, 40, 0x00ffff, false, true); 
    }

    skillCuraNaturaleza() {
        this.player.vidaActual = Math.min(this.player.vidaMaxima, this.player.vidaActual + 40);
        this.nivel.uiManager.mostrarMensajeFlotante("+40 HP", this.player.x, this.player.y - 30);
    }

    skillAtaqueRayo() {
        // Cadena de relámpagos (simplificado a daño en zona pequeña frontal)
        this.skillCorteTorbellino();
    }

    skillInvocarBestia() {
        this.nivel.uiManager.mostrarMensajeFlotante("¡Lobo Invocado!", this.player.x, this.player.y - 30);
        const aliado = new AlliedEntity(
            this.player.x + (Math.random() * 40 - 20),
            this.player.y + (Math.random() * 40 - 20),
            'wolf',
            this.player,
            this.nivel.enemyManager,
            this.nivel.capaEntidades
        );
        this.esbirros.push(aliado);
    }

    skillExplosionEsbirro() {
        if (this.esbirros.length === 0) {
            this.nivel.uiManager.mostrarMensajeFlotante("Sin esbirros", this.player.x, this.player.y - 30);
            return;
        }

        // Explotar el esbirro más cercano o el primero de la lista
        const esbirro = this.esbirros.shift();
        if (esbirro) {
            const exX = esbirro.x;
            const exY = esbirro.y;
            esbirro.destruir();

            this.nivel.uiManager.mostrarMensajeFlotante("💥 ¡EXPLOSIÓN!", exX, exY - 20);

            // Daño en área de la explosión
            const radioExplosion = 120;
            this.nivel.enemyManager.enemies.forEach(enemigo => {
                if (!enemigo.isDead) {
                    const dist = Math.hypot(enemigo.x - exX, enemigo.y - exY);
                    if (dist <= radioExplosion) {
                        enemigo.recibirGolpe(60, 'summoner');
                    }
                }
            });
        }
    }

    skillLluviaMeteoros() {
        const mouseX = this.nivel.mouseX - this.nivel.mundo.x;
        const mouseY = this.nivel.mouseY - this.nivel.mundo.y;
        
        this.nivel.enemyManager.enemies.forEach(enemigo => {
            if (!enemigo.isDead) {
                const dist = Math.hypot(enemigo.x - mouseX, enemigo.y - mouseY);
                if (dist < 150) {
                    enemigo.recibirGolpe(100, this.clase);
                }
            }
        });
    }

    skillInvocarGolem() {
        this.nivel.uiManager.mostrarMensajeFlotante("¡Golem Titánico!", this.player.x, this.player.y - 30);
        const golem = new AlliedEntity(
            this.player.x + 30,
            this.player.y + 30,
            'golem',
            this.player,
            this.nivel.enemyManager,
            this.nivel.capaEntidades
        );
        this.esbirros.push(golem);
    }

    // Helper para crear proyectiles desde habilidades
    crearProyectil(angulo, danio, color, isPoison = false, isPiercing = false) {
        if (typeof PIXI === 'undefined') return;
        const spriteBala = new PIXI.Graphics();
        spriteBala.beginFill(color);
        spriteBala.drawCircle(0, 0, 5);
        spriteBala.endFill();
        
        const b = {
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angulo) * 600,
            vy: Math.sin(angulo) * 600,
            sprite: spriteBala,
            danio: danio,
            claseJugador: this.clase,
            isPoison: isPoison,
            isPiercing: isPiercing
        };
        b.sprite.x = b.x;
        b.sprite.y = b.y;
        this.nivel.capaEntidades.addChild(b.sprite);
        this.nivel.projectiles.push(b);
    }

    updateClassSpecifics(dt) {
        // Actualizar esbirros activos del Invocador
        for (let i = this.esbirros.length - 1; i >= 0; i--) {
            const esbirro = this.esbirros[i];
            esbirro.update(dt);
            if (esbirro.isDead) {
                this.esbirros.splice(i, 1);
            }
        }
        
        // Chamán: Tótem de Vida (curación periódica en área)
        if (this.activeBuffs.totemVida > 0) {
            if (Math.random() < 0.05) {
                this.player.vidaActual = Math.min(this.player.vidaMaxima, this.player.vidaActual + 1);
            }
        }
    }
}

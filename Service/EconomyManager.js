export class EconomyManager {
    constructor() {
        this.totalLunas = 1000000;
        
        // Inicializar estado global económico si no existe
        if (!window.economyState) {
            window.economyState = {
                lunasExtraidas: 0
            };
        }
        
        // Inicializar billetera del jugador
        if (!window.playerState) {
            window.playerState = {};
        }
        if (window.playerState.lunas === undefined) {
            window.playerState.lunas = 0;
        }
    }

    getLunasRestantes() {
        return Math.max(0, this.totalLunas - window.economyState.lunasExtraidas);
    }

    calcularRecompensa(recompensaBase) {
        const restantes = this.getLunasRestantes();
        if (restantes <= 0) return 0;
        
        // Fórmula estilo Bitcoin (Diminishing Return)
        // La recompensa se multiplica por el porcentaje de Lunas que quedan por minar
        const multiplicador = restantes / this.totalLunas;
        let recompensaCalculada = recompensaBase * multiplicador;
        
        // Evitar dar menos de 0.001 si aún quedan lunas
        if (recompensaCalculada < 0.001 && restantes > 0) {
            recompensaCalculada = Math.min(restantes, 0.001);
        }
        
        return recompensaCalculada;
    }

    minarLunas(cantidadBase) {
        const recompensaFinal = this.calcularRecompensa(cantidadBase);
        
        if (recompensaFinal > 0) {
            // Se resta del pool global (se suma a las extraídas)
            window.economyState.lunasExtraidas += recompensaFinal;
            // Se añaden a la billetera del jugador
            window.playerState.lunas += recompensaFinal;
            
            console.log(`[Economía] Minadas ${recompensaFinal.toFixed(4)} LN. Restantes en el pool: ${this.getLunasRestantes().toFixed(2)} LN`);
            return recompensaFinal;
        }
        return 0;
    }
}

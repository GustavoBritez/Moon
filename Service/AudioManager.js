// Service/AudioManager.js
class AudioManager {
    constructor(playlist) {
        this.playlist = playlist; // Array con las rutas de los audios
        this.currentIndex = 0;
        this.audio = new Audio();
        this.audio.volume = 0.5;
        this.isPlaying = false;

        // 🔥 Evento mágico: Cuando el audio termina, suena el siguiente
        this.audio.onended = () => this.playNext();
    }

    playNext() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.audio.src = this.playlist[this.currentIndex];
        this.audio.play();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            // Si el src está vacío, cargamos la primera
            if (!this.audio.src) this.audio.src = this.playlist[0];
            this.audio.play().catch(e => console.log("Interacción necesaria"));
        }
        this.isPlaying = !this.isPlaying;
        return this.isPlaying;
    }

    setVolume(val) {
        this.audio.volume = val / 100;
    }
}

// Ejemplo de uso al iniciar el juego:
const misTemas = [
    './Assets/audio/Lobby_Music/Crystal_Castles_Leni.mp3'
];
window.audioManager = new AudioManager(misTemas);
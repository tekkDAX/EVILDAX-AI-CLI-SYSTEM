
// src/services/audioService.js
class AudioService {
    constructor() {
        this.sfxVolume = 0.75;
        this.musicVolume = 0.5;
        this.isInitialized = false;
        this.sounds = {};
        this.musicTracks = [];
        
        // Pfade zu Dummy-Dateien, falls echte nicht existieren, um Fehler zu vermeiden
        this.soundFiles = {
            click: './assets/audio/ui_click.mp3',
            success: './assets/audio/quest_success.mp3',
            fail: './assets/audio/quest_fail.mp3',
            levelUp: './assets/audio/level_up.mp3',
        };
    }

    async init(onProgress) {
        // Wir setzen isInitialized sofort, damit die App nicht blockiert
        // Echte Audiodaten werden im Hintergrund geladen
        this.isInitialized = true;
        if(onProgress) onProgress(100, 100);
        return Promise.resolve();
    }

    playSound(name) {
        // Silent fail if not initialized or sound missing
        if (!this.isInitialized) return;
        // Placeholder logic
    }
    
    playClickSound() { this.playSound('click'); }
    playMusic() { /* Placeholder */ }
    stopMusic() { /* Placeholder */ }

    setSfxVolume(volume) { 
        this.sfxVolume = volume / 100;
    }

    setMusicVolume(volume) { 
        this.musicVolume = volume / 100;
    }
}

export const audioService = new AudioService();

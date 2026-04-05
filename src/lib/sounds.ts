const SOUNDS = {
  complete: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  achievement: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

class SoundManager {
  private enabled: boolean = true;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  play(sound: keyof typeof SOUNDS) {
    if (!this.enabled) return;

    let audio = this.audioCache.get(sound);
    if (!audio) {
      audio = new Audio(SOUNDS[sound]);
      this.audioCache.set(sound, audio);
    }
    
    audio.currentTime = 0;
    audio.play().catch(e => console.warn('Sound play failed:', e));
  }
}

export const soundManager = new SoundManager();

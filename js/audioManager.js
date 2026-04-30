import config from './config.js';

export default class AudioManager {
  constructor() {
    this.sounds = {};
    this.settings = {
      soundEnabled: config.defaultSettings.soundEnabled,
      vibrationEnabled: config.defaultSettings.vibrationEnabled
    };
    this.loadSounds();
  }

  loadSounds() {
    for (const key in config.sounds) {
      this.sounds[key] = {
        src: config.sounds[key],
        audio: null
      };
    }
  }

  playSound(soundName) {
    if (!this.settings.soundEnabled) return;
    
    const sound = this.sounds[soundName];
    if (!sound) return;
    
    try {
      if (sound.audio) {
        sound.audio.destroy();
      }
      
      sound.audio = wx.createInnerAudioContext();
      sound.audio.src = sound.src;
      sound.audio.play();
      
      sound.audio.onError((err) => {
        console.log('音频播放错误:', err);
      });
    } catch (e) {
      console.log('音频播放失败:', e);
    }
  }

  vibrate() {
    if (!this.settings.vibrationEnabled) return;
    
    try {
      wx.vibrateShort({
        type: 'medium'
      });
    } catch (e) {
      console.log('震动失败:', e);
    }
  }

  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
  }

  getSettings() {
    return { ...this.settings };
  }

  saveSettings() {
    try {
      wx.setStorageSync('gameSettings', this.settings);
    } catch (e) {
      console.log('保存设置失败:', e);
    }
  }

  loadSettings() {
    try {
      const savedSettings = wx.getStorageSync('gameSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings };
      }
    } catch (e) {
      console.log('加载设置失败:', e);
    }
  }
}

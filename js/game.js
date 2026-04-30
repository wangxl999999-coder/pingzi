import config from './config.js';
import Bottle from './bottle.js';
import Level from './level.js';
import Renderer from './renderer.js';
import HistoryManager from './historyManager.js';
import AudioManager from './audioManager.js';
import Utils from './utils.js';

export default class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.renderer = null;
    this.audioManager = null;
    this.historyManager = null;
    
    this.currentLevel = 1;
    this.bottles = [];
    this.selectedBottle = null;
    this.moves = 0;
    
    this.isAnimating = false;
    this.showSettings = false;
    this.showWinPanel = false;
    this.settingsPanelElements = null;
    this.winPanelElements = null;
    
    this.buttons = [];
    this.lastTime = 0;
  }

  init() {
    this.setupCanvas();
    this.setupAudio();
    this.setupHistory();
    this.setupButtons();
    this.loadLevel(this.currentLevel);
    this.setupEventListeners();
    this.gameLoop();
  }

  setupCanvas() {
    this.canvas = wx.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    
    const systemInfo = wx.getSystemInfoSync();
    this.canvas.width = systemInfo.windowWidth;
    this.canvas.height = systemInfo.windowHeight;
    
    config.canvasWidth = this.canvas.width;
    config.canvasHeight = this.canvas.height;
    
    this.renderer = new Renderer(this.canvas);
  }

  setupAudio() {
    this.audioManager = new AudioManager();
    this.audioManager.loadSettings();
  }

  setupHistory() {
    this.historyManager = new HistoryManager(50);
  }

  setupButtons() {
    const buttonWidth = 70;
    const buttonHeight = 35;
    const spacing = 15;
    const startX = (this.canvas.width - (buttonWidth * 4 + spacing * 3)) / 2;
    const buttonY = this.canvas.height - 80;
    
    this.buttons = [
      {
        id: 'shuffle',
        text: '打乱',
        x: startX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#f39c12',
        action: () => this.shuffleBottles()
      },
      {
        id: 'undo',
        text: '撤回',
        x: startX + buttonWidth + spacing,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#3498db',
        action: () => this.undo()
      },
      {
        id: 'addBottle',
        text: '加瓶',
        x: startX + (buttonWidth + spacing) * 2,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#9b59b6',
        action: () => this.addEmptyBottle()
      },
      {
        id: 'settings',
        text: '设置',
        x: startX + (buttonWidth + spacing) * 3,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#1abc9c',
        action: () => this.toggleSettings()
      }
    ];
  }

  loadLevel(levelNumber) {
    this.currentLevel = levelNumber;
    this.moves = 0;
    this.selectedBottle = null;
    this.showWinPanel = false;
    this.historyManager.clear();
    
    const level = new Level(levelNumber);
    const bottleData = level.getBottleData();
    
    this.bottles = [];
    
    const bottlesPerRow = 4;
    const bottleWidth = config.bottleWidth;
    const bottleHeight = config.bottleHeight;
    const spacingX = 20;
    const spacingY = 30;
    
    const totalWidth = bottlesPerRow * bottleWidth + (bottlesPerRow - 1) * spacingX;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = 100;
    
    bottleData.forEach((data, index) => {
      const row = Math.floor(index / bottlesPerRow);
      const col = index % bottlesPerRow;
      
      const x = startX + col * (bottleWidth + spacingX);
      const y = startY + row * (bottleHeight + spacingY);
      
      const bottle = new Bottle(data.id, x, y, [...data.liquids]);
      this.bottles.push(bottle);
    });
  }

  setupEventListeners() {
    wx.onTouchStart((e) => {
      if (this.isAnimating) return;
      
      const touch = e.touches[0];
      this.handleTouch(touch.clientX, touch.clientY);
    });
  }

  handleTouch(x, y) {
    if (this.showWinPanel && this.winPanelElements) {
      this.handleWinPanelClick(x, y);
      return;
    }
    
    if (this.showSettings && this.settingsPanelElements) {
      this.handleSettingsPanelClick(x, y);
      return;
    }
    
    for (const button of this.buttons) {
      if (Utils.isPointInRect(x, y, button)) {
        this.audioManager.playSound('click');
        this.audioManager.vibrate();
        button.action();
        return;
      }
    }
    
    for (const bottle of this.bottles) {
      if (bottle.containsPoint(x, y) && !bottle.disappearing) {
        this.handleBottleClick(bottle);
        return;
      }
    }
  }

  handleBottleClick(bottle) {
    this.audioManager.playSound('click');
    this.audioManager.vibrate();
    
    if (this.selectedBottle === null) {
      this.selectedBottle = bottle;
      bottle.selected = true;
    } else if (this.selectedBottle === bottle) {
      this.selectedBottle.selected = false;
      this.selectedBottle = null;
    } else {
      const pourResult = this.selectedBottle.canPourTo(bottle);
      
      if (pourResult) {
        this.historyManager.saveState(this.bottles);
        const poured = this.selectedBottle.pourTo(bottle);
        
        if (poured) {
          this.moves++;
          this.audioManager.playSound('pour');
          this.checkCompletion();
        }
      }
      
      this.selectedBottle.selected = false;
      this.selectedBottle = null;
    }
  }

  handleWinPanelClick(x, y) {
    if (!this.winPanelElements) return;
    
    const { nextButton, replayButton } = this.winPanelElements;
    
    if (Utils.isPointInRect(x, y, nextButton)) {
      this.audioManager.playSound('click');
      this.audioManager.vibrate();
      const nextLevel = Math.min(this.currentLevel + 1, Level.getMaxLevel());
      this.loadLevel(nextLevel);
    } else if (Utils.isPointInRect(x, y, replayButton)) {
      this.audioManager.playSound('click');
      this.audioManager.vibrate();
      this.loadLevel(this.currentLevel);
    }
  }

  handleSettingsPanelClick(x, y) {
    if (!this.settingsPanelElements) return;
    
    const { soundToggle, vibrationToggle, closeButton } = this.settingsPanelElements;
    const settings = this.audioManager.getSettings();
    
    if (Utils.isPointInRect(x, y, soundToggle)) {
      this.audioManager.updateSettings({ soundEnabled: !settings.soundEnabled });
      this.audioManager.saveSettings();
      if (!settings.soundEnabled) {
        this.audioManager.playSound('click');
      }
    } else if (Utils.isPointInRect(x, y, vibrationToggle)) {
      this.audioManager.updateSettings({ vibrationEnabled: !settings.vibrationEnabled });
      this.audioManager.saveSettings();
      this.audioManager.vibrate();
    } else if (Utils.isPointInRect(x, y, closeButton)) {
      this.showSettings = false;
      this.settingsPanelElements = null;
    }
  }

  shuffleBottles() {
    if (this.isAnimating) return;
    
    this.historyManager.saveState(this.bottles);
    
    const incompleteBottles = this.bottles.filter(b => !b.isCompleted && !b.isEmpty);
    
    if (incompleteBottles.length < 2) return;
    
    let allLiquids = [];
    incompleteBottles.forEach(bottle => {
      allLiquids.push(...bottle.liquids);
    });
    
    allLiquids = Utils.shuffleArray(allLiquids);
    
    let liquidIndex = 0;
    incompleteBottles.forEach(bottle => {
      const liquidCount = bottle.liquids.length;
      bottle.liquids = [];
      for (let i = 0; i < liquidCount && liquidIndex < allLiquids.length; i++) {
        bottle.liquids.push(allLiquids[liquidIndex]);
        liquidIndex++;
      }
    });
    
    this.moves++;
    this.selectedBottle = null;
  }

  undo() {
    if (this.isAnimating) return;
    if (!this.historyManager.canUndo()) return;
    
    const previousState = this.historyManager.undo();
    if (!previousState) return;
    
    previousState.forEach(state => {
      const bottle = this.bottles.find(b => b.id === state.id);
      if (bottle) {
        bottle.liquids = [...state.liquids];
        bottle.selected = false;
        bottle.disappearing = false;
        bottle.opacity = 1;
        bottle.scale = 1;
      }
    });
    
    if (this.selectedBottle) {
      this.selectedBottle.selected = false;
      this.selectedBottle = null;
    }
    
    this.moves = Math.max(0, this.moves - 1);
  }

  addEmptyBottle() {
    if (this.isAnimating) return;
    
    this.historyManager.saveState(this.bottles);
    
    const bottlesPerRow = 4;
    const bottleWidth = config.bottleWidth;
    const bottleHeight = config.bottleHeight;
    const spacingX = 20;
    const spacingY = 30;
    
    const totalWidth = bottlesPerRow * bottleWidth + (bottlesPerRow - 1) * spacingX;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = 100;
    
    const newId = Math.max(...this.bottles.map(b => b.id)) + 1;
    const totalBottles = this.bottles.length;
    const row = Math.floor(totalBottles / bottlesPerRow);
    const col = totalBottles % bottlesPerRow;
    
    const x = startX + col * (bottleWidth + spacingX);
    const y = startY + row * (bottleHeight + spacingY);
    
    const newBottle = new Bottle(newId, x, y, []);
    this.bottles.push(newBottle);
    
    this.moves++;
  }

  checkCompletion() {
    const completedBottles = this.bottles.filter(b => b.isCompleted);
    const hasIncomplete = this.bottles.some(b => !b.isCompleted && !b.isEmpty);
    
    if (completedBottles.length > 0) {
      this.audioManager.playSound('complete');
      this.animateDisappear(completedBottles);
    }
    
    if (!hasIncomplete && this.bottles.every(b => b.isCompleted || b.isEmpty)) {
      setTimeout(() => {
        this.showWinPanel = true;
        this.audioManager.playSound('complete');
      }, 600);
    }
  }

  async animateDisappear(bottles) {
    this.isAnimating = true;
    
    const animationPromises = bottles.map(async (bottle) => {
      if (bottle.disappearing) return;
      
      bottle.disappearing = true;
      this.audioManager.playSound('disappear');
      
      const startTime = Date.now();
      const duration = config.disappearDuration;
      
      return new Promise(resolve => {
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          bottle.opacity = 1 - progress;
          bottle.scale = 1 + progress * 0.3;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        animate();
      });
    });
    
    await Promise.all(animationPromises);
    
    this.bottles = this.bottles.filter(b => !b.disappearing);
    this.isAnimating = false;
  }

  toggleSettings() {
    this.showSettings = !this.showSettings;
    if (!this.showSettings) {
      this.settingsPanelElements = null;
    }
  }

  gameLoop(currentTime = 0) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    for (const bottle of this.bottles) {
      if (bottle.selected) {
        bottle.y = bottle.y + Math.sin(Date.now() / 200) * 0.3;
      }
    }
  }

  render() {
    this.renderer.clear();
    this.renderer.drawBackground();
    
    this.renderer.drawLevelInfo(this.currentLevel, this.moves);
    
    for (const bottle of this.bottles) {
      this.renderer.drawBottle(bottle);
    }
    
    for (const button of this.buttons) {
      const buttonWithState = {
        ...button,
        disabled: button.id === 'undo' && !this.historyManager.canUndo()
      };
      this.renderer.drawButton(buttonWithState);
    }
    
    if (this.showSettings) {
      const settings = this.audioManager.getSettings();
      this.settingsPanelElements = this.renderer.drawSettingsPanel(settings);
    }
    
    if (this.showWinPanel) {
      this.winPanelElements = this.renderer.drawWinPanel(this.currentLevel);
    }
  }
}

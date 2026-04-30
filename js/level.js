import config from './config.js';
import Utils from './utils.js';

export default class Level {
  constructor(levelNumber) {
    this.levelNumber = levelNumber;
    this.bottles = [];
    this.init();
  }

  init() {
    const difficulty = Math.min(this.levelNumber, 10);
    const colorCount = Math.min(3 + Math.floor(difficulty / 2), config.colors.length);
    const bottleCount = colorCount + Math.min(Math.floor(difficulty / 3), 3);
    
    this.generateLevel(colorCount, bottleCount);
  }

  generateLevel(colorCount, bottleCount) {
    const colors = config.colors.slice(0, colorCount);
    const liquidsPerColor = config.bottleCapacity;
    
    let allLiquids = [];
    colors.forEach(color => {
      for (let i = 0; i < liquidsPerColor; i++) {
        allLiquids.push(color);
      }
    });
    
    allLiquids = Utils.shuffleArray(allLiquids);
    
    this.bottles = [];
    let liquidIndex = 0;
    
    for (let i = 0; i < bottleCount; i++) {
      const bottleLiquids = [];
      
      if (i < colorCount) {
        for (let j = 0; j < config.bottleCapacity && liquidIndex < allLiquids.length; j++) {
          bottleLiquids.push(allLiquids[liquidIndex]);
          liquidIndex++;
        }
      }
      
      this.bottles.push({
        id: i,
        liquids: bottleLiquids
      });
    }
    
    this.ensureSolvability();
  }

  ensureSolvability() {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!this.isSolvable() && attempts < maxAttempts) {
      this.bottles.forEach(bottle => {
        if (bottle.liquids.length > 1) {
          const i = Math.floor(Math.random() * bottle.liquids.length);
          const j = Math.floor(Math.random() * bottle.liquids.length);
          [bottle.liquids[i], bottle.liquids[j]] = [bottle.liquids[j], bottle.liquids[i]];
        }
      });
      attempts++;
    }
  }

  isSolvable() {
    const colorGroups = {};
    
    this.bottles.forEach(bottle => {
      bottle.liquids.forEach((color, index) => {
        if (!colorGroups[color]) {
          colorGroups[color] = [];
        }
        colorGroups[color].push({
          bottleId: bottle.id,
          position: index,
          onTop: index === bottle.liquids.length - 1
        });
      });
    });
    
    for (const color in colorGroups) {
      const positions = colorGroups[color];
      const onTopCount = positions.filter(p => p.onTop).length;
      
      if (onTopCount === 0 && positions.length > 0) {
        return false;
      }
    }
    
    return true;
  }

  getBottleData() {
    return this.bottles;
  }

  static getMaxLevel() {
    return 50;
  }
}

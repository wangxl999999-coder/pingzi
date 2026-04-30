import config from './config.js';
import Utils from './utils.js';

export default class Level {
  constructor(levelNumber) {
    this.levelNumber = levelNumber;
    this.bottles = [];
    this.init();
  }

  init() {
    const difficulty = Math.min(this.levelNumber, 20);
    
    const colorCount = Math.min(2 + Math.floor(difficulty / 2), config.colors.length);
    
    const emptyBottleCount = Math.min(1 + Math.floor(difficulty / 5), 3);
    
    const bottleCount = colorCount + emptyBottleCount;
    
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
        for (let j = 0; j < liquidsPerColor && liquidIndex < allLiquids.length; j++) {
          bottleLiquids.push(allLiquids[liquidIndex]);
          liquidIndex++;
        }
      }
      
      this.bottles.push({
        id: i,
        liquids: bottleLiquids
      });
    }
    
    this.ensureNotSolved();
    this.ensureSolvability();
  }

  ensureNotSolved() {
    let isSolved = true;
    
    for (const bottle of this.bottles) {
      if (bottle.liquids.length === 0) continue;
      
      const color = bottle.liquids[0];
      if (!bottle.liquids.every(c => c === color) || bottle.liquids.length !== config.bottleCapacity) {
        isSolved = false;
        break;
      }
    }
    
    if (isSolved) {
      this.randomizeLiquids();
    }
  }

  randomizeLiquids() {
    const nonEmptyBottles = this.bottles.filter(b => b.liquids.length > 0);
    if (nonEmptyBottles.length < 2) return;
    
    for (let attempt = 0; attempt < 10; attempt++) {
      const bottle1 = nonEmptyBottles[Math.floor(Math.random() * nonEmptyBottles.length)];
      const bottle2 = nonEmptyBottles[Math.floor(Math.random() * nonEmptyBottles.length)];
      
      if (bottle1 === bottle2 || bottle1.liquids.length === 0 || bottle2.liquids.length === 0) continue;
      
      const idx1 = Math.floor(Math.random() * bottle1.liquids.length);
      const idx2 = Math.floor(Math.random() * bottle2.liquids.length);
      
      [bottle1.liquids[idx1], bottle2.liquids[idx2]] = [bottle2.liquids[idx2], bottle1.liquids[idx1]];
      
      let stillSolved = true;
      for (const bottle of this.bottles) {
        if (bottle.liquids.length === 0) continue;
        const color = bottle.liquids[0];
        if (!bottle.liquids.every(c => c === color) || bottle.liquids.length !== config.bottleCapacity) {
          stillSolved = false;
          break;
        }
      }
      
      if (!stillSolved) break;
    }
  }

  ensureSolvability() {
    if (this.isSolvable()) return;
    
    const nonEmptyBottles = this.bottles.filter(b => b.liquids.length > 0);
    const colors = [...new Set(nonEmptyBottles.flatMap(b => b.liquids))];
    
    for (const color of colors) {
      const bottlesWithColor = nonEmptyBottles.filter(b => b.liquids.includes(color));
      
      let hasColorOnTop = bottlesWithColor.some(b => {
        const topIndex = b.liquids.length - 1;
        return b.liquids[topIndex] === color;
      });
      
      if (!hasColorOnTop && bottlesWithColor.length > 0) {
        const bottle = bottlesWithColor[0];
        const colorIndex = bottle.liquids.indexOf(color);
        const topIndex = bottle.liquids.length - 1;
        
        [bottle.liquids[colorIndex], bottle.liquids[topIndex]] = [bottle.liquids[topIndex], bottle.liquids[colorIndex]];
      }
    }
  }

  isSolvable() {
    const nonEmptyBottles = this.bottles.filter(b => b.liquids.length > 0);
    const colors = [...new Set(nonEmptyBottles.flatMap(b => b.liquids))];
    
    for (const color of colors) {
      let hasAccessible = false;
      
      for (const bottle of nonEmptyBottles) {
        const topIndex = bottle.liquids.length - 1;
        if (bottle.liquids[topIndex] === color) {
          hasAccessible = true;
          break;
        }
      }
      
      if (!hasAccessible) {
        return false;
      }
    }
    
    return true;
  }

  getBottleData() {
    return this.bottles;
  }

  static getMaxLevel() {
    return 100;
  }
}

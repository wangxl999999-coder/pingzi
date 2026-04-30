export default class HistoryManager {
  constructor(maxHistory = 50) {
    this.history = [];
    this.maxHistory = maxHistory;
  }

  saveState(bottles) {
    const state = bottles.map(bottle => ({
      id: bottle.id,
      x: bottle.x,
      y: bottle.y,
      liquids: [...bottle.liquids]
    }));
    
    this.history.push(state);
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  undo() {
    if (this.history.length === 0) {
      return null;
    }
    
    return this.history.pop();
  }

  canUndo() {
    return this.history.length > 0;
  }

  clear() {
    this.history = [];
  }

  getHistoryCount() {
    return this.history.length;
  }
}

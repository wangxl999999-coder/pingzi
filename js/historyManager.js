export default class HistoryManager {
  constructor(maxHistory = 50) {
    this.history = [];
    this.maxHistory = maxHistory;
  }

  saveState(state) {
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

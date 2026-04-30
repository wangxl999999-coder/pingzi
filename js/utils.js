export default class Utils {
  static shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static isPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }
}

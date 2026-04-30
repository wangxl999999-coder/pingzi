import config from './config.js';

export default class Bottle {
  constructor(id, x, y, liquids = []) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = config.bottleWidth;
    this.height = config.bottleHeight;
    this.liquids = liquids;
    this.capacity = config.bottleCapacity;
    this.selected = false;
    this.disappearing = false;
    this.opacity = 1;
    this.rotation = 0;
    this.scale = 1;
  }

  get isEmpty() {
    return this.liquids.length === 0;
  }

  get isFull() {
    return this.liquids.length === this.capacity;
  }

  get topLiquid() {
    if (this.isEmpty) return null;
    return this.liquids[this.liquids.length - 1];
  }

  get isMonochromatic() {
    if (this.isEmpty) return false;
    const color = this.liquids[0];
    return this.liquids.every(liquid => liquid === color);
  }

  get isCompleted() {
    return this.isFull && this.isMonochromatic;
  }

  get availableSpace() {
    return this.capacity - this.liquids.length;
  }

  canPourTo(targetBottle) {
    if (this === targetBottle) return false;
    if (this.isEmpty) return false;
    if (targetBottle.isFull) return false;
    if (targetBottle.isEmpty) return true;
    return this.topLiquid === targetBottle.topLiquid;
  }

  pourTo(targetBottle) {
    if (!this.canPourTo(targetBottle)) return false;

    const pourCount = Math.min(
      this.liquids.length,
      targetBottle.availableSpace
    );

    let actualPourCount = 0;
    for (let i = 0; i < pourCount; i++) {
      const liquidToPour = this.liquids[this.liquids.length - 1 - i];
      if (targetBottle.isEmpty || liquidToPour === targetBottle.topLiquid) {
        actualPourCount++;
      } else {
        break;
      }
    }

    if (actualPourCount === 0) return false;

    const pouredLiquids = this.liquids.splice(-actualPourCount);
    targetBottle.liquids.push(...pouredLiquids);

    return {
      pouredLiquids,
      fromBottleId: this.id,
      toBottleId: targetBottle.id
    };
  }

  addLiquid(color) {
    if (this.isFull) return false;
    this.liquids.push(color);
    return true;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
}

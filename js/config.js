export default {
  // 游戏配置
  canvasWidth: 375,
  canvasHeight: 667,
  
  // 瓶子配置
  bottleWidth: 60,
  bottleHeight: 150,
  bottleCapacity: 4,
  bottleCornerRadius: 8,
  
  // 液体配置
  liquidHeight: 35,
  
  // 颜色配置
  colors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#82E0AA'
  ],
  
  // 动画配置
  pourDuration: 300,
  disappearDuration: 500,
  
  // 音效配置
  sounds: {
    pour: 'sounds/pour.mp3',
    complete: 'sounds/complete.mp3',
    disappear: 'sounds/disappear.mp3',
    click: 'sounds/click.mp3'
  },
  
  // 初始设置
  defaultSettings: {
    soundEnabled: true,
    vibrationEnabled: true
  }
};

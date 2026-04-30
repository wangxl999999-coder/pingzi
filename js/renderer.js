import config from './config.js';

export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawBottle(bottle) {
    const { x, y, width, height, liquids, selected, opacity, rotation, scale } = bottle;
    
    this.ctx.save();
    
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(rotation * Math.PI / 180);
    this.ctx.scale(scale, scale);
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(-centerX, -centerY);
    
    this.drawGlass(x, y, width, height, selected);
    this.drawLiquids(x, y, width, height, liquids);
    
    this.ctx.restore();
  }

  drawGlass(x, y, width, height, selected) {
    const ctx = this.ctx;
    const cornerRadius = config.bottleCornerRadius;
    
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + width - cornerRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
    ctx.lineTo(x + width, y + height - cornerRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
    ctx.lineTo(x + cornerRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();
    
    ctx.fillStyle = selected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    
    ctx.strokeStyle = selected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = selected ? 3 : 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y);
    ctx.lineTo(x + width * 0.2, y + height * 0.1);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawLiquids(x, y, width, height, liquids) {
    if (liquids.length === 0) return;
    
    const ctx = this.ctx;
    const liquidHeight = config.liquidHeight;
    const padding = 4;
    const liquidWidth = width - padding * 2;
    const cornerRadius = 4;
    
    liquids.forEach((color, index) => {
      const liquidY = y + height - (index + 1) * liquidHeight - padding;
      
      ctx.beginPath();
      ctx.roundRect(
        x + padding,
        liquidY,
        liquidWidth,
        liquidHeight,
        [
          index === liquids.length - 1 ? cornerRadius : 0,
          index === liquids.length - 1 ? cornerRadius : 0,
          index === 0 ? cornerRadius : 0,
          index === 0 ? cornerRadius : 0
        ]
      );
      ctx.fillStyle = color;
      ctx.fill();
      
      ctx.beginPath();
      ctx.roundRect(
        x + padding,
        liquidY,
        liquidWidth,
        liquidHeight / 3,
        [
          index === liquids.length - 1 ? cornerRadius : 0,
          index === liquids.length - 1 ? cornerRadius : 0,
          0,
          0
        ]
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    });
  }

  drawButton(button) {
    const { x, y, width, height, text, color, textColor, disabled } = button;
    
    const ctx = this.ctx;
    
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    
    if (disabled) {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    } else {
      ctx.fillStyle = color || '#4CAF50';
    }
    ctx.fill();
    
    ctx.strokeStyle = disabled ? 'rgba(150, 150, 150, 0.5)' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = disabled ? 'rgba(200, 200, 200, 0.5)' : (textColor || '#ffffff');
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
  }

  drawText(text, x, y, options = {}) {
    const ctx = this.ctx;
    const { fontSize = 20, color = '#ffffff', textAlign = 'center', textBaseline = 'middle' } = options;
    
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillText(text, x, y);
  }

  drawLevelInfo(level, moves) {
    this.drawText(`第 ${level} 关`, this.width / 2, 40, { fontSize: 24 });
    this.drawText(`步数: ${moves}`, this.width / 2, 70, { fontSize: 16, color: '#aaaaaa' });
  }

  drawSettingsPanel(settings) {
    const ctx = this.ctx;
    const panelWidth = 280;
    const panelHeight = 200;
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 12);
    ctx.fillStyle = '#1e3a5f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    this.drawText('设置', this.width / 2, panelY + 30, { fontSize: 20 });
    
    this.drawSettingToggle('音效', settings.soundEnabled, panelX + 30, panelY + 70);
    this.drawSettingToggle('震动', settings.vibrationEnabled, panelX + 30, panelY + 120);
    
    const closeBtn = {
      x: panelX + panelWidth / 2 - 50,
      y: panelY + panelHeight - 50,
      width: 100,
      height: 35,
      text: '关闭',
      color: '#e74c3c'
    };
    this.drawButton(closeBtn);
    
    return {
      soundToggle: { x: panelX + 180, y: panelY + 60, width: 60, height: 30 },
      vibrationToggle: { x: panelX + 180, y: panelY + 110, width: 60, height: 30 },
      closeButton: closeBtn
    };
  }

  drawSettingToggle(label, isOn, x, y) {
    const ctx = this.ctx;
    
    this.drawText(label, x + 20, y + 15, { fontSize: 16, textAlign: 'left' });
    
    const toggleX = x + 150;
    const toggleWidth = 60;
    const toggleHeight = 30;
    
    ctx.beginPath();
    ctx.roundRect(toggleX, y, toggleWidth, toggleHeight, 15);
    ctx.fillStyle = isOn ? '#4CAF50' : '#666666';
    ctx.fill();
    
    const knobX = isOn ? toggleX + toggleWidth - 25 : toggleX + 5;
    ctx.beginPath();
    ctx.arc(knobX + 10, y + 15, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  drawWinPanel(level) {
    const ctx = this.ctx;
    const panelWidth = 280;
    const panelHeight = 180;
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 12);
    ctx.fillStyle = '#1e3a5f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    this.drawText('🎉 恭喜通关！', this.width / 2, panelY + 40, { fontSize: 22 });
    this.drawText(`第 ${level} 关完成`, this.width / 2, panelY + 75, { fontSize: 16, color: '#aaaaaa' });
    
    const nextBtn = {
      x: panelX + 20,
      y: panelY + 110,
      width: 100,
      height: 40,
      text: '下一关',
      color: '#4CAF50'
    };
    this.drawButton(nextBtn);
    
    const replayBtn = {
      x: panelX + panelWidth - 120,
      y: panelY + 110,
      width: 100,
      height: 40,
      text: '重玩',
      color: '#3498db'
    };
    this.drawButton(replayBtn);
    
    return {
      nextButton: nextBtn,
      replayButton: replayBtn
    };
  }
}

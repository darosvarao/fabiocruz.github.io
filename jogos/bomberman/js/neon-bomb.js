// BOMBERMAN NEON - BOMB SYSTEM

class NeonBomb {
    constructor(x, y, size, range) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.size = size;
        this.range = range;
        
        // Timer
        this.timer = 3000; // 3 seconds
        this.maxTimer = 3000;
        
        // Animation
        this.pulseScale = 1;
        this.pulseDirection = 1;
        this.glowIntensity = 0;
        
        // Visual effects
        this.sparkles = [];
        this.createSparkles();
        
        this.loadSprite();
    }
    
    loadSprite() {
        // Create fallback sprite
        this.sprite = this.createFallbackSprite();
        
        // Try to load actual sprite
        const img = new Image();
        img.onload = () => {
            this.sprite = img;
            console.log('Bomb sprite loaded');
        };
        img.onerror = () => {
            console.log('Using fallback bomb sprite');
        };
        img.src = 'assets/sprites/items/bomb_neon.png';
    }
    
    createFallbackSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;
        const ctx = canvas.getContext('2d');
        
        // Main bomb body
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        const radius = this.size / 3;
        
        // Dark metallic base
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Neon core
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Circuit patterns
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Fuse
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX, centerY - radius - 8);
        ctx.stroke();
        
        return canvas;
    }
    
    createSparkles() {
        for (let i = 0; i < 5; i++) {
            this.sparkles.push({
                x: Math.random() * this.size,
                y: Math.random() * this.size,
                life: Math.random() * 100,
                maxLife: 100,
                color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff'
            });
        }
    }
    
    update() {
        this.timer -= 16; // Assuming 60 FPS
        
        // Update pulse animation
        this.pulseScale += this.pulseDirection * 0.02;
        if (this.pulseScale >= 1.3) {
            this.pulseScale = 1.3;
            this.pulseDirection = -1;
        } else if (this.pulseScale <= 0.8) {
            this.pulseScale = 0.8;
            this.pulseDirection = 1;
        }
        
        // Update glow intensity based on timer
        const timeRatio = 1 - (this.timer / this.maxTimer);
        this.glowIntensity = timeRatio;
        
        // Update sparkles
        this.sparkles.forEach(sparkle => {
            sparkle.life -= 2;
            if (sparkle.life <= 0) {
                sparkle.life = sparkle.maxLife;
                sparkle.x = Math.random() * this.size;
                sparkle.y = Math.random() * this.size;
            }
        });
        
        // Increase pulse speed as timer decreases
        if (this.timer < 1000) {
            this.pulseDirection *= 1.1;
        }
    }
    
    shouldExplode() {
        return this.timer <= 0;
    }
    
    render(ctx) {
        ctx.save();
        
        // Move to bomb center for scaling
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.scale(this.pulseScale, this.pulseScale);
        ctx.translate(-this.width / 2, -this.height / 2);
        
        // Add glow effect
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 20 * this.glowIntensity;
        
        // Draw bomb sprite
        if (this.sprite) {
            ctx.drawImage(this.sprite, 0, 0, this.width, this.height);
        } else {
            // Fallback rendering
            this.renderFallback(ctx);
        }
        
        ctx.restore();
        
        // Render sparkles
        this.renderSparkles(ctx);
        
        // Render timer indicator
        this.renderTimer(ctx);
        
        // Add warning effect when about to explode
        if (this.timer < 1000) {
            this.renderWarning(ctx);
        }
    }
    
    renderFallback(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = this.width / 3;
        
        // Main body
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Neon core
        const coreIntensity = 0.5 + (this.glowIntensity * 0.5);
        ctx.fillStyle = `rgba(255, 0, 255, ${coreIntensity})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Circuit ring
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    renderSparkles(ctx) {
        this.sparkles.forEach(sparkle => {
            const alpha = sparkle.life / sparkle.maxLife;
            ctx.save();
            
            ctx.fillStyle = sparkle.color;
            ctx.globalAlpha = alpha;
            ctx.shadowColor = sparkle.color;
            ctx.shadowBlur = 5;
            
            ctx.fillRect(
                this.x + sparkle.x - 1,
                this.y + sparkle.y - 1,
                2, 2
            );
            
            ctx.restore();
        });
    }
    
    renderTimer(ctx) {
        // Timer bar above bomb
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Timer fill
        const fillWidth = (this.timer / this.maxTimer) * barWidth;
        const color = this.timer > 1500 ? '#00ff00' : this.timer > 500 ? '#ffff00' : '#ff0000';
        
        ctx.fillStyle = color;
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        ctx.shadowBlur = 0;
    }
    
    renderWarning(ctx) {
        // Flashing warning effect
        const flash = Math.sin(Date.now() * 0.02) > 0;
        if (flash) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
            
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 10;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
            
            ctx.restore();
        }
    }
}


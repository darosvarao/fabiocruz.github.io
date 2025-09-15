// BOMBERMAN NEON - POWERUP SYSTEM

class NeonPowerup {
    constructor(x, y, size, type) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.size = size;
        this.type = type; // 'speed', 'bomb', 'range'
        
        // Animation
        this.floatOffset = 0;
        this.floatSpeed = 0.05;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.02;
        this.pulseScale = 1;
        this.pulseDirection = 1;
        
        // Visual effects
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.particles = [];
        
        this.createParticles();
        this.loadSprite();
    }
    
    loadSprite() {
        // Create fallback sprite
        this.sprite = this.createFallbackSprite();
        
        // Try to load actual sprite (if exists)
        const img = new Image();
        img.onload = () => {
            this.sprite = img;
            console.log('Powerup sprite loaded:', this.type);
        };
        img.onerror = () => {
            console.log('Using fallback powerup sprite:', this.type);
        };
        img.src = `assets/sprites/items/${this.type}_powerup_neon.png`;
    }
    
    createFallbackSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;
        const ctx = canvas.getContext('2d');
        
        const colors = this.getTypeColors();
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        
        // Base shape
        ctx.fillStyle = colors.base;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Neon outline
        ctx.strokeStyle = colors.glow;
        ctx.lineWidth = 3;
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.size / 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Type-specific icon
        this.drawTypeIcon(ctx, centerX, centerY, colors);
        
        return canvas;
    }
    
    getTypeColors() {
        switch (this.type) {
            case 'speed':
                return {
                    base: '#001a33',
                    glow: '#00ffff',
                    icon: '#ffffff'
                };
            case 'bomb':
                return {
                    base: '#330033',
                    glow: '#ff00ff',
                    icon: '#ffffff'
                };
            case 'range':
                return {
                    base: '#1a3300',
                    glow: '#00ff00',
                    icon: '#ffffff'
                };
            default:
                return {
                    base: '#333333',
                    glow: '#ffffff',
                    icon: '#000000'
                };
        }
    }
    
    drawTypeIcon(ctx, centerX, centerY, colors) {
        ctx.fillStyle = colors.icon;
        ctx.strokeStyle = colors.icon;
        ctx.lineWidth = 2;
        
        switch (this.type) {
            case 'speed':
                // Lightning bolt
                ctx.beginPath();
                ctx.moveTo(centerX - 5, centerY - 8);
                ctx.lineTo(centerX + 2, centerY - 2);
                ctx.lineTo(centerX - 2, centerY - 2);
                ctx.lineTo(centerX + 5, centerY + 8);
                ctx.lineTo(centerX - 2, centerY + 2);
                ctx.lineTo(centerX + 2, centerY + 2);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'bomb':
                // Bomb icon
                ctx.beginPath();
                ctx.arc(centerX, centerY + 2, 6, 0, Math.PI * 2);
                ctx.fill();
                // Fuse
                ctx.beginPath();
                ctx.moveTo(centerX - 3, centerY - 4);
                ctx.lineTo(centerX - 6, centerY - 8);
                ctx.stroke();
                break;
                
            case 'range':
                // Explosion rays
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI * 2) / 8;
                    const x1 = centerX + Math.cos(angle) * 4;
                    const y1 = centerY + Math.sin(angle) * 4;
                    const x2 = centerX + Math.cos(angle) * 8;
                    const y2 = centerY + Math.sin(angle) * 8;
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
                break;
        }
    }
    
    createParticles() {
        const colors = this.getTypeColors();
        
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                angle: (i * Math.PI * 2) / 8,
                distance: 20 + Math.random() * 10,
                speed: 0.02 + Math.random() * 0.02,
                life: Math.random(),
                maxLife: 1,
                color: colors.glow
            });
        }
    }
    
    update() {
        // Float animation
        this.floatOffset += this.floatSpeed;
        
        // Rotation animation
        this.rotationAngle += this.rotationSpeed;
        
        // Pulse animation
        this.pulseScale += this.pulseDirection * 0.01;
        if (this.pulseScale >= 1.2) {
            this.pulseScale = 1.2;
            this.pulseDirection = -1;
        } else if (this.pulseScale <= 0.8) {
            this.pulseScale = 0.8;
            this.pulseDirection = 1;
        }
        
        // Glow animation
        this.glowIntensity += this.glowDirection * 0.03;
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
        
        // Update particles
        this.particles.forEach(particle => {
            particle.angle += particle.speed;
            particle.life -= 0.01;
            if (particle.life <= 0) {
                particle.life = particle.maxLife;
            }
        });
    }
    
    render(ctx) {
        ctx.save();
        
        // Calculate floating position
        const floatY = this.y + Math.sin(this.floatOffset) * 3;
        
        // Move to powerup center for transformations
        const centerX = this.x + this.width / 2;
        const centerY = floatY + this.height / 2;
        
        // Render particles
        this.renderParticles(ctx, centerX, centerY);
        
        // Apply transformations
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotationAngle);
        ctx.scale(this.pulseScale, this.pulseScale);
        
        // Add glow effect
        const colors = this.getTypeColors();
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 15 + (this.glowIntensity * 10);
        
        // Draw powerup sprite
        if (this.sprite) {
            ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // Fallback rendering
            this.renderFallback(ctx, colors);
        }
        
        ctx.restore();
        
        // Render type indicator
        this.renderTypeIndicator(ctx, centerX, centerY);
    }
    
    renderFallback(ctx, colors) {
        // Base circle
        ctx.fillStyle = colors.base;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Neon outline
        ctx.strokeStyle = colors.glow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner glow
        ctx.fillStyle = colors.glow;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    renderParticles(ctx, centerX, centerY) {
        this.particles.forEach(particle => {
            const x = centerX + Math.cos(particle.angle) * particle.distance;
            const y = centerY + Math.sin(particle.angle) * particle.distance;
            
            ctx.save();
            ctx.globalAlpha = particle.life * 0.7;
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 5;
            
            ctx.fillRect(x - 1, y - 1, 2, 2);
            
            ctx.restore();
        });
    }
    
    renderTypeIndicator(ctx, centerX, centerY) {
        // Type name below powerup
        ctx.save();
        
        const colors = this.getTypeColors();
        ctx.fillStyle = colors.glow;
        ctx.font = '8px Courier New';
        ctx.textAlign = 'center';
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 5;
        
        const typeName = this.getTypeName();
        ctx.fillText(typeName, centerX, centerY + this.height / 2 + 15);
        
        ctx.restore();
    }
    
    getTypeName() {
        switch (this.type) {
            case 'speed': return 'SPEED';
            case 'bomb': return 'BOMB+';
            case 'range': return 'RANGE';
            default: return 'POWER';
        }
    }
    
    // Collision detection
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}


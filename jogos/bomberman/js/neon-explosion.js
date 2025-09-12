// BOMBERMAN NEON - EXPLOSION SYSTEM

class NeonExplosion {
    constructor(x, y, size, type) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.size = size;
        this.type = type; // 'center', 'horizontal', 'vertical', 'end'
        
        // Animation
        this.duration = 500; // 0.5 seconds
        this.maxDuration = 500;
        this.scale = 0;
        this.intensity = 1;
        
        // Particles
        this.particles = [];
        this.createParticles();
        
        // Colors
        this.colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#80ff00'];
        this.currentColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    
    createParticles() {
        const particleCount = this.type === 'center' ? 20 : 10;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.size / 2,
                y: this.size / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                size: 2 + Math.random() * 3,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }
    
    update() {
        this.duration -= 16; // Assuming 60 FPS
        
        const progress = 1 - (this.duration / this.maxDuration);
        
        // Scale animation
        if (progress < 0.3) {
            this.scale = progress / 0.3;
        } else if (progress < 0.7) {
            this.scale = 1;
        } else {
            this.scale = 1 - ((progress - 0.7) / 0.3);
        }
        
        // Intensity animation
        this.intensity = 1 - progress;
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.vx *= 0.98; // Friction
            particle.vy *= 0.98;
        });
        
        // Remove dead particles
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    isFinished() {
        return this.duration <= 0;
    }
    
    render(ctx) {
        ctx.save();
        
        // Move to explosion center
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Render main explosion
        this.renderMainExplosion(ctx, centerX, centerY);
        
        // Render particles
        this.renderParticles(ctx);
        
        // Render shockwave
        this.renderShockwave(ctx, centerX, centerY);
        
        ctx.restore();
    }
    
    renderMainExplosion(ctx, centerX, centerY) {
        const size = this.size * this.scale;
        
        // Multiple layers for depth
        for (let layer = 0; layer < 3; layer++) {
            const layerSize = size * (1 - layer * 0.2);
            const layerAlpha = this.intensity * (1 - layer * 0.3);
            
            ctx.save();
            ctx.globalAlpha = layerAlpha;
            
            // Glow effect
            ctx.shadowColor = this.currentColor;
            ctx.shadowBlur = 20 + layer * 10;
            
            if (this.type === 'center') {
                this.renderCenterExplosion(ctx, centerX, centerY, layerSize);
            } else if (this.type === 'horizontal') {
                this.renderHorizontalExplosion(ctx, centerX, centerY, layerSize);
            } else if (this.type === 'vertical') {
                this.renderVerticalExplosion(ctx, centerX, centerY, layerSize);
            } else if (this.type === 'end') {
                this.renderEndExplosion(ctx, centerX, centerY, layerSize);
            }
            
            ctx.restore();
        }
    }
    
    renderCenterExplosion(ctx, centerX, centerY, size) {
        // Star-like explosion
        ctx.fillStyle = this.currentColor;
        ctx.beginPath();
        
        const spikes = 8;
        const outerRadius = size / 2;
        const innerRadius = outerRadius * 0.5;
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    renderHorizontalExplosion(ctx, centerX, centerY, size) {
        // Horizontal beam
        ctx.fillStyle = this.currentColor;
        ctx.fillRect(
            centerX - size / 2,
            centerY - size / 6,
            size,
            size / 3
        );
        
        // Add jagged edges
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const x = centerX - size / 2 + (i * size / 4);
            const y1 = centerY - size / 6 - Math.random() * 5;
            const y2 = centerY + size / 6 + Math.random() * 5;
            
            ctx.moveTo(x, y1);
            ctx.lineTo(x + size / 8, centerY);
            ctx.lineTo(x + size / 4, y2);
        }
        ctx.fill();
    }
    
    renderVerticalExplosion(ctx, centerX, centerY, size) {
        // Vertical beam
        ctx.fillStyle = this.currentColor;
        ctx.fillRect(
            centerX - size / 6,
            centerY - size / 2,
            size / 3,
            size
        );
        
        // Add jagged edges
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const y = centerY - size / 2 + (i * size / 4);
            const x1 = centerX - size / 6 - Math.random() * 5;
            const x2 = centerX + size / 6 + Math.random() * 5;
            
            ctx.moveTo(x1, y);
            ctx.lineTo(centerX, y + size / 8);
            ctx.lineTo(x2, y + size / 4);
        }
        ctx.fill();
    }
    
    renderEndExplosion(ctx, centerX, centerY, size) {
        // Diamond-like end explosion
        ctx.fillStyle = this.currentColor;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size / 2);
        ctx.lineTo(centerX + size / 3, centerY);
        ctx.lineTo(centerX, centerY + size / 2);
        ctx.lineTo(centerX - size / 3, centerY);
        ctx.closePath();
        ctx.fill();
    }
    
    renderParticles(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 5;
            
            ctx.fillRect(
                this.x + particle.x - particle.size / 2,
                this.y + particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
            
            ctx.restore();
        });
    }
    
    renderShockwave(ctx, centerX, centerY) {
        if (this.scale > 0.5) {
            const waveRadius = this.size * this.scale * 1.5;
            const waveAlpha = this.intensity * 0.3;
            
            ctx.save();
            ctx.globalAlpha = waveAlpha;
            ctx.strokeStyle = this.currentColor;
            ctx.lineWidth = 3;
            ctx.shadowColor = this.currentColor;
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }
}


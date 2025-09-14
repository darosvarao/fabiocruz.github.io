// BOMBERMAN NEON - PLAYER SYSTEM

class NeonPlayer {
    constructor(x, y, size, character) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.size = size;
        this.character = character;
        
        // Movement
        this.speed = 3;
        this.direction = { x: 0, y: 0 };
        this.moving = false;
        
        // Abilities
        this.maxBombs = 1;
        this.bombRange = 2;
        
        // Animation
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.lastDirection = 'down';
        
        // Visual effects
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
        this.loadSprite();
    }
    
    loadSprite() {
        // Create fallback sprite with neon effect
        this.sprite = this.createFallbackSprite();
        
        // Try to load actual sprite
        const img = new Image();
        img.onload = () => {
            this.sprite = img;
            console.log('Player sprite loaded:', this.character);
        };
        img.onerror = () => {
            console.log('Using fallback sprite for:', this.character);
        };
        img.src = `assets/sprites/characters/${this.character}_neon.png`;
    }
    
    createFallbackSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;
        const ctx = canvas.getContext('2d');
        
        // Character-specific colors
        let colors = this.getCharacterColors();
        
        // Body
        ctx.fillStyle = colors.body;
        ctx.fillRect(8, 8, this.size - 16, this.size - 16);
        
        // Neon outline
        ctx.strokeStyle = colors.glow;
        ctx.lineWidth = 3;
        ctx.strokeRect(6, 6, this.size - 12, this.size - 12);
        
        // Eyes
        ctx.fillStyle = colors.eyes;
        ctx.fillRect(12, 12, 4, 4);
        ctx.fillRect(this.size - 16, 12, 4, 4);
        
        // Add glow effect
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 10;
        ctx.strokeRect(6, 6, this.size - 12, this.size - 12);
        ctx.shadowBlur = 0;
        
        return canvas;
    }
    
    getCharacterColors() {
        switch (this.character) {
            case 'axol':
                return {
                    body: '#666666',
                    glow: '#00ffff',
                    eyes: '#00ffff'
                };
            case 'bisou':
                return {
                    body: '#2a2a2a',
                    glow: '#ff00ff',
                    eyes: '#00ffff'
                };
            case 'pepeca':
                return {
                    body: '#1a1a1a',
                    glow: '#00ff00',
                    eyes: '#ff8800'
                };
            default:
                return {
                    body: '#666666',
                    glow: '#00ffff',
                    eyes: '#ffffff'
                };
        }
    }
    
    setDirection(direction, pressed) {
        switch (direction) {
            case 'up':
                this.direction.y = pressed ? -1 : 0;
                if (pressed) this.lastDirection = 'up';
                break;
            case 'down':
                this.direction.y = pressed ? 1 : 0;
                if (pressed) this.lastDirection = 'down';
                break;
            case 'left':
                this.direction.x = pressed ? -1 : 0;
                if (pressed) this.lastDirection = 'left';
                break;
            case 'right':
                this.direction.x = pressed ? 1 : 0;
                if (pressed) this.lastDirection = 'right';
                break;
        }
        
        this.moving = this.direction.x !== 0 || this.direction.y !== 0;
    }
    
    update(map) {
        if (!this.moving) return;
        
        // Calculate new position
        const newX = this.x + (this.direction.x * this.speed);
        const newY = this.y + (this.direction.y * this.speed);
        
        // Check collision with map
        if (this.canMoveTo(newX, newY, map)) {
            this.x = newX;
            this.y = newY;
        }
        
        // Update animation
        if (this.moving) {
            this.animationFrame += this.animationSpeed;
            if (this.animationFrame >= 4) {
                this.animationFrame = 0;
            }
        }
        
        // Update glow effect
        this.glowIntensity += this.glowDirection * 0.05;
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
    }
    
    canMoveTo(newX, newY, map) {
        if (!map) return true;
        
        const margin = 4; // Collision margin
        
        // Check corners of the player
        const corners = [
            { x: newX + margin, y: newY + margin },
            { x: newX + this.width - margin, y: newY + margin },
            { x: newX + margin, y: newY + this.height - margin },
            { x: newX + this.width - margin, y: newY + this.height - margin }
        ];
        
        for (let corner of corners) {
            const gridX = Math.floor(corner.x / this.size);
            const gridY = Math.floor(corner.y / this.size);
            
            if (map.isWall(gridX, gridY)) {
                return false;
            }
        }
        
        return true;
    }
    
    render(ctx) {
        // Save context
        ctx.save();
        
        // Add glow effect
        const colors = this.getCharacterColors();
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 10 + (this.glowIntensity * 10);
        
        // Draw sprite
        if (this.sprite) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback rendering
            ctx.fillStyle = colors.body;
            ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
            
            ctx.strokeStyle = colors.glow;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        }
        
        // Add movement trail effect
        if (this.moving) {
            ctx.shadowBlur = 20;
            ctx.globalAlpha = 0.3;
            ctx.drawImage(this.sprite || this.createFallbackSprite(), 
                         this.x - (this.direction.x * 5), 
                         this.y - (this.direction.y * 5), 
                         this.width, this.height);
            ctx.globalAlpha = 1;
        }
        
        // Restore context
        ctx.restore();
        
        // Add character indicator
        this.renderCharacterIndicator(ctx);
    }
    
    renderCharacterIndicator(ctx) {
        const colors = this.getCharacterColors();
        
        // Character name above player
        ctx.save();
        ctx.fillStyle = colors.glow;
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 5;
        
        const name = this.character.toUpperCase();
        ctx.fillText(name, this.x + this.width/2, this.y - 5);
        
        ctx.restore();
    }
    
    getGridPosition() {
        return {
            x: Math.floor((this.x + this.width/2) / this.size),
            y: Math.floor((this.y + this.height/2) / this.size)
        };
    }
}


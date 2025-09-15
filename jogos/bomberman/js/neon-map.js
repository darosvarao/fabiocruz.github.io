// BOMBERMAN NEON - MAP SYSTEM

class NeonMap {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = [];
        
        this.generateMap();
        this.loadSprites();
    }
    
    generateMap() {
        // Initialize empty map
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = 0; // 0 = empty
            }
        }
        
        // Add border walls (indestructible)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    this.tiles[y][x] = 1; // 1 = solid wall
                }
            }
        }
        
        // Add internal solid walls (grid pattern)
        for (let y = 2; y < this.height - 2; y += 2) {
            for (let x = 2; x < this.width - 2; x += 2) {
                this.tiles[y][x] = 1; // 1 = solid wall
            }
        }
        
        // Add destructible walls randomly
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.tiles[y][x] === 0) {
                    // Don't place walls near starting position
                    if ((x <= 2 && y <= 2) || (x >= this.width - 3 && y >= this.height - 3)) {
                        continue;
                    }
                    
                    if (Math.random() < 0.6) { // 60% chance
                        this.tiles[y][x] = 2; // 2 = destructible wall
                    }
                }
            }
        }
        
        console.log('Map generated:', this.width, 'x', this.height);
    }
    
    loadSprites() {
        // Create colored rectangles as fallback sprites
        this.sprites = {
            empty: this.createColorSprite('#000000'),
            solid: this.createColorSprite('#333333', '#00ffff'),
            destructible: this.createColorSprite('#666666', '#ff00ff')
        };
        
        // Try to load actual sprites
        this.loadActualSprites();
    }
    
    createColorSprite(fillColor, borderColor = null) {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Fill
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Border with neon effect
        if (borderColor) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, this.tileSize - 2, this.tileSize - 2);
            
            // Add glow effect
            ctx.shadowColor = borderColor;
            ctx.shadowBlur = 10;
            ctx.strokeRect(1, 1, this.tileSize - 2, this.tileSize - 2);
            ctx.shadowBlur = 0;
        }
        
        return canvas;
    }
    
    loadActualSprites() {
        // Try to load the neon wall sprite
        const wallImg = new Image();
        wallImg.onload = () => {
            this.sprites.solid = wallImg;
            this.sprites.destructible = wallImg;
            console.log('Wall sprite loaded');
        };
        wallImg.onerror = () => {
            console.log('Using fallback wall sprites');
        };
        wallImg.src = 'assets/sprites/environment/wall_neon.png';
    }
    
    render(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tileType = this.tiles[y][x];
                const drawX = x * this.tileSize;
                const drawY = y * this.tileSize;
                
                switch (tileType) {
                    case 0: // Empty
                        this.renderEmpty(ctx, drawX, drawY);
                        break;
                    case 1: // Solid wall
                        this.renderSolidWall(ctx, drawX, drawY);
                        break;
                    case 2: // Destructible wall
                        this.renderDestructibleWall(ctx, drawX, drawY);
                        break;
                }
            }
        }
    }
    
    renderEmpty(ctx, x, y) {
        // Render subtle grid pattern
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // Add subtle neon grid lines
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
    }
    
    renderSolidWall(ctx, x, y) {
        // Dark metallic base
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // Neon border
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
        
        // Inner details
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
        
        // Circuit pattern
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 8);
        ctx.lineTo(x + this.tileSize - 8, y + 8);
        ctx.moveTo(x + 8, y + this.tileSize - 8);
        ctx.lineTo(x + this.tileSize - 8, y + this.tileSize - 8);
        ctx.stroke();
    }
    
    renderDestructibleWall(ctx, x, y) {
        // Dark base
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        
        // Magenta border
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
        
        // Inner pattern
        ctx.fillStyle = '#444444';
        ctx.fillRect(x + 6, y + 6, this.tileSize - 12, this.tileSize - 12);
        
        // Destructible indicator
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(x + this.tileSize/2 - 2, y + this.tileSize/2 - 2, 4, 4);
        
        // Add glow effect
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 5;
        ctx.fillRect(x + this.tileSize/2 - 2, y + this.tileSize/2 - 2, 4, 4);
        ctx.shadowBlur = 0;
    }
    
    isWall(gridX, gridY) {
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return true;
        }
        return this.tiles[gridY][gridX] === 1 || this.tiles[gridY][gridX] === 2;
    }
    
    isSolidWall(gridX, gridY) {
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return true;
        }
        return this.tiles[gridY][gridX] === 1;
    }
    
    isDestructibleWall(gridX, gridY) {
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return false;
        }
        return this.tiles[gridY][gridX] === 2;
    }
    
    isEmpty(gridX, gridY) {
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return false;
        }
        return this.tiles[gridY][gridX] === 0;
    }
    
    destroyWall(gridX, gridY) {
        if (this.isDestructibleWall(gridX, gridY)) {
            this.tiles[gridY][gridX] = 0;
            console.log('Wall destroyed at:', gridX, gridY);
            return true;
        }
        return false;
    }
    
    areAllDestructibleWallsDestroyed() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x] === 2) {
                    return false;
                }
            }
        }
        return true;
    }
    
    canMoveTo(gridX, gridY) {
        return this.isEmpty(gridX, gridY);
    }
}


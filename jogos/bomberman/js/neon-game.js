// BOMBERMAN NEON - GAME ENGINE

class NeonGame {
    constructor(canvas, selectedCharacter) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.selectedCharacter = selectedCharacter;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // Game objects
        this.player = null;
        this.map = null;
        this.bombs = [];
        this.explosions = [];
        this.powerups = [];
        this.enemies = [];
        
        // Input handling
        this.keys = {};
        
        // Callbacks
        this.onGameOver = null;
        this.onScoreUpdate = null;
        
        // Game settings
        this.tileSize = 40;
        this.mapWidth = 19;
        this.mapHeight = 15;
        
        this.init();
    }
    
    init() {
        // Ajustar canvas
        this.canvas.width = this.mapWidth * this.tileSize;
        this.canvas.height = this.mapHeight * this.tileSize;
        
        // Criar mapa
        this.map = new NeonMap(this.mapWidth, this.mapHeight, this.tileSize);
        
        // Criar jogador
        this.createPlayer();
        
        // Configurar renderização
        this.ctx.imageSmoothingEnabled = false;
        
        console.log('Neon Game initialized');
    }
    
    createPlayer() {
        const startX = 1;
        const startY = 1;
        
        this.player = new NeonPlayer(
            startX * this.tileSize,
            startY * this.tileSize,
            this.tileSize,
            this.selectedCharacter
        );
        
        console.log('Player created:', this.selectedCharacter);
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.gameLoop();
        
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score, this.level, this.lives);
        }
        
        console.log('Game started');
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
        this.gameLoop();
    }
    
    destroy() {
        this.isRunning = false;
        this.isPaused = true;
    }
    
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update player
        if (this.player) {
            this.player.update(this.map);
        }
        
        // Update bombs
        this.bombs = this.bombs.filter(bomb => {
            bomb.update();
            if (bomb.shouldExplode()) {
                this.createExplosion(bomb.x, bomb.y, bomb.range);
                return false;
            }
            return true;
        });
        
        // Update explosions
        this.explosions = this.explosions.filter(explosion => {
            explosion.update();
            return !explosion.isFinished();
        });
        
        // Update powerups
        this.powerups.forEach(powerup => {
            powerup.update();
            if (this.player && this.checkCollision(this.player, powerup)) {
                this.collectPowerup(powerup);
            }
        });
        
        // Check win condition
        if (this.map && this.map.areAllDestructibleWallsDestroyed()) {
            this.nextLevel();
        }
    }
    
    render() {
        // Clear canvas with neon background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add neon grid effect
        this.renderNeonGrid();
        
        // Render map
        if (this.map) {
            this.map.render(this.ctx);
        }
        
        // Render powerups
        this.powerups.forEach(powerup => {
            powerup.render(this.ctx);
        });
        
        // Render player
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Render bombs
        this.bombs.forEach(bomb => {
            bomb.render(this.ctx);
        });
        
        // Render explosions
        this.explosions.forEach(explosion => {
            explosion.render(this.ctx);
        });
        
        // Add neon glow effect
        this.addNeonGlow();
    }
    
    renderNeonGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += this.tileSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    addNeonGlow() {
        // Add subtle glow effect around the canvas
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
        this.ctx.shadowBlur = 0;
    }
    
    handleInput(direction, pressed) {
        this.keys[direction] = pressed;
        
        if (this.player) {
            this.player.setDirection(direction, pressed);
        }
    }
    
    placeBomb() {
        if (!this.player || this.bombs.length >= this.player.maxBombs) return;
        
        const gridX = Math.floor((this.player.x + this.tileSize / 2) / this.tileSize);
        const gridY = Math.floor((this.player.y + this.tileSize / 2) / this.tileSize);
        
        // Check if there's already a bomb at this position
        const existingBomb = this.bombs.find(bomb => 
            Math.floor(bomb.x / this.tileSize) === gridX && 
            Math.floor(bomb.y / this.tileSize) === gridY
        );
        
        if (existingBomb) return;
        
        const bomb = new NeonBomb(
            gridX * this.tileSize,
            gridY * this.tileSize,
            this.tileSize,
            this.player.bombRange
        );
        
        this.bombs.push(bomb);
        console.log('Bomb placed at:', gridX, gridY);
    }
    
    createExplosion(x, y, range) {
        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);
        
        // Center explosion
        const centerExplosion = new NeonExplosion(
            gridX * this.tileSize,
            gridY * this.tileSize,
            this.tileSize,
            'center'
        );
        this.explosions.push(centerExplosion);
        
        // Explosion rays
        const directions = [
            { dx: 0, dy: -1, type: 'vertical' }, // up
            { dx: 0, dy: 1, type: 'vertical' },  // down
            { dx: -1, dy: 0, type: 'horizontal' }, // left
            { dx: 1, dy: 0, type: 'horizontal' }   // right
        ];
        
        directions.forEach(dir => {
            for (let i = 1; i <= range; i++) {
                const newX = gridX + (dir.dx * i);
                const newY = gridY + (dir.dy * i);
                
                if (this.map && this.map.isWall(newX, newY)) {
                    if (this.map.isDestructibleWall(newX, newY)) {
                        this.map.destroyWall(newX, newY);
                        this.createPowerup(newX, newY);
                        this.score += 10;
                    }
                    break;
                }
                
                const explosion = new NeonExplosion(
                    newX * this.tileSize,
                    newY * this.tileSize,
                    this.tileSize,
                    i === range ? 'end' : dir.type
                );
                this.explosions.push(explosion);
            }
        });
        
        // Update score
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score, this.level, this.lives);
        }
        
        console.log('Explosion created at:', gridX, gridY);
    }
    
    createPowerup(gridX, gridY) {
        if (Math.random() < 0.3) { // 30% chance
            const types = ['speed', 'bomb', 'range'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            const powerup = new NeonPowerup(
                gridX * this.tileSize,
                gridY * this.tileSize,
                this.tileSize,
                type
            );
            
            this.powerups.push(powerup);
        }
    }
    
    collectPowerup(powerup) {
        switch (powerup.type) {
            case 'speed':
                this.player.speed += 1;
                break;
            case 'bomb':
                this.player.maxBombs += 1;
                break;
            case 'range':
                this.player.bombRange += 1;
                break;
        }
        
        this.powerups = this.powerups.filter(p => p !== powerup);
        this.score += 50;
        
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score, this.level, this.lives);
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    nextLevel() {
        this.level++;
        this.bombs = [];
        this.explosions = [];
        this.powerups = [];
        
        // Regenerate map
        this.map = new NeonMap(this.mapWidth, this.mapHeight, this.tileSize);
        
        // Reset player position
        this.player.x = this.tileSize;
        this.player.y = this.tileSize;
        
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score, this.level, this.lives);
        }
        
        console.log('Next level:', this.level);
    }
    
    gameOver() {
        this.isRunning = false;
        
        if (this.onGameOver) {
            this.onGameOver(this.score, this.level);
        }
        
        console.log('Game Over');
    }
}


// SNAKE CYBERPUNK - GAME ENGINE

class SnakeGame {
    constructor(character) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.character = character;
        
        // Game settings
        this.tileSize = 20;
        this.gridWidth = Math.floor(this.canvas.width / this.tileSize);
        this.gridHeight = Math.floor(this.canvas.height / this.tileSize);
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.lastTime = 0;
        this.gameSpeed = 150; // milliseconds per move
        this.speedMultiplier = 1;
        
        // Snake
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Game objects
        this.food = [];
        this.powerups = [];
        this.obstacles = [];
        this.effects = [];
        this.particles = [];
        
        // Stats
        this.score = 0;
        this.level = 1;
        this.startTime = Date.now();
        
        // Active effects
        this.activeEffects = new Map();
        
        // Sprites
        this.sprites = new Map();
        
        this.init();
    }
    
    async init() {
        await this.loadSprites();
        this.setupGame();
        this.setupCanvas();
    }
    
    async loadSprites() {
        const spriteList = [
            `${this.character}_head`,
            `${this.character}_body`,
            'food_apple',
            'food_special',
            'background_tile'
        ];
        
        for (const spriteName of spriteList) {
            const img = new Image();
            img.src = `assets/sprites/${spriteName}.png`;
            await new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if image fails to load
            });
            this.sprites.set(spriteName, img);
        }
    }
    
    setupGame() {
        // Initialize snake
        this.snake = [
            { x: Math.floor(this.gridWidth / 2), y: Math.floor(this.gridHeight / 2) }
        ];
        
        // Spawn initial food
        this.spawnFood();
        
        // Generate obstacles
        this.generateObstacles();
    }
    
    setupCanvas() {
        this.ctx.imageSmoothingEnabled = false;
        this.drawBackground();
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    
    pause() {
        this.isPaused = true;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
    }
    
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    
    destroy() {
        this.isRunning = false;
        this.isPaused = true;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
    }
    
    update(currentTime) {
        if (!this.isRunning || this.isPaused) return;
        
        const deltaTime = currentTime - this.lastTime;
        const moveInterval = this.gameSpeed / this.speedMultiplier;
        
        if (deltaTime >= moveInterval) {
            this.updateGame();
            this.render();
            this.lastTime = currentTime;
        }
        
        // Update particles and effects at 60fps
        this.updateParticles();
        this.updateEffects();
        
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    
    updateGame() {
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Move snake
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
            if (!this.activeEffects.has('phase')) {
                this.gameOver();
                return;
            } else {
                // Wrap around when in phase mode
                head.x = (head.x + this.gridWidth) % this.gridWidth;
                head.y = (head.y + this.gridHeight) % this.gridHeight;
            }
        }
        
        // Check self collision
        if (!this.activeEffects.has('ghost')) {
            for (const segment of this.snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    if (!this.activeEffects.has('shield')) {
                        this.gameOver();
                        return;
                    } else {
                        this.removeEffect('shield');
                        this.createParticleExplosion(head.x, head.y, '#ffff00');
                    }
                }
            }
        }
        
        // Check obstacle collision
        for (const obstacle of this.obstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y) {
                if (!this.activeEffects.has('shield') && !this.activeEffects.has('phase')) {
                    this.gameOver();
                    return;
                } else if (this.activeEffects.has('shield')) {
                    this.removeEffect('shield');
                    this.createParticleExplosion(head.x, head.y, '#ffff00');
                }
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        let foodEaten = false;
        for (let i = this.food.length - 1; i >= 0; i--) {
            const food = this.food[i];
            if (head.x === food.x && head.y === food.y) {
                this.eatFood(food);
                this.food.splice(i, 1);
                foodEaten = true;
                break;
            }
        }
        
        // Check powerup collision
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            if (head.x === powerup.x && head.y === powerup.y) {
                this.collectPowerup(powerup);
                this.powerups.splice(i, 1);
                break;
            }
        }
        
        // Remove tail if no food eaten
        if (!foodEaten) {
            this.snake.pop();
        }
        
        // Spawn new food if needed
        if (this.food.length === 0) {
            this.spawnFood();
        }
        
        // Randomly spawn powerups
        if (Math.random() < 0.02 && this.powerups.length < 2) {
            this.spawnPowerup();
        }
        
        // Update level
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed = Math.max(80, 150 - (this.level - 1) * 10);
        }
        
        this.updateHUD();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background pattern
        this.drawBackground();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw food
        this.drawFood();
        
        // Draw powerups
        this.drawPowerups();
        
        // Draw snake
        this.drawSnake();
        
        // Draw particles
        this.drawParticles();
        
        // Draw effects overlay
        this.drawEffectsOverlay();
    }
    
    drawBackground() {
        const bgSprite = this.sprites.get('background_tile');
        if (bgSprite) {
            for (let x = 0; x < this.gridWidth; x++) {
                for (let y = 0; y < this.gridHeight; y++) {
                    this.ctx.drawImage(
                        bgSprite,
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        } else {
            // Fallback grid pattern
            this.ctx.strokeStyle = '#003333';
            this.ctx.lineWidth = 0.5;
            for (let x = 0; x <= this.gridWidth; x++) {
                this.ctx.beginPath();
                this.ctx.moveTo(x * this.tileSize, 0);
                this.ctx.lineTo(x * this.tileSize, this.canvas.height);
                this.ctx.stroke();
            }
            for (let y = 0; y <= this.gridHeight; y++) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y * this.tileSize);
                this.ctx.lineTo(this.canvas.width, y * this.tileSize);
                this.ctx.stroke();
            }
        }
    }
    
    drawSnake() {
        const headSprite = this.sprites.get(`${this.character}_head`);
        const bodySprite = this.sprites.get(`${this.character}_body`);
        
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.tileSize;
            const y = segment.y * this.tileSize;
            
            if (i === 0 && headSprite) {
                // Draw head
                this.ctx.drawImage(headSprite, x, y, this.tileSize, this.tileSize);
            } else if (bodySprite) {
                // Draw body
                this.ctx.drawImage(bodySprite, x, y, this.tileSize, this.tileSize);
            } else {
                // Fallback rendering
                this.ctx.fillStyle = i === 0 ? '#00ffff' : '#0088aa';
                this.ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
            }
            
            // Add glow effect for active effects
            if (this.activeEffects.size > 0) {
                this.ctx.shadowColor = '#00ffff';
                this.ctx.shadowBlur = 10;
                this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                this.ctx.shadowBlur = 0;
            }
        }
    }
    
    drawFood() {
        const foodSprite = this.sprites.get('food_apple');
        
        for (const food of this.food) {
            const x = food.x * this.tileSize;
            const y = food.y * this.tileSize;
            
            if (foodSprite) {
                this.ctx.drawImage(foodSprite, x, y, this.tileSize, this.tileSize);
            } else {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
            }
            
            // Add pulsing glow
            const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
            this.ctx.shadowColor = '#ff0000';
            this.ctx.shadowBlur = 5 + pulse * 5;
            this.ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + pulse * 0.2})`;
            this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawPowerups() {
        const specialSprite = this.sprites.get('food_special');
        
        for (const powerup of this.powerups) {
            const x = powerup.x * this.tileSize;
            const y = powerup.y * this.tileSize;
            
            if (specialSprite) {
                this.ctx.drawImage(specialSprite, x, y, this.tileSize, this.tileSize);
            } else {
                this.ctx.fillStyle = powerup.color;
                this.ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
            }
            
            // Add rotating glow
            const rotation = Date.now() * 0.01;
            const pulse = Math.sin(rotation) * 0.5 + 0.5;
            this.ctx.shadowColor = powerup.color;
            this.ctx.shadowBlur = 8 + pulse * 4;
            this.ctx.fillStyle = `${powerup.color}44`;
            this.ctx.fillRect(x - 2, y - 2, this.tileSize + 4, this.tileSize + 4);
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawObstacles() {
        for (const obstacle of this.obstacles) {
            const x = obstacle.x * this.tileSize;
            const y = obstacle.y * this.tileSize;
            
            this.ctx.fillStyle = '#666666';
            this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
            
            // Add danger glow
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawEffectsOverlay() {
        if (this.activeEffects.has('slow')) {
            this.ctx.fillStyle = 'rgba(128, 0, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        if (this.activeEffects.has('ghost')) {
            this.ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    // Game logic methods
    spawnFood() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.isPositionOccupied(position));
        
        this.food.push(position);
    }
    
    spawnPowerup() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.isPositionOccupied(position));
        
        const powerupTypes = [
            { type: 'speed', color: '#00ffff' },
            { type: 'shield', color: '#ffff00' },
            { type: 'ghost', color: '#ff00ff' },
            { type: 'slow', color: '#8000ff' },
            { type: 'teleport', color: '#00ff00' },
            { type: 'multiplier', color: '#ffa500' }
        ];
        
        const powerup = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        this.powerups.push({ ...position, ...powerup });
    }
    
    generateObstacles() {
        const numObstacles = Math.floor(this.level * 2);
        for (let i = 0; i < numObstacles; i++) {
            let position;
            do {
                position = {
                    x: Math.floor(Math.random() * this.gridWidth),
                    y: Math.floor(Math.random() * this.gridHeight)
                };
            } while (this.isPositionOccupied(position) || this.isNearSnake(position, 3));
            
            this.obstacles.push(position);
        }
    }
    
    isPositionOccupied(pos) {
        return this.snake.some(segment => segment.x === pos.x && segment.y === pos.y) ||
               this.food.some(food => food.x === pos.x && food.y === pos.y) ||
               this.powerups.some(powerup => powerup.x === pos.x && powerup.y === pos.y) ||
               this.obstacles.some(obstacle => obstacle.x === pos.x && obstacle.y === pos.y);
    }
    
    isNearSnake(pos, distance) {
        return this.snake.some(segment => 
            Math.abs(segment.x - pos.x) < distance && Math.abs(segment.y - pos.y) < distance
        );
    }
    
    eatFood(food) {
        const basePoints = 10;
        const multiplier = this.activeEffects.has('multiplier') ? 2 : 1;
        this.score += basePoints * multiplier;
        
        this.createParticleExplosion(food.x, food.y, '#ff0000');
    }
    
    collectPowerup(powerup) {
        this.applyPowerup(powerup.type);
        this.createParticleExplosion(powerup.x, powerup.y, powerup.color);
        this.score += 25;
    }
    
    applyPowerup(type) {
        const duration = 5000; // 5 seconds
        
        switch(type) {
            case 'speed':
                this.speedMultiplier = 2;
                this.addEffect('speed', duration);
                break;
            case 'shield':
                this.addEffect('shield', duration);
                break;
            case 'ghost':
                this.addEffect('ghost', duration);
                break;
            case 'slow':
                this.speedMultiplier = 0.5;
                this.addEffect('slow', duration);
                break;
            case 'teleport':
                this.teleportSnake();
                break;
            case 'multiplier':
                this.addEffect('multiplier', duration);
                break;
        }
    }
    
    addEffect(type, duration) {
        this.activeEffects.set(type, Date.now() + duration);
        this.updateEffectsDisplay();
    }
    
    removeEffect(type) {
        this.activeEffects.delete(type);
        
        if (type === 'speed' || type === 'slow') {
            this.speedMultiplier = 1;
        }
        
        this.updateEffectsDisplay();
    }
    
    updateEffects() {
        const now = Date.now();
        const expiredEffects = [];
        
        for (const [type, expireTime] of this.activeEffects) {
            if (now >= expireTime) {
                expiredEffects.push(type);
            }
        }
        
        for (const type of expiredEffects) {
            this.removeEffect(type);
        }
    }
    
    updateEffectsDisplay() {
        const container = document.getElementById('activeEffects');
        container.innerHTML = '';
        
        const effectIcons = {
            speed: '🚀',
            shield: '🛡️',
            ghost: '👻',
            slow: '⏰',
            multiplier: '💎'
        };
        
        for (const [type] of this.activeEffects) {
            const icon = document.createElement('div');
            icon.className = `effect-icon effect-${type}`;
            icon.textContent = effectIcons[type] || '⚡';
            container.appendChild(icon);
        }
    }
    
    teleportSnake() {
        let newPosition;
        do {
            newPosition = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.isPositionOccupied(newPosition));
        
        this.createParticleExplosion(this.snake[0].x, this.snake[0].y, '#00ff00');
        this.snake[0] = newPosition;
        this.createParticleExplosion(newPosition.x, newPosition.y, '#00ff00');
    }
    
    createParticleExplosion(x, y, color) {
        const centerX = x * this.tileSize + this.tileSize / 2;
        const centerY = y * this.tileSize + this.tileSize / 2;
        
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 4 + 2,
                color: color,
                alpha: 1,
                life: 30
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / 30;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    changeDirection(newDirection) {
        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        
        const dir = directions[newDirection];
        if (!dir) return;
        
        // Prevent reversing into self
        if (this.snake.length > 1) {
            if (dir.x === -this.direction.x && dir.y === -this.direction.y) {
                return;
            }
        }
        
        this.nextDirection = dir;
    }
    
    updateHUD() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('levelValue').textContent = this.level;
        document.getElementById('lengthValue').textContent = this.snake.length;
    }
    
    gameOver() {
        this.isRunning = false;
        
        const gameTime = Date.now() - this.startTime;
        const minutes = Math.floor(gameTime / 60000);
        const seconds = Math.floor((gameTime % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const stats = {
            score: this.score,
            level: this.level,
            length: this.snake.length,
            time: timeString
        };
        
        setTimeout(() => {
            snakeCyberpunk.gameOver(stats);
        }, 1000);
    }
}


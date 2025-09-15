// BOMBERMAN NEON - GAME ENGINE CORRIGIDO (VERSÃO FINAL)

class BombermanGame {
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
        
        // Game settings - COORDENADAS CORRIGIDAS
        this.tileSize = 40;
        this.mapWidth = 19;
        this.mapHeight = 15;
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('🎮 Inicializando BombermanGame...');
        
        // Create map
        this.map = new GameMap(this.mapWidth, this.mapHeight, this.tileSize);
        
        // Create player - POSIÇÃO INICIAL CORRIGIDA
        this.player = new Player(1, 1, this.selectedCharacter, this.tileSize);
        
        // Load sprites
        this.loadSprites();
        
        console.log('✅ BombermanGame inicializado!');
    }
    
    loadSprites() {
        this.sprites = {
            player: new Image(),
            bomb: new Image(),
            explosion: new Image(),
            wall: new Image(),
            destructible: new Image(),
            powerup_speed: new Image(),
            powerup_bomb: new Image(),
            powerup_range: new Image()
        };
        
        // Load player sprite
        this.sprites.player.src = `assets/sprites/characters/${this.selectedCharacter}_neon.png`;
        this.sprites.bomb.src = 'assets/sprites/items/bomb_neon.png';
        this.sprites.explosion.src = 'assets/sprites/items/explosion_neon.png';
        this.sprites.wall.src = 'assets/sprites/environment/wall_neon.png';
        this.sprites.destructible.src = 'assets/sprites/environment/wall_neon.png';
        
        console.log('🖼️ Sprites carregados!');
    }
    
    start() {
        console.log('🚀 Iniciando jogo...');
        this.isRunning = true;
        this.isPaused = false;
        this.gameLoop();
    }
    
    pause() {
        this.isPaused = true;
        console.log('⏸️ Jogo pausado');
    }
    
    resume() {
        this.isPaused = false;
        console.log('▶️ Jogo retomado');
        this.gameLoop();
    }
    
    destroy() {
        this.isRunning = false;
        this.isPaused = false;
        console.log('🛑 Jogo destruído');
    }
    
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        try {
            this.update();
            this.render();
            
            // Continue loop
            requestAnimationFrame(() => this.gameLoop());
        } catch (error) {
            console.error('❌ Erro no game loop:', error);
            this.handleGameError(error);
        }
    }
    
    update() {
        // Update player
        if (this.player) {
            this.player.update(this.map);
        }
        
        // Update bombs - SISTEMA CORRIGIDO
        this.updateBombs();
        
        // Update explosions
        this.updateExplosions();
        
        // Update powerups
        this.updatePowerups();
        
        // Check collisions
        this.checkCollisions();
        
        // Update HUD
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score, this.level, this.lives);
        }
    }
    
    // SISTEMA DE BOMBAS CORRIGIDO
    updateBombs() {
        // Create a copy of bombs array to avoid modification during iteration
        const bombsCopy = [...this.bombs];
        
        for (let i = bombsCopy.length - 1; i >= 0; i--) {
            const bomb = bombsCopy[i];
            
            try {
                // Update bomb timer
                bomb.timer -= 16; // Assuming 60fps (16ms per frame)
                
                // Check if bomb should explode
                if (bomb.timer <= 0) {
                    console.log(`💥 Bomba explodindo em (${bomb.x}, ${bomb.y})!`);
                    
                    // Create explosion
                    this.createExplosion(bomb.x, bomb.y, bomb.range);
                    
                    // Remove bomb from array safely
                    const bombIndex = this.bombs.indexOf(bomb);
                    if (bombIndex > -1) {
                        this.bombs.splice(bombIndex, 1);
                    }
                    
                    // Increase player bomb count
                    if (this.player) {
                        this.player.bombCount++;
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao atualizar bomba:', error);
                // Remove problematic bomb
                const bombIndex = this.bombs.indexOf(bomb);
                if (bombIndex > -1) {
                    this.bombs.splice(bombIndex, 1);
                }
            }
        }
    }
    
    // SISTEMA DE EXPLOSÕES CORRIGIDO - ALCANCE PRECISO
    createExplosion(centerX, centerY, range) {
        try {
            console.log(`💥 Criando explosão em (${centerX}, ${centerY}) com alcance ${range}`);
            
            // Center explosion
            this.explosions.push(new Explosion(centerX, centerY, 500)); // 500ms duration
            
            // Horizontal explosions - DIREITA
            for (let i = 1; i <= range; i++) {
                const checkX = centerX + i;
                if (checkX >= this.mapWidth) break; // Fora do mapa
                
                if (this.map.isWall(checkX, centerY)) {
                    break; // Para na parede sólida
                }
                
                this.explosions.push(new Explosion(checkX, centerY, 500));
                
                if (this.map.isDestructible(checkX, centerY)) {
                    this.destroyWall(checkX, centerY);
                    break; // Para após destruir parede
                }
            }
            
            // Horizontal explosions - ESQUERDA
            for (let i = 1; i <= range; i++) {
                const checkX = centerX - i;
                if (checkX < 0) break; // Fora do mapa
                
                if (this.map.isWall(checkX, centerY)) {
                    break; // Para na parede sólida
                }
                
                this.explosions.push(new Explosion(checkX, centerY, 500));
                
                if (this.map.isDestructible(checkX, centerY)) {
                    this.destroyWall(checkX, centerY);
                    break; // Para após destruir parede
                }
            }
            
            // Vertical explosions - BAIXO
            for (let i = 1; i <= range; i++) {
                const checkY = centerY + i;
                if (checkY >= this.mapHeight) break; // Fora do mapa
                
                if (this.map.isWall(centerX, checkY)) {
                    break; // Para na parede sólida
                }
                
                this.explosions.push(new Explosion(centerX, checkY, 500));
                
                if (this.map.isDestructible(centerX, checkY)) {
                    this.destroyWall(centerX, checkY);
                    break; // Para após destruir parede
                }
            }
            
            // Vertical explosions - CIMA
            for (let i = 1; i <= range; i++) {
                const checkY = centerY - i;
                if (checkY < 0) break; // Fora do mapa
                
                if (this.map.isWall(centerX, checkY)) {
                    break; // Para na parede sólida
                }
                
                this.explosions.push(new Explosion(centerX, checkY, 500));
                
                if (this.map.isDestructible(centerX, checkY)) {
                    this.destroyWall(centerX, checkY);
                    break; // Para após destruir parede
                }
            }
            
            console.log(`✅ Explosão criada com ${this.explosions.length} partes`);
        } catch (error) {
            console.error('❌ Erro ao criar explosão:', error);
        }
    }
    
    updateExplosions() {
        // Update explosions safely
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            
            try {
                explosion.timer -= 16;
                
                if (explosion.timer <= 0) {
                    this.explosions.splice(i, 1);
                }
            } catch (error) {
                console.error('❌ Erro ao atualizar explosão:', error);
                this.explosions.splice(i, 1);
            }
        }
    }
    
    destroyWall(x, y) {
        try {
            this.map.destroyWall(x, y);
            this.score += 10;
            
            // Chance to spawn powerup
            if (Math.random() < 0.3) {
                this.spawnPowerup(x, y);
            }
            
            console.log(`🧱 Parede destruída em (${x}, ${y})`);
        } catch (error) {
            console.error('❌ Erro ao destruir parede:', error);
        }
    }
    
    spawnPowerup(x, y) {
        const types = ['speed', 'bomb', 'range'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerups.push(new Powerup(x, y, type));
        console.log(`⚡ Power-up ${type} criado em (${x}, ${y})`);
    }
    
    updatePowerups() {
        // Safe powerup update
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            
            try {
                // Check if player collected powerup - COORDENADAS CORRIGIDAS
                const playerTileX = Math.floor(this.player.x / this.tileSize);
                const playerTileY = Math.floor(this.player.y / this.tileSize);
                
                if (playerTileX === powerup.x && playerTileY === powerup.y) {
                    this.collectPowerup(powerup);
                    this.powerups.splice(i, 1);
                }
            } catch (error) {
                console.error('❌ Erro ao atualizar power-up:', error);
                this.powerups.splice(i, 1);
            }
        }
    }
    
    collectPowerup(powerup) {
        try {
            switch (powerup.type) {
                case 'speed':
                    this.player.speed += 1;
                    console.log('⚡ Speed boost coletado!');
                    break;
                case 'bomb':
                    this.player.maxBombs++;
                    this.player.bombCount++;
                    console.log('💣 Bomba extra coletada!');
                    break;
                case 'range':
                    this.player.bombRange++;
                    console.log('🔥 Alcance aumentado!');
                    break;
            }
            
            this.score += 50;
        } catch (error) {
            console.error('❌ Erro ao coletar power-up:', error);
        }
    }
    
    checkCollisions() {
        try {
            // Check player vs explosions - COORDENADAS CORRIGIDAS
            if (this.player) {
                const playerTileX = Math.floor(this.player.x / this.tileSize);
                const playerTileY = Math.floor(this.player.y / this.tileSize);
                
                for (const explosion of this.explosions) {
                    if (explosion.x === playerTileX && explosion.y === playerTileY) {
                        this.playerHit();
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro ao verificar colisões:', error);
        }
    }
    
    playerHit() {
        this.lives--;
        console.log(`💔 Jogador atingido! Vidas restantes: ${this.lives}`);
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Reset player position
            this.player.x = this.tileSize;
            this.player.y = this.tileSize;
        }
    }
    
    gameOver() {
        this.isRunning = false;
        console.log('💀 Game Over!');
        
        if (this.onGameOver) {
            this.onGameOver(this.score, this.level);
        }
    }
    
    // INPUT HANDLING CORRIGIDO
    handleInput(direction, pressed) {
        try {
            this.keys[direction] = pressed;
            
            if (this.player) {
                this.player.setDirection(direction, pressed);
            }
            
            console.log(`🎮 Input: ${direction} = ${pressed}`);
        } catch (error) {
            console.error('❌ Erro ao processar input:', error);
        }
    }
    
    // COLOCAÇÃO DE BOMBAS CORRIGIDA - POSICIONAMENTO PRECISO
    placeBomb() {
        try {
            if (!this.player || this.player.bombCount <= 0) {
                console.log('⚠️ Não é possível colocar bomba');
                return;
            }
            
            // COORDENADAS CORRIGIDAS - posição exata do jogador
            const bombX = Math.floor(this.player.x / this.tileSize);
            const bombY = Math.floor(this.player.y / this.tileSize);
            
            console.log(`🎯 Jogador em pixels: (${this.player.x}, ${this.player.y})`);
            console.log(`🎯 Bomba em tiles: (${bombX}, ${bombY})`);
            
            // Check if there's already a bomb at this position
            const existingBomb = this.bombs.find(bomb => bomb.x === bombX && bomb.y === bombY);
            if (existingBomb) {
                console.log('⚠️ Já existe uma bomba nesta posição');
                return;
            }
            
            // Create new bomb
            const bomb = new Bomb(bombX, bombY, this.player.bombRange, 3000); // 3 seconds
            this.bombs.push(bomb);
            this.player.bombCount--;
            
            console.log(`💣 Bomba colocada em (${bombX}, ${bombY}) com alcance ${this.player.bombRange}`);
        } catch (error) {
            console.error('❌ Erro ao colocar bomba:', error);
        }
    }
    
    render() {
        try {
            // Clear canvas
            this.ctx.fillStyle = '#0a0a0a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Render map
            if (this.map) {
                this.map.render(this.ctx, this.sprites);
            }
            
            // Render powerups
            this.renderPowerups();
            
            // Render bombs
            this.renderBombs();
            
            // Render explosions
            this.renderExplosions();
            
            // Render player
            if (this.player) {
                this.player.render(this.ctx, this.sprites.player);
            }
            
        } catch (error) {
            console.error('❌ Erro ao renderizar:', error);
        }
    }
    
    renderBombs() {
        for (const bomb of this.bombs) {
            try {
                // RENDERIZAÇÃO CORRIGIDA - posição precisa
                const x = bomb.x * this.tileSize;
                const y = bomb.y * this.tileSize;
                
                // Render bomb with pulsing effect
                const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.9;
                this.ctx.save();
                this.ctx.globalAlpha = pulse;
                
                if (this.sprites.bomb.complete) {
                    this.ctx.drawImage(this.sprites.bomb, x, y, this.tileSize, this.tileSize);
                } else {
                    // Fallback rendering
                    this.ctx.fillStyle = '#ff0080';
                    this.ctx.fillRect(x + 5, y + 5, this.tileSize - 10, this.tileSize - 10);
                }
                
                this.ctx.restore();
            } catch (error) {
                console.error('❌ Erro ao renderizar bomba:', error);
            }
        }
    }
    
    renderExplosions() {
        for (const explosion of this.explosions) {
            try {
                // RENDERIZAÇÃO CORRIGIDA - posição precisa
                const x = explosion.x * this.tileSize;
                const y = explosion.y * this.tileSize;
                
                // Render explosion with glow effect
                this.ctx.save();
                this.ctx.shadowColor = '#00ffff';
                this.ctx.shadowBlur = 20;
                
                if (this.sprites.explosion.complete) {
                    this.ctx.drawImage(this.sprites.explosion, x, y, this.tileSize, this.tileSize);
                } else {
                    // Fallback rendering
                    this.ctx.fillStyle = '#00ffff';
                    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                }
                
                this.ctx.restore();
            } catch (error) {
                console.error('❌ Erro ao renderizar explosão:', error);
            }
        }
    }
    
    renderPowerups() {
        for (const powerup of this.powerups) {
            try {
                // RENDERIZAÇÃO CORRIGIDA - posição precisa
                const x = powerup.x * this.tileSize;
                const y = powerup.y * this.tileSize;
                
                // Render powerup with floating effect
                const float = Math.sin(Date.now() * 0.005) * 3;
                
                this.ctx.save();
                this.ctx.shadowColor = '#ffff00';
                this.ctx.shadowBlur = 10;
                
                // Simple colored square for powerups
                switch (powerup.type) {
                    case 'speed':
                        this.ctx.fillStyle = '#00ff00';
                        break;
                    case 'bomb':
                        this.ctx.fillStyle = '#ff8000';
                        break;
                    case 'range':
                        this.ctx.fillStyle = '#ff0000';
                        break;
                }
                
                this.ctx.fillRect(x + 8, y + 8 + float, this.tileSize - 16, this.tileSize - 16);
                this.ctx.restore();
            } catch (error) {
                console.error('❌ Erro ao renderizar power-up:', error);
            }
        }
    }
}

// CLASSES AUXILIARES

// PLAYER CLASS CORRIGIDA - COLISÕES PRECISAS
class Player {
    constructor(x, y, character, tileSize) {
        this.x = x * tileSize;
        this.y = y * tileSize;
        this.character = character;
        this.tileSize = tileSize;
        
        this.speed = 2;
        this.direction = { x: 0, y: 0 };
        
        this.bombCount = 1;
        this.maxBombs = 1;
        this.bombRange = 2;
    }
    
    setDirection(dir, pressed) {
        switch (dir) {
            case 'up':
                this.direction.y = pressed ? -1 : 0;
                break;
            case 'down':
                this.direction.y = pressed ? 1 : 0;
                break;
            case 'left':
                this.direction.x = pressed ? -1 : 0;
                break;
            case 'right':
                this.direction.x = pressed ? 1 : 0;
                break;
        }
    }
    
    update(map) {
        const newX = this.x + this.direction.x * this.speed;
        const newY = this.y + this.direction.y * this.speed;
        
        // COLISÕES CORRIGIDAS - verificação precisa
        if (!this.checkWallCollision(newX, this.y, map)) {
            this.x = newX;
        }
        if (!this.checkWallCollision(this.x, newY, map)) {
            this.y = newY;
        }
        
        // Keep player in bounds
        this.x = Math.max(this.tileSize * 0.1, Math.min(this.x, (map.width - 1.1) * this.tileSize));
        this.y = Math.max(this.tileSize * 0.1, Math.min(this.y, (map.height - 1.1) * this.tileSize));
    }
    
    // SISTEMA DE COLISÃO CORRIGIDO
    checkWallCollision(x, y, map) {
        // Verificar múltiplos pontos do jogador para colisão precisa
        const margin = 5; // Margem para não grudar nas paredes
        
        const points = [
            { x: x + margin, y: y + margin },           // Top-left
            { x: x + this.tileSize - margin, y: y + margin },     // Top-right
            { x: x + margin, y: y + this.tileSize - margin },     // Bottom-left
            { x: x + this.tileSize - margin, y: y + this.tileSize - margin } // Bottom-right
        ];
        
        for (const point of points) {
            const tileX = Math.floor(point.x / this.tileSize);
            const tileY = Math.floor(point.y / this.tileSize);
            
            if (map.isWall(tileX, tileY) || map.isDestructible(tileX, tileY)) {
                return true; // Colisão detectada
            }
        }
        
        return false; // Sem colisão
    }
    
    render(ctx, sprite) {
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, this.x, this.y, this.tileSize, this.tileSize);
        } else {
            // Fallback rendering
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(this.x + 2, this.y + 2, this.tileSize - 4, this.tileSize - 4);
        }
    }
}

class Bomb {
    constructor(x, y, range, timer) {
        this.x = x;
        this.y = y;
        this.range = range;
        this.timer = timer;
    }
}

class Explosion {
    constructor(x, y, timer) {
        this.x = x;
        this.y = y;
        this.timer = timer;
    }
}

class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }
}

class GameMap {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = [];
        
        this.generateMap();
    }
    
    generateMap() {
        // Initialize empty map
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = 0; // Empty
            }
        }
        
        // Add border walls
        for (let x = 0; x < this.width; x++) {
            this.tiles[0][x] = 1; // Top wall
            this.tiles[this.height - 1][x] = 1; // Bottom wall
        }
        for (let y = 0; y < this.height; y++) {
            this.tiles[y][0] = 1; // Left wall
            this.tiles[y][this.width - 1] = 1; // Right wall
        }
        
        // Add internal walls (every other tile)
        for (let y = 2; y < this.height - 1; y += 2) {
            for (let x = 2; x < this.width - 1; x += 2) {
                this.tiles[y][x] = 1;
            }
        }
        
        // Add destructible walls randomly
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.tiles[y][x] === 0 && Math.random() < 0.6) {
                    // Don't place walls near player start position
                    if (!(x <= 2 && y <= 2)) {
                        this.tiles[y][x] = 2; // Destructible wall
                    }
                }
            }
        }
        
        console.log('🗺️ Mapa gerado!');
    }
    
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
        return this.tiles[y][x] === 1;
    }
    
    isDestructible(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return this.tiles[y][x] === 2;
    }
    
    destroyWall(x, y) {
        if (this.isDestructible(x, y)) {
            this.tiles[y][x] = 0;
        }
    }
    
    render(ctx, sprites) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tileType = this.tiles[y][x];
                const drawX = x * this.tileSize;
                const drawY = y * this.tileSize;
                
                switch (tileType) {
                    case 1: // Solid wall
                        ctx.fillStyle = '#00ffff';
                        ctx.fillRect(drawX, drawY, this.tileSize, this.tileSize);
                        ctx.strokeStyle = '#0080ff';
                        ctx.strokeRect(drawX, drawY, this.tileSize, this.tileSize);
                        break;
                    case 2: // Destructible wall
                        ctx.fillStyle = '#ff00ff';
                        ctx.fillRect(drawX, drawY, this.tileSize, this.tileSize);
                        ctx.strokeStyle = '#ff0080';
                        ctx.strokeRect(drawX, drawY, this.tileSize, this.tileSize);
                        break;
                }
            }
        }
    }
}


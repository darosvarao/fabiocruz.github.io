// Classe principal do jogo
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.gridSize = 32;
        this.mapWidth = 25;
        this.mapHeight = 19;
        
        // Estados do jogo
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.selectedCharacter = 'axol';
        
        // Objetos do jogo
        this.player = null;
        this.bombs = [];
        this.explosions = [];
        this.walls = [];
        this.powerups = [];
        this.enemies = [];
        
        // Controles
        this.keys = {};
        this.touchControls = {
            up: false,
            down: false,
            left: false,
            right: false,
            bomb: false
        };
        
        // Assets
        this.sprites = {};
        this.assetsLoaded = false;
        
        // Configurar canvas
        this.setupCanvas();
        
        // Carregar assets
        this.loadAssets();
        
        // Configurar eventos
        this.setupEvents();
        
        // Loop do jogo
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    setupCanvas() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.imageSmoothingEnabled = false;
    }
    
    loadAssets() {
        const assetPaths = {
            // Personagens
            'axol_down': 'assets/sprites/characters/axol_down.png',
            'axol_up': 'assets/sprites/characters/axol_up.png',
            'axol_left': 'assets/sprites/characters/axol_left.png',
            'axol_right': 'assets/sprites/characters/axol_right.png',
            'bisou_down': 'assets/sprites/characters/bisou_down.png',
            'bisou_up': 'assets/sprites/characters/bisou_up.png',
            'bisou_left': 'assets/sprites/characters/bisou_left.png',
            'bisou_right': 'assets/sprites/characters/bisou_right.png',
            'pepeca_down': 'assets/sprites/characters/pepeca_down.png',
            'pepeca_up': 'assets/sprites/characters/pepeca_up.png',
            'pepeca_left': 'assets/sprites/characters/pepeca_left.png',
            'pepeca_right': 'assets/sprites/characters/pepeca_right.png',
            
            // Itens
            'bomb': 'assets/sprites/items/bomb.png',
            'explosion_center': 'assets/sprites/items/explosion_center.png',
            'explosion_horizontal': 'assets/sprites/items/explosion_horizontal.png',
            'explosion_vertical': 'assets/sprites/items/explosion_vertical.png',
            'powerup_speed': 'assets/sprites/items/powerup_speed.png',
            'powerup_bomb': 'assets/sprites/items/powerup_bomb.png',
            
            // Ambiente
            'wall_solid': 'assets/sprites/environment/wall_solid.png',
            'wall_destructible': 'assets/sprites/environment/wall_destructible.png'
        };
        
        let loadedCount = 0;
        const totalAssets = Object.keys(assetPaths).length;
        
        for (const [key, path] of Object.entries(assetPaths)) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalAssets) {
                    this.assetsLoaded = true;
                    this.hideLoading();
                }
            };
            img.onerror = () => {
                console.error(`Erro ao carregar: ${path}`);
                loadedCount++;
                if (loadedCount === totalAssets) {
                    this.assetsLoaded = true;
                    this.hideLoading();
                }
            };
            img.src = path;
            this.sprites[key] = img;
        }
    }
    
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
    
    setupEvents() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (this.gameState === 'playing') {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.player.placeBomb();
                }
                if (e.code === 'Escape') {
                    this.pauseGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Eventos touch
        this.setupTouchControls();
        
        // Prevenir zoom no mobile
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    }
    
    setupTouchControls() {
        const touchButtons = {
            'upBtn': 'up',
            'downBtn': 'down',
            'leftBtn': 'left',
            'rightBtn': 'right',
            'bombBtn': 'bomb'
        };
        
        for (const [btnId, control] of Object.entries(touchButtons)) {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.touchControls[control] = true;
                    if (control === 'bomb' && this.gameState === 'playing') {
                        this.player.placeBomb();
                    }
                });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.touchControls[control] = false;
                });
                
                btn.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    this.touchControls[control] = false;
                });
            }
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Limpar objetos
        this.bombs = [];
        this.explosions = [];
        this.walls = [];
        this.powerups = [];
        this.enemies = [];
        
        // Criar mapa
        this.map = new GameMap(this);
        this.map.generate();
        
        // Criar jogador
        this.player = new Player(this, this.gridSize, this.gridSize, this.selectedCharacter);
        
        // Iniciar loop do jogo
        requestAnimationFrame(this.gameLoop);
        
        // Atualizar UI
        this.updateUI();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseScreen').classList.remove('hidden');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseScreen').classList.add('hidden');
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    gameOver(won = false) {
        this.gameState = 'gameOver';
        document.getElementById('gameOverTitle').textContent = won ? 'VITÓRIA!' : 'GAME OVER';
        document.getElementById('finalScoreValue').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    nextLevel() {
        this.level++;
        this.startGame();
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver(false);
        } else {
            // Respawn do jogador
            this.player.respawn();
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Atualizar jogador
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Atualizar bombas
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            this.bombs[i].update(deltaTime);
            if (this.bombs[i].shouldRemove) {
                this.bombs.splice(i, 1);
            }
        }
        
        // Atualizar explosões
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(deltaTime);
            if (this.explosions[i].shouldRemove) {
                this.explosions.splice(i, 1);
            }
        }
        
        // Atualizar power-ups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            this.powerups[i].update(deltaTime);
            if (this.powerups[i].shouldRemove) {
                this.powerups.splice(i, 1);
            }
        }
        
        // Verificar condições de vitória
        this.checkWinCondition();
    }
    
    checkWinCondition() {
        // Verificar se todas as paredes destrutíveis foram destruídas
        const destructibleWalls = this.walls.filter(wall => wall.type === 'destructible');
        if (destructibleWalls.length === 0 && this.enemies.length === 0) {
            this.gameOver(true);
        }
    }
    
    render() {
        if (this.gameState !== 'playing') return;
        
        // Limpar canvas
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Renderizar paredes
        this.walls.forEach(wall => wall.render(this.ctx));
        
        // Renderizar power-ups
        this.powerups.forEach(powerup => powerup.render(this.ctx));
        
        // Renderizar bombas
        this.bombs.forEach(bomb => bomb.render(this.ctx));
        
        // Renderizar explosões
        this.explosions.forEach(explosion => explosion.render(this.ctx));
        
        // Renderizar jogador
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Renderizar inimigos
        this.enemies.forEach(enemy => enemy.render(this.ctx));
    }
    
    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    // Métodos utilitários
    getGridPosition(x, y) {
        return {
            x: Math.floor(x / this.gridSize),
            y: Math.floor(y / this.gridSize)
        };
    }
    
    getWorldPosition(gridX, gridY) {
        return {
            x: gridX * this.gridSize,
            y: gridY * this.gridSize
        };
    }
    
    isValidPosition(x, y) {
        const gridPos = this.getGridPosition(x, y);
        
        // Verificar limites do mapa
        if (gridPos.x < 0 || gridPos.x >= this.mapWidth || 
            gridPos.y < 0 || gridPos.y >= this.mapHeight) {
            return false;
        }
        
        // Verificar colisão com paredes
        for (const wall of this.walls) {
            const wallGrid = this.getGridPosition(wall.x, wall.y);
            if (wallGrid.x === gridPos.x && wallGrid.y === gridPos.y) {
                return false;
            }
        }
        
        return true;
    }
    
    getWallAt(x, y) {
        const gridPos = this.getGridPosition(x, y);
        return this.walls.find(wall => {
            const wallGrid = this.getGridPosition(wall.x, wall.y);
            return wallGrid.x === gridPos.x && wallGrid.y === gridPos.y;
        });
    }
    
    removeWall(wall) {
        const index = this.walls.indexOf(wall);
        if (index > -1) {
            this.walls.splice(index, 1);
            
            // Chance de criar power-up
            if (wall.type === 'destructible' && Math.random() < 0.3) {
                const powerupType = Math.random() < 0.5 ? 'speed' : 'bomb';
                this.powerups.push(new PowerUp(this, wall.x, wall.y, powerupType));
            }
            
            this.addScore(10);
        }
    }
}


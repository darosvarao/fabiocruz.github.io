// Classe do jogador
class Player {
    constructor(game, x, y, character = 'axol') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.character = character;
        this.direction = 'down';
        this.speed = 150; // pixels por segundo
        this.gridSize = game.gridSize;
        
        // Habilidades
        this.maxBombs = 1;
        this.bombRange = 1;
        this.currentBombs = 0;
        
        // Estado
        this.isMoving = false;
        this.targetX = x;
        this.targetY = y;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // Animação
        this.animationTime = 0;
        this.animationSpeed = 200; // ms por frame
        
        // Posição inicial para respawn
        this.spawnX = x;
        this.spawnY = y;
    }
    
    update(deltaTime) {
        this.handleInput();
        this.updateMovement(deltaTime);
        this.updateInvulnerability(deltaTime);
        this.checkCollisions();
        this.animationTime += deltaTime;
    }
    
    handleInput() {
        const keys = this.game.keys;
        const touch = this.game.touchControls;
        
        let newDirection = null;
        let targetX = this.x;
        let targetY = this.y;
        
        // Verificar input de movimento
        if (keys['ArrowUp'] || keys['KeyW'] || touch.up) {
            newDirection = 'up';
            targetY = this.y - this.gridSize;
        } else if (keys['ArrowDown'] || keys['KeyS'] || touch.down) {
            newDirection = 'down';
            targetY = this.y + this.gridSize;
        } else if (keys['ArrowLeft'] || keys['KeyA'] || touch.left) {
            newDirection = 'left';
            targetX = this.x - this.gridSize;
        } else if (keys['ArrowRight'] || keys['KeyD'] || touch.right) {
            newDirection = 'right';
            targetX = this.x + this.gridSize;
        }
        
        // Iniciar movimento se não estiver se movendo e a posição for válida
        if (newDirection && !this.isMoving) {
            if (this.game.isValidPosition(targetX, targetY)) {
                this.direction = newDirection;
                this.targetX = targetX;
                this.targetY = targetY;
                this.isMoving = true;
            } else {
                // Ainda mudar a direção mesmo se não puder se mover
                this.direction = newDirection;
            }
        }
    }
    
    updateMovement(deltaTime) {
        if (!this.isMoving) return;
        
        const moveDistance = (this.speed * deltaTime) / 1000;
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= moveDistance) {
            // Chegou ao destino
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
        } else {
            // Continuar movimento
            this.x += (dx / distance) * moveDistance;
            this.y += (dy / distance) * moveDistance;
        }
    }
    
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    checkCollisions() {
        // Verificar colisão com explosões
        for (const explosion of this.game.explosions) {
            if (this.isCollidingWith(explosion) && !this.invulnerable) {
                this.takeDamage();
                break;
            }
        }
        
        // Verificar colisão com power-ups
        for (let i = this.game.powerups.length - 1; i >= 0; i--) {
            const powerup = this.game.powerups[i];
            if (this.isCollidingWith(powerup)) {
                this.collectPowerUp(powerup);
                this.game.powerups.splice(i, 1);
            }
        }
    }
    
    isCollidingWith(object) {
        const gridPos1 = this.game.getGridPosition(this.x, this.y);
        const gridPos2 = this.game.getGridPosition(object.x, object.y);
        return gridPos1.x === gridPos2.x && gridPos1.y === gridPos2.y;
    }
    
    collectPowerUp(powerup) {
        switch (powerup.type) {
            case 'speed':
                this.speed = Math.min(this.speed + 30, 300);
                break;
            case 'bomb':
                this.maxBombs++;
                break;
            case 'range':
                this.bombRange++;
                break;
        }
        
        this.game.addScore(50);
        
        // Efeito sonoro seria adicionado aqui
        console.log(`Power-up coletado: ${powerup.type}`);
    }
    
    placeBomb() {
        if (this.currentBombs >= this.maxBombs) return;
        
        // Verificar se já existe uma bomba na posição atual
        const gridPos = this.game.getGridPosition(this.x, this.y);
        const worldPos = this.game.getWorldPosition(gridPos.x, gridPos.y);
        
        const existingBomb = this.game.bombs.find(bomb => {
            const bombGrid = this.game.getGridPosition(bomb.x, bomb.y);
            return bombGrid.x === gridPos.x && bombGrid.y === gridPos.y;
        });
        
        if (existingBomb) return;
        
        // Criar nova bomba
        const bomb = new Bomb(this.game, worldPos.x, worldPos.y, this.bombRange, this);
        this.game.bombs.push(bomb);
        this.currentBombs++;
        
        console.log(`Bomba colocada em (${gridPos.x}, ${gridPos.y})`);
    }
    
    onBombExploded() {
        this.currentBombs = Math.max(0, this.currentBombs - 1);
    }
    
    takeDamage() {
        if (this.invulnerable) return;
        
        this.game.loseLife();
        this.makeInvulnerable(2000); // 2 segundos de invulnerabilidade
        
        console.log('Jogador tomou dano!');
    }
    
    makeInvulnerable(duration) {
        this.invulnerable = true;
        this.invulnerabilityTime = duration;
    }
    
    respawn() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.targetX = this.spawnX;
        this.targetY = this.spawnY;
        this.isMoving = false;
        this.direction = 'down';
        this.makeInvulnerable(3000); // 3 segundos de invulnerabilidade após respawn
        
        // Limpar bombas do jogador
        this.currentBombs = 0;
        this.game.bombs = this.game.bombs.filter(bomb => bomb.owner !== this);
    }
    
    render(ctx) {
        // Efeito de piscar quando invulnerável
        if (this.invulnerable && Math.floor(this.animationTime / 200) % 2 === 0) {
            return;
        }
        
        // Selecionar sprite baseado no personagem e direção
        const spriteName = `${this.character}_${this.direction}`;
        const sprite = this.game.sprites[spriteName];
        
        if (sprite) {
            ctx.drawImage(
                sprite,
                this.x,
                this.y,
                this.gridSize,
                this.gridSize
            );
        } else {
            // Fallback: desenhar um retângulo colorido
            ctx.fillStyle = this.character === 'axol' ? '#888888' : 
                           this.character === 'bisou' ? '#000000' : '#444444';
            ctx.fillRect(this.x, this.y, this.gridSize, this.gridSize);
        }
        
        // Debug: mostrar informações do jogador
        if (false) { // Ativar para debug
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(`Bombas: ${this.currentBombs}/${this.maxBombs}`, this.x, this.y - 5);
            ctx.fillText(`Alcance: ${this.bombRange}`, this.x, this.y - 20);
        }
    }
    
    // Métodos utilitários
    getGridPosition() {
        return this.game.getGridPosition(this.x, this.y);
    }
    
    isAtGridPosition() {
        const worldPos = this.game.getWorldPosition(
            Math.round(this.x / this.gridSize),
            Math.round(this.y / this.gridSize)
        );
        return Math.abs(this.x - worldPos.x) < 1 && Math.abs(this.y - worldPos.y) < 1;
    }
}


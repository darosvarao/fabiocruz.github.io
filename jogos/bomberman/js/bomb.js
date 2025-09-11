// Classe da bomba
class Bomb {
    constructor(game, x, y, range = 1, owner = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.range = range;
        this.owner = owner;
        this.timer = 3000; // 3 segundos para explodir
        this.shouldRemove = false;
        
        // Animação
        this.animationTime = 0;
        this.animationSpeed = 500; // ms por frame
        this.scale = 1.0;
        this.pulseDirection = 1;
    }
    
    update(deltaTime) {
        this.timer -= deltaTime;
        this.animationTime += deltaTime;
        
        // Efeito de pulsação
        this.scale += (this.pulseDirection * deltaTime) / 1000;
        if (this.scale >= 1.2) {
            this.scale = 1.2;
            this.pulseDirection = -1;
        } else if (this.scale <= 0.8) {
            this.scale = 0.8;
            this.pulseDirection = 1;
        }
        
        // Verificar se deve explodir
        if (this.timer <= 0) {
            this.explode();
        }
        
        // Verificar se foi atingida por explosão
        for (const explosion of this.game.explosions) {
            if (this.isCollidingWith(explosion)) {
                this.explode();
                break;
            }
        }
    }
    
    isCollidingWith(object) {
        const gridPos1 = this.game.getGridPosition(this.x, this.y);
        const gridPos2 = this.game.getGridPosition(object.x, object.y);
        return gridPos1.x === gridPos2.x && gridPos1.y === gridPos2.y;
    }
    
    explode() {
        if (this.shouldRemove) return; // Já explodiu
        
        console.log(`Bomba explodindo em (${this.x}, ${this.y})`);
        
        // Criar explosão central
        this.game.explosions.push(new Explosion(this.game, this.x, this.y, 'center'));
        
        // Criar explosões em todas as direções
        const directions = [
            { dx: 0, dy: -1, type: 'vertical' },   // cima
            { dx: 0, dy: 1, type: 'vertical' },    // baixo
            { dx: -1, dy: 0, type: 'horizontal' }, // esquerda
            { dx: 1, dy: 0, type: 'horizontal' }   // direita
        ];
        
        for (const dir of directions) {
            for (let i = 1; i <= this.range; i++) {
                const explosionX = this.x + (dir.dx * i * this.game.gridSize);
                const explosionY = this.y + (dir.dy * i * this.game.gridSize);
                
                // Verificar se a posição está dentro dos limites
                if (explosionX < 0 || explosionX >= this.game.width ||
                    explosionY < 0 || explosionY >= this.game.height) {
                    break;
                }
                
                // Verificar colisão com paredes
                const wall = this.game.getWallAt(explosionX, explosionY);
                if (wall) {
                    if (wall.type === 'destructible') {
                        // Destruir parede destrutível e criar explosão
                        this.game.explosions.push(new Explosion(this.game, explosionX, explosionY, dir.type));
                        this.game.removeWall(wall);
                    }
                    // Parar propagação da explosão
                    break;
                } else {
                    // Criar explosão no espaço vazio
                    this.game.explosions.push(new Explosion(this.game, explosionX, explosionY, dir.type));
                }
            }
        }
        
        // Notificar o dono da bomba
        if (this.owner && this.owner.onBombExploded) {
            this.owner.onBombExploded();
        }
        
        // Marcar para remoção
        this.shouldRemove = true;
        
        // Adicionar pontos
        this.game.addScore(20);
    }
    
    render(ctx) {
        const sprite = this.game.sprites['bomb'];
        
        if (sprite) {
            // Calcular posição e tamanho com efeito de escala
            const size = this.game.gridSize * this.scale;
            const offsetX = (this.game.gridSize - size) / 2;
            const offsetY = (this.game.gridSize - size) / 2;
            
            ctx.drawImage(
                sprite,
                this.x + offsetX,
                this.y + offsetY,
                size,
                size
            );
        } else {
            // Fallback: desenhar círculo preto
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(
                this.x + this.game.gridSize / 2,
                this.y + this.game.gridSize / 2,
                (this.game.gridSize / 2) * this.scale,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Efeito visual do timer
        if (this.timer < 1000) {
            // Piscar quando está prestes a explodir
            const flash = Math.floor(this.animationTime / 100) % 2;
            if (flash) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillRect(this.x, this.y, this.game.gridSize, this.game.gridSize);
            }
        }
        
        // Debug: mostrar timer
        if (false) { // Ativar para debug
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(
                Math.ceil(this.timer / 1000).toString(),
                this.x + this.game.gridSize / 2 - 6,
                this.y - 5
            );
        }
    }
}


// Classe do mapa
class GameMap {
    constructor(game) {
        this.game = game;
        this.width = game.mapWidth;
        this.height = game.mapHeight;
        this.gridSize = game.gridSize;
    }
    
    generate() {
        this.game.walls = [];
        
        // Gerar bordas do mapa
        this.generateBorders();
        
        // Gerar paredes sólidas internas (padrão clássico do Bomberman)
        this.generateSolidWalls();
        
        // Gerar paredes destrutíveis
        this.generateDestructibleWalls();
        
        console.log(`Mapa gerado: ${this.game.walls.length} paredes`);
    }
    
    generateBorders() {
        // Bordas horizontais (topo e fundo)
        for (let x = 0; x < this.width; x++) {
            // Topo
            this.game.walls.push(new Wall(
                this.game,
                x * this.gridSize,
                0,
                'solid'
            ));
            
            // Fundo
            this.game.walls.push(new Wall(
                this.game,
                x * this.gridSize,
                (this.height - 1) * this.gridSize,
                'solid'
            ));
        }
        
        // Bordas verticais (esquerda e direita)
        for (let y = 1; y < this.height - 1; y++) {
            // Esquerda
            this.game.walls.push(new Wall(
                this.game,
                0,
                y * this.gridSize,
                'solid'
            ));
            
            // Direita
            this.game.walls.push(new Wall(
                this.game,
                (this.width - 1) * this.gridSize,
                y * this.gridSize,
                'solid'
            ));
        }
    }
    
    generateSolidWalls() {
        // Padrão clássico: paredes sólidas em posições pares (exceto bordas)
        for (let x = 2; x < this.width - 1; x += 2) {
            for (let y = 2; y < this.height - 1; y += 2) {
                this.game.walls.push(new Wall(
                    this.game,
                    x * this.gridSize,
                    y * this.gridSize,
                    'solid'
                ));
            }
        }
    }
    
    generateDestructibleWalls() {
        const destructibleDensity = 0.7; // 70% de chance de ter parede destrutível
        
        for (let x = 1; x < this.width - 1; x++) {
            for (let y = 1; y < this.height - 1; y++) {
                // Pular se já existe uma parede sólida
                if (this.hasWallAt(x, y)) continue;
                
                // Pular área inicial do jogador (3x3 no canto superior esquerdo)
                if (x <= 2 && y <= 2) continue;
                
                // Pular algumas posições iniciais para garantir movimento
                if ((x === 1 && y === 3) || (x === 3 && y === 1)) continue;
                
                // Chance de criar parede destrutível
                if (Math.random() < destructibleDensity) {
                    this.game.walls.push(new Wall(
                        this.game,
                        x * this.gridSize,
                        y * this.gridSize,
                        'destructible'
                    ));
                }
            }
        }
    }
    
    hasWallAt(gridX, gridY) {
        return this.game.walls.some(wall => {
            const wallGrid = this.game.getGridPosition(wall.x, wall.y);
            return wallGrid.x === gridX && wallGrid.y === gridY;
        });
    }
    
    // Gerar mapas específicos por nível
    generateLevel(level) {
        switch (level) {
            case 1:
                this.generateLevel1();
                break;
            case 2:
                this.generateLevel2();
                break;
            case 3:
                this.generateLevel3();
                break;
            default:
                this.generateRandomLevel();
                break;
        }
    }
    
    generateLevel1() {
        // Nível básico - densidade baixa de paredes
        this.game.walls = [];
        this.generateBorders();
        this.generateSolidWalls();
        
        // Menos paredes destrutíveis
        const destructibleDensity = 0.5;
        this.generateDestructibleWallsWithDensity(destructibleDensity);
    }
    
    generateLevel2() {
        // Nível intermediário - densidade média
        this.game.walls = [];
        this.generateBorders();
        this.generateSolidWalls();
        
        const destructibleDensity = 0.65;
        this.generateDestructibleWallsWithDensity(destructibleDensity);
    }
    
    generateLevel3() {
        // Nível avançado - densidade alta
        this.game.walls = [];
        this.generateBorders();
        this.generateSolidWalls();
        
        const destructibleDensity = 0.8;
        this.generateDestructibleWallsWithDensity(destructibleDensity);
    }
    
    generateRandomLevel() {
        // Nível aleatório baseado no número do nível
        const density = Math.min(0.5 + (this.game.level * 0.1), 0.9);
        this.game.walls = [];
        this.generateBorders();
        this.generateSolidWalls();
        this.generateDestructibleWallsWithDensity(density);
    }
    
    generateDestructibleWallsWithDensity(density) {
        for (let x = 1; x < this.width - 1; x++) {
            for (let y = 1; y < this.height - 1; y++) {
                if (this.hasWallAt(x, y)) continue;
                if (x <= 2 && y <= 2) continue;
                if ((x === 1 && y === 3) || (x === 3 && y === 1)) continue;
                
                if (Math.random() < density) {
                    this.game.walls.push(new Wall(
                        this.game,
                        x * this.gridSize,
                        y * this.gridSize,
                        'destructible'
                    ));
                }
            }
        }
    }
    
    // Verificar se há caminho válido entre duas posições
    hasValidPath(startX, startY, endX, endY) {
        // Implementação simples de pathfinding (BFS)
        const visited = new Set();
        const queue = [{x: startX, y: startY}];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (current.x === endX && current.y === endY) {
                return true;
            }
            
            // Verificar vizinhos
            const neighbors = [
                {x: current.x + 1, y: current.y},
                {x: current.x - 1, y: current.y},
                {x: current.x, y: current.y + 1},
                {x: current.x, y: current.y - 1}
            ];
            
            for (const neighbor of neighbors) {
                if (neighbor.x >= 0 && neighbor.x < this.width &&
                    neighbor.y >= 0 && neighbor.y < this.height &&
                    !this.hasWallAt(neighbor.x, neighbor.y)) {
                    queue.push(neighbor);
                }
            }
        }
        
        return false;
    }
}

// Classe da parede
class Wall {
    constructor(game, x, y, type = 'solid') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type; // 'solid' ou 'destructible'
    }
    
    render(ctx) {
        const spriteName = this.type === 'solid' ? 'wall_solid' : 'wall_destructible';
        const sprite = this.game.sprites[spriteName];
        
        if (sprite) {
            ctx.drawImage(
                sprite,
                this.x,
                this.y,
                this.game.gridSize,
                this.game.gridSize
            );
        } else {
            // Fallback: desenhar retângulo colorido
            ctx.fillStyle = this.type === 'solid' ? '#666666' : '#8B4513';
            ctx.fillRect(this.x, this.y, this.game.gridSize, this.game.gridSize);
            
            // Adicionar borda
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.game.gridSize, this.game.gridSize);
        }
    }
    
    // Verificar se pode ser destruída
    isDestructible() {
        return this.type === 'destructible';
    }
}


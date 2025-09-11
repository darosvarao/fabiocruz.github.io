// Classe da explosão
class Explosion {
    constructor(game, x, y, type = 'center') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type; // 'center', 'horizontal', 'vertical'
        this.duration = 500; // 0.5 segundos
        this.timer = this.duration;
        this.shouldRemove = false;
        
        // Animação
        this.animationTime = 0;
        this.maxScale = 1.2;
        this.currentScale = 0.1;
        this.opacity = 1.0;
    }
    
    update(deltaTime) {
        this.timer -= deltaTime;
        this.animationTime += deltaTime;
        
        // Calcular escala e opacidade baseado no tempo
        const progress = 1 - (this.timer / this.duration);
        
        if (progress < 0.3) {
            // Fase de expansão
            this.currentScale = 0.1 + (progress / 0.3) * this.maxScale;
            this.opacity = 1.0;
        } else {
            // Fase de desaparecimento
            this.currentScale = this.maxScale;
            this.opacity = 1.0 - ((progress - 0.3) / 0.7);
        }
        
        // Verificar se deve ser removida
        if (this.timer <= 0) {
            this.shouldRemove = true;
        }
    }
    
    render(ctx) {
        // Salvar estado do contexto
        ctx.save();
        
        // Aplicar transparência
        ctx.globalAlpha = this.opacity;
        
        // Selecionar sprite baseado no tipo
        let spriteName = 'explosion_center';
        if (this.type === 'horizontal') {
            spriteName = 'explosion_horizontal';
        } else if (this.type === 'vertical') {
            spriteName = 'explosion_vertical';
        }
        
        const sprite = this.game.sprites[spriteName];
        
        if (sprite) {
            // Calcular posição e tamanho com efeito de escala
            const size = this.game.gridSize * this.currentScale;
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
            // Fallback: desenhar efeito de explosão simples
            this.renderFallbackExplosion(ctx);
        }
        
        // Restaurar estado do contexto
        ctx.restore();
    }
    
    renderFallbackExplosion(ctx) {
        const centerX = this.x + this.game.gridSize / 2;
        const centerY = this.y + this.game.gridSize / 2;
        const radius = (this.game.gridSize / 2) * this.currentScale;
        
        // Gradiente radial para simular explosão
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#FFFF00'); // Amarelo no centro
        gradient.addColorStop(0.5, '#FF8000'); // Laranja no meio
        gradient.addColorStop(1, '#FF0000'); // Vermelho nas bordas
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        if (this.type === 'center') {
            // Explosão circular
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        } else if (this.type === 'horizontal') {
            // Explosão horizontal (retângulo)
            ctx.fillRect(
                this.x,
                centerY - radius / 2,
                this.game.gridSize,
                radius
            );
        } else if (this.type === 'vertical') {
            // Explosão vertical (retângulo)
            ctx.fillRect(
                centerX - radius / 2,
                this.y,
                radius,
                this.game.gridSize
            );
        }
        
        ctx.fill();
        
        // Efeito de partículas simples
        this.renderParticles(ctx, centerX, centerY, radius);
    }
    
    renderParticles(ctx, centerX, centerY, radius) {
        const particleCount = 8;
        const time = this.animationTime / 1000;
        
        ctx.fillStyle = '#FFFF00';
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = radius * 0.8 * time;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;
            const particleSize = 3 * (1 - time);
            
            if (particleSize > 0) {
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Verificar se a explosão está ativa (para colisões)
    isActive() {
        return !this.shouldRemove && this.timer > 0;
    }
    
    // Obter área de dano da explosão
    getDamageArea() {
        return {
            x: this.x,
            y: this.y,
            width: this.game.gridSize,
            height: this.game.gridSize
        };
    }
}


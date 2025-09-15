// Classe dos power-ups
class PowerUp {
    constructor(game, x, y, type = 'speed') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type; // 'speed', 'bomb', 'range'
        this.shouldRemove = false;
        
        // Animação
        this.animationTime = 0;
        this.floatOffset = 0;
        this.floatSpeed = 2; // velocidade da flutuação
        this.floatAmplitude = 3; // amplitude da flutuação em pixels
        this.rotationAngle = 0;
        this.rotationSpeed = 2; // velocidade de rotação
        
        // Efeito de brilho
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
        // Tempo de vida (opcional - power-ups podem desaparecer após um tempo)
        this.lifetime = 30000; // 30 segundos
        this.timer = this.lifetime;
        this.blinking = false;
    }
    
    update(deltaTime) {
        this.animationTime += deltaTime;
        this.timer -= deltaTime;
        
        // Efeito de flutuação
        this.floatOffset = Math.sin(this.animationTime / 1000 * this.floatSpeed) * this.floatAmplitude;
        
        // Efeito de rotação
        this.rotationAngle += (this.rotationSpeed * deltaTime) / 1000;
        if (this.rotationAngle > Math.PI * 2) {
            this.rotationAngle -= Math.PI * 2;
        }
        
        // Efeito de brilho
        this.glowIntensity += (this.glowDirection * deltaTime) / 1000;
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
        
        // Verificar se está piscando (últimos 5 segundos)
        if (this.timer <= 5000) {
            this.blinking = true;
        }
        
        // Verificar se deve ser removido
        if (this.timer <= 0) {
            this.shouldRemove = true;
        }
    }
    
    render(ctx) {
        // Não renderizar se estiver piscando e for um frame ímpar
        if (this.blinking && Math.floor(this.animationTime / 200) % 2 === 0) {
            return;
        }
        
        // Salvar estado do contexto
        ctx.save();
        
        // Calcular posição com flutuação
        const renderX = this.x;
        const renderY = this.y + this.floatOffset;
        const centerX = renderX + this.game.gridSize / 2;
        const centerY = renderY + this.game.gridSize / 2;
        
        // Aplicar rotação
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotationAngle);
        ctx.translate(-centerX, -centerY);
        
        // Efeito de brilho
        if (this.glowIntensity > 0) {
            const glowSize = this.game.gridSize * (1 + this.glowIntensity * 0.3);
            const glowOffset = (glowSize - this.game.gridSize) / 2;
            
            ctx.shadowColor = this.getGlowColor();
            ctx.shadowBlur = 10 * this.glowIntensity;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // Selecionar sprite baseado no tipo
        const spriteName = `powerup_${this.type}`;
        const sprite = this.game.sprites[spriteName];
        
        if (sprite) {
            ctx.drawImage(
                sprite,
                renderX,
                renderY,
                this.game.gridSize,
                this.game.gridSize
            );
        } else {
            // Fallback: desenhar forma geométrica colorida
            this.renderFallback(ctx, renderX, renderY);
        }
        
        // Restaurar estado do contexto
        ctx.restore();
        
        // Renderizar indicador de tipo (texto)
        this.renderTypeIndicator(ctx, centerX, renderY - 5);
    }
    
    renderFallback(ctx, x, y) {
        const centerX = x + this.game.gridSize / 2;
        const centerY = y + this.game.gridSize / 2;
        const size = this.game.gridSize * 0.8;
        
        ctx.fillStyle = this.getColor();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        switch (this.type) {
            case 'speed':
                // Desenhar seta para cima (velocidade)
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - size/3);
                ctx.lineTo(centerX - size/4, centerY + size/6);
                ctx.lineTo(centerX - size/8, centerY + size/6);
                ctx.lineTo(centerX - size/8, centerY + size/3);
                ctx.lineTo(centerX + size/8, centerY + size/3);
                ctx.lineTo(centerX + size/8, centerY + size/6);
                ctx.lineTo(centerX + size/4, centerY + size/6);
                ctx.closePath();
                break;
                
            case 'bomb':
                // Desenhar círculo com cruz (mais bombas)
                ctx.beginPath();
                ctx.arc(centerX, centerY, size/3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                // Cruz
                ctx.beginPath();
                ctx.moveTo(centerX - size/6, centerY);
                ctx.lineTo(centerX + size/6, centerY);
                ctx.moveTo(centerX, centerY - size/6);
                ctx.lineTo(centerX, centerY + size/6);
                ctx.stroke();
                return;
                
            case 'range':
                // Desenhar explosão estilizada (maior alcance)
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = (i % 2 === 0) ? size/3 : size/5;
                    const px = centerX + Math.cos(angle) * radius;
                    const py = centerY + Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                break;
        }
        
        ctx.fill();
        ctx.stroke();
    }
    
    renderTypeIndicator(ctx, centerX, y) {
        if (this.blinking) return; // Não mostrar texto quando piscando
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        
        const text = this.getTypeText();
        ctx.strokeText(text, centerX, y);
        ctx.fillText(text, centerX, y);
    }
    
    getColor() {
        switch (this.type) {
            case 'speed':
                return '#00BFFF'; // Azul claro
            case 'bomb':
                return '#FF4500'; // Vermelho alaranjado
            case 'range':
                return '#FFD700'; // Dourado
            default:
                return '#FFFFFF';
        }
    }
    
    getGlowColor() {
        switch (this.type) {
            case 'speed':
                return '#00BFFF';
            case 'bomb':
                return '#FF4500';
            case 'range':
                return '#FFD700';
            default:
                return '#FFFFFF';
        }
    }
    
    getTypeText() {
        switch (this.type) {
            case 'speed':
                return 'SPEED';
            case 'bomb':
                return 'BOMB+';
            case 'range':
                return 'RANGE';
            default:
                return '';
        }
    }
    
    // Obter descrição do power-up
    getDescription() {
        switch (this.type) {
            case 'speed':
                return 'Aumenta a velocidade de movimento';
            case 'bomb':
                return 'Permite colocar mais bombas';
            case 'range':
                return 'Aumenta o alcance das explosões';
            default:
                return 'Power-up desconhecido';
        }
    }
    
    // Obter valor do power-up (para pontuação)
    getValue() {
        switch (this.type) {
            case 'speed':
                return 50;
            case 'bomb':
                return 75;
            case 'range':
                return 100;
            default:
                return 25;
        }
    }
}


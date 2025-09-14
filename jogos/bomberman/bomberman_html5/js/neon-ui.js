// BOMBERMAN NEON - UI SYSTEM

class NeonUI {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.livesElement = document.getElementById('lives');
        
        this.setupAnimations();
    }
    
    setupAnimations() {
        // Add neon glow animation to HUD elements
        const hudElements = document.querySelectorAll('.stat-value');
        hudElements.forEach(element => {
            element.style.textShadow = '0 0 10px #00ffff';
            element.style.transition = 'all 0.3s ease';
        });
    }
    
    updateHUD(score, level, lives) {
        this.updateScore(score);
        this.updateLevel(level);
        this.updateLives(lives);
    }
    
    updateScore(score) {
        if (this.scoreElement) {
            const oldScore = parseInt(this.scoreElement.textContent) || 0;
            this.scoreElement.textContent = score;
            
            // Animate score increase
            if (score > oldScore) {
                this.animateValueIncrease(this.scoreElement);
            }
        }
    }
    
    updateLevel(level) {
        if (this.levelElement) {
            const oldLevel = parseInt(this.levelElement.textContent) || 1;
            this.levelElement.textContent = level;
            
            // Animate level up
            if (level > oldLevel) {
                this.animateLevelUp(this.levelElement);
                this.showLevelUpNotification(level);
            }
        }
    }
    
    updateLives(lives) {
        if (this.livesElement) {
            const oldLives = parseInt(this.livesElement.textContent) || 3;
            this.livesElement.textContent = lives;
            
            // Animate life lost
            if (lives < oldLives) {
                this.animateLifeLost(this.livesElement);
            }
        }
    }
    
    animateValueIncrease(element) {
        element.style.transform = 'scale(1.2)';
        element.style.textShadow = '0 0 20px #00ffff, 0 0 30px #00ffff';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.textShadow = '0 0 10px #00ffff';
        }, 200);
    }
    
    animateLevelUp(element) {
        element.style.transform = 'scale(1.5)';
        element.style.textShadow = '0 0 30px #00ff00, 0 0 40px #00ff00';
        element.style.color = '#00ff00';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.textShadow = '0 0 10px #00ffff';
            element.style.color = '#00ffff';
        }, 500);
    }
    
    animateLifeLost(element) {
        element.style.transform = 'scale(0.8)';
        element.style.textShadow = '0 0 20px #ff0000, 0 0 30px #ff0000';
        element.style.color = '#ff0000';
        
        // Flash effect
        let flashes = 0;
        const flashInterval = setInterval(() => {
            element.style.opacity = element.style.opacity === '0.5' ? '1' : '0.5';
            flashes++;
            
            if (flashes >= 6) {
                clearInterval(flashInterval);
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
                element.style.textShadow = '0 0 10px #00ffff';
                element.style.color = '#00ffff';
            }
        }, 100);
    }
    
    showLevelUpNotification(level) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h2>NÍVEL ${level}</h2>
                <p>MATRIZ ATUALIZADA</p>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff00;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            z-index: 1000;
            box-shadow: 0 0 30px #00ff00;
            animation: levelUpPulse 2s ease-in-out;
        `;
        
        // Add animation keyframes
        if (!document.getElementById('levelUpStyles')) {
            const style = document.createElement('style');
            style.id = 'levelUpStyles';
            style.textContent = `
                @keyframes levelUpPulse {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                }
                .level-up-notification h2 {
                    color: #00ff00;
                    font-size: 2em;
                    margin: 0 0 10px 0;
                    text-shadow: 0 0 20px #00ff00;
                    font-family: 'Courier New', monospace;
                }
                .level-up-notification p {
                    color: #00ffff;
                    margin: 0;
                    font-size: 1.2em;
                    text-shadow: 0 0 10px #00ffff;
                    font-family: 'Courier New', monospace;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }
    
    showGameOverScreen(score, level) {
        // Update final stats
        const finalScore = document.getElementById('finalScore');
        const finalLevel = document.getElementById('finalLevel');
        
        if (finalScore) finalScore.textContent = score;
        if (finalLevel) finalLevel.textContent = level;
        
        // Add dramatic effect
        this.addGameOverEffect();
    }
    
    addGameOverEffect() {
        // Create screen flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #ff0000;
            opacity: 0.5;
            z-index: 999;
            pointer-events: none;
            animation: gameOverFlash 1s ease-out;
        `;
        
        // Add flash animation
        if (!document.getElementById('gameOverStyles')) {
            const style = document.createElement('style');
            style.id = 'gameOverStyles';
            style.textContent = `
                @keyframes gameOverFlash {
                    0% { opacity: 0.8; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 1000);
    }
    
    showPowerUpNotification(type) {
        const messages = {
            speed: 'VELOCIDADE AUMENTADA',
            bomb: 'BOMBAS EXTRAS',
            range: 'ALCANCE AMPLIADO'
        };
        
        const colors = {
            speed: '#00ffff',
            bomb: '#ff00ff',
            range: '#00ff00'
        };
        
        const notification = document.createElement('div');
        notification.className = 'powerup-notification';
        notification.textContent = messages[type] || 'POWER-UP COLETADO';
        
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid ${colors[type] || '#ffffff'};
            border-radius: 10px;
            padding: 15px 25px;
            color: ${colors[type] || '#ffffff'};
            font-family: 'Courier New', monospace;
            font-size: 1.1em;
            font-weight: bold;
            text-shadow: 0 0 10px ${colors[type] || '#ffffff'};
            box-shadow: 0 0 20px ${colors[type] || '#ffffff'};
            z-index: 1000;
            animation: powerUpSlide 2s ease-in-out;
        `;
        
        // Add animation
        if (!document.getElementById('powerUpStyles')) {
            const style = document.createElement('style');
            style.id = 'powerUpStyles';
            style.textContent = `
                @keyframes powerUpSlide {
                    0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                    20% { transform: translateX(-50%) translateY(0); opacity: 1; }
                    80% { transform: translateX(-50%) translateY(0); opacity: 1; }
                    100% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }
    
    addScreenShake(intensity = 5, duration = 300) {
        const gameScreen = document.getElementById('gameScreen');
        if (!gameScreen) return;
        
        const originalTransform = gameScreen.style.transform;
        let startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const currentIntensity = intensity * (1 - progress);
                const x = (Math.random() - 0.5) * currentIntensity;
                const y = (Math.random() - 0.5) * currentIntensity;
                
                gameScreen.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                gameScreen.style.transform = originalTransform;
            }
        };
        
        shake();
    }
}


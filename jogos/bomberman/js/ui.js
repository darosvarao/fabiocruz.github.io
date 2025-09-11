// Sistema de interface do usuário
class UI {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Menu principal
        document.getElementById('startGame').addEventListener('click', () => {
            this.showScreen('gameScreen');
            this.game.startGame();
        });
        
        document.getElementById('selectCharacter').addEventListener('click', () => {
            this.showScreen('characterSelect');
        });
        
        document.getElementById('instructions').addEventListener('click', () => {
            this.showScreen('instructionsScreen');
        });
        
        // Seleção de personagem
        document.querySelectorAll('.character-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remover seleção anterior
                document.querySelectorAll('.character-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Adicionar seleção atual
                option.classList.add('selected');
                
                // Definir personagem selecionado
                this.game.selectedCharacter = option.dataset.character;
                
                // Voltar ao menu após 1 segundo
                setTimeout(() => {
                    this.showScreen('mainMenu');
                }, 1000);
            });
        });
        
        document.getElementById('backToMenu').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Instruções
        document.getElementById('backToMenuFromInstructions').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Game Over
        document.getElementById('playAgain').addEventListener('click', () => {
            this.showScreen('gameScreen');
            this.game.startGame();
        });
        
        document.getElementById('backToMenuFromGameOver').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Pause
        document.getElementById('resumeGame').addEventListener('click', () => {
            this.game.resumeGame();
        });
        
        document.getElementById('backToMenuFromPause').addEventListener('click', () => {
            this.showScreen('mainMenu');
            this.game.gameState = 'menu';
        });
        
        // Botão de pause no jogo
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.game.pauseGame();
        });
        
        // Detectar se é dispositivo móvel
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Ajustar interface para mobile
        if (this.isMobile) {
            this.setupMobileInterface();
        }
    }
    
    setupMobileInterface() {
        // Mostrar controles touch
        document.getElementById('touchControls').style.display = 'flex';
        
        // Ajustar tamanho do canvas para mobile
        const canvas = document.getElementById('gameCanvas');
        const container = document.getElementById('gameContainer');
        
        // Função para redimensionar
        const resizeCanvas = () => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight - 200; // Espaço para controles
            
            const aspectRatio = 800 / 600;
            let newWidth = containerWidth;
            let newHeight = newWidth / aspectRatio;
            
            if (newHeight > containerHeight) {
                newHeight = containerHeight;
                newWidth = newHeight * aspectRatio;
            }
            
            canvas.style.width = newWidth + 'px';
            canvas.style.height = newHeight + 'px';
        };
        
        // Redimensionar no carregamento e quando a orientação mudar
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 100);
        });
        
        resizeCanvas();
        
        // Prevenir scroll no mobile
        document.body.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Vibração para feedback tátil (se suportado)
        this.setupHapticFeedback();
    }
    
    setupHapticFeedback() {
        if ('vibrate' in navigator) {
            // Vibrar quando colocar bomba
            const originalPlaceBomb = this.game.player?.placeBomb;
            if (originalPlaceBomb) {
                this.game.player.placeBomb = function() {
                    const result = originalPlaceBomb.call(this);
                    if (result !== false) {
                        navigator.vibrate(50); // Vibração curta
                    }
                    return result;
                };
            }
        }
    }
    
    showScreen(screenId) {
        // Ocultar todas as telas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Mostrar tela solicitada
        document.getElementById(screenId).classList.remove('hidden');
        
        // Ajustes específicos por tela
        if (screenId === 'gameScreen') {
            this.setupGameScreen();
        } else if (screenId === 'mainMenu') {
            this.setupMainMenu();
        }
    }
    
    setupGameScreen() {
        // Focar no canvas para capturar eventos de teclado
        document.getElementById('gameCanvas').focus();
        
        // Ocultar cursor do mouse no canvas (para imersão)
        document.getElementById('gameCanvas').style.cursor = 'none';
        
        // Configurar fullscreen em mobile
        if (this.isMobile && 'requestFullscreen' in document.documentElement) {
            // Opcional: entrar em fullscreen automaticamente
            // document.documentElement.requestFullscreen();
        }
    }
    
    setupMainMenu() {
        // Restaurar cursor
        document.getElementById('gameCanvas').style.cursor = 'default';
        
        // Sair do fullscreen se estiver ativo
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        
        // Atualizar preview do personagem selecionado
        this.updateCharacterPreview();
    }
    
    updateCharacterPreview() {
        const selectedCharacter = this.game.selectedCharacter;
        const previewImages = document.querySelectorAll('.character-preview .character-img');
        
        previewImages.forEach((img, index) => {
            const characters = ['axol', 'bisou', 'pepeca'];
            if (characters[index] === selectedCharacter) {
                img.style.border = '3px solid #e74c3c';
                img.style.transform = 'scale(1.1)';
            } else {
                img.style.border = '3px solid #3498db';
                img.style.transform = 'scale(1.0)';
            }
        });
    }
    
    // Mostrar notificações no jogo
    showNotification(message, duration = 2000) {
        // Criar elemento de notificação se não existir
        let notification = document.getElementById('gameNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'gameNotification';
            notification.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px 40px;
                border-radius: 10px;
                font-size: 1.2em;
                font-weight: bold;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.getElementById('gameScreen').appendChild(notification);
        }
        
        // Mostrar notificação
        notification.textContent = message;
        notification.style.opacity = '1';
        
        // Ocultar após o tempo especificado
        setTimeout(() => {
            notification.style.opacity = '0';
        }, duration);
    }
    
    // Atualizar estatísticas do jogo
    updateGameStats() {
        document.getElementById('score').textContent = this.game.score;
        document.getElementById('level').textContent = this.game.level;
        document.getElementById('lives').textContent = this.game.lives;
    }
    
    // Mostrar/ocultar loading
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
    
    // Configurar PWA (Progressive Web App)
    setupPWA() {
        // Registrar service worker se suportado
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('Erro ao registrar Service Worker:', error);
                });
        }
        
        // Detectar se pode ser instalado como app
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Mostrar botão de instalação personalizado
            this.showInstallButton(deferredPrompt);
        });
    }
    
    showInstallButton(deferredPrompt) {
        // Criar botão de instalação se não existir
        let installBtn = document.getElementById('installBtn');
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'installBtn';
            installBtn.textContent = 'INSTALAR APP';
            installBtn.className = 'menu-btn';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
            `;
            
            installBtn.addEventListener('click', () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('App instalado');
                    }
                    deferredPrompt = null;
                    installBtn.style.display = 'none';
                });
            });
            
            document.body.appendChild(installBtn);
        }
        
        installBtn.style.display = 'block';
    }
}


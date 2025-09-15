// BOMBERMAN NEON - MAIN CONTROLLER

class NeonBombermanGame {
    constructor() {
        this.currentScreen = 'loading';
        this.selectedCharacter = 'axol';
        this.game = null;
        this.ui = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showLoadingScreen();
        
        // Simular carregamento
        setTimeout(() => {
            this.showMainMenu();
        }, 3000);
    }
    
    setupEventListeners() {
        // Menu buttons
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('selectCharacter').addEventListener('click', () => this.showCharacterSelect());
        document.getElementById('instructions').addEventListener('click', () => this.showInstructions());
        
        // Character selection
        document.querySelectorAll('.character-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.character-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedCharacter = option.dataset.character;
            });
        });
        
        // Back buttons
        document.getElementById('backToMenu').addEventListener('click', () => this.showMainMenu());
        document.getElementById('backToMenuFromInstructions').addEventListener('click', () => this.showMainMenu());
        document.getElementById('backToMenuFromGameOver').addEventListener('click', () => this.showMainMenu());
        document.getElementById('backToMenuFromPause').addEventListener('click', () => this.showMainMenu());
        
        // Game controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeGame').addEventListener('click', () => this.resumeGame());
        document.getElementById('playAgain').addEventListener('click', () => this.startGame());
        
        // Touch controls
        document.querySelectorAll('.dpad-btn').forEach(btn => {
            if (btn.dataset.direction) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (this.game) {
                        this.game.handleInput(btn.dataset.direction, true);
                    }
                });
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    if (this.game) {
                        this.game.handleInput(btn.dataset.direction, false);
                    }
                });
            }
        });
        
        document.getElementById('bombBtn').addEventListener('click', () => {
            if (this.game) {
                this.game.placeBomb();
            }
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Character preview rotation
        this.setupCharacterPreview();
    }
    
    setupCharacterPreview() {
        const characters = document.querySelectorAll('.character-img');
        let currentIndex = 0;
        
        setInterval(() => {
            characters.forEach(char => char.classList.remove('active'));
            characters[currentIndex].classList.add('active');
            currentIndex = (currentIndex + 1) % characters.length;
        }, 2000);
    }
    
    handleKeyDown(e) {
        if (this.currentScreen === 'game' && this.game) {
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    this.game.handleInput('up', true);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    this.game.handleInput('down', true);
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    this.game.handleInput('left', true);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    this.game.handleInput('right', true);
                    break;
                case 'Space':
                    e.preventDefault();
                    this.game.placeBomb();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.pauseGame();
                    break;
            }
        }
    }
    
    handleKeyUp(e) {
        if (this.currentScreen === 'game' && this.game) {
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.game.handleInput('up', false);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.game.handleInput('down', false);
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.game.handleInput('left', false);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.game.handleInput('right', false);
                    break;
            }
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        this.currentScreen = screenId;
    }
    
    showLoadingScreen() {
        this.showScreen('loading');
    }
    
    showMainMenu() {
        this.showScreen('mainMenu');
        if (this.game) {
            this.game.destroy();
            this.game = null;
        }
    }
    
    showCharacterSelect() {
        this.showScreen('characterSelect');
    }
    
    showInstructions() {
        this.showScreen('instructionsScreen');
    }
    
    startGame() {
        this.showScreen('gameScreen');
        
        const canvas = document.getElementById('gameCanvas');
        this.game = new NeonGame(canvas, this.selectedCharacter);
        this.ui = new NeonUI();
        
        this.game.onGameOver = (score, level) => {
            this.showGameOver(score, level);
        };
        
        this.game.onScoreUpdate = (score, level, lives) => {
            this.ui.updateHUD(score, level, lives);
        };
        
        this.game.start();
    }
    
    pauseGame() {
        if (this.game) {
            this.game.pause();
            this.showScreen('pauseScreen');
        }
    }
    
    resumeGame() {
        if (this.game) {
            this.game.resume();
            this.showScreen('gameScreen');
        }
    }
    
    showGameOver(score, level) {
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalLevel').textContent = level;
        this.showScreen('gameOverScreen');
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.neonBomberman = new NeonBombermanGame();
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}


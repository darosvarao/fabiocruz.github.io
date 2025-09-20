// SNAKE CYBERPUNK - MAIN CONTROLLER

class SnakeCyberpunk {
    constructor() {
        this.currentScreen = 'loading';
        this.selectedCharacter = 'axol';
        this.game = null;
        this.loadingProgress = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startLoading();
    }
    
    setupEventListeners() {
        // Menu buttons
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('selectCharacter').addEventListener('click', () => this.showCharacterSelect());
        document.getElementById('instructions').addEventListener('click', () => this.showInstructions());
        
        // Character selection
        document.getElementById('backToMenu').addEventListener('click', () => this.showMainMenu());
        document.getElementById('confirmCharacter').addEventListener('click', () => this.confirmCharacter());
        
        // Instructions
        document.getElementById('backToMenuFromInstructions').addEventListener('click', () => this.showMainMenu());
        
        // Game controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeGame').addEventListener('click', () => this.resumeGame());
        document.getElementById('backToMenuFromPause').addEventListener('click', () => this.backToMenu());
        
        // Game over
        document.getElementById('playAgain').addEventListener('click', () => this.startGame());
        document.getElementById('backToMenuFromGameOver').addEventListener('click', () => this.showMainMenu());
        
        // Character selection
        document.querySelectorAll('.character-option').forEach(option => {
            option.addEventListener('click', () => this.selectCharacter(option.dataset.character));
        });
        
        // Touch controls
        document.querySelectorAll('.dpad-btn').forEach(btn => {
            if (btn.dataset.direction) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handleTouchDirection(btn.dataset.direction);
                });
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleTouchDirection(btn.dataset.direction);
                });
            }
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    startLoading() {
        const progressBar = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        const messages = [
            'Inicializando sistema neural...',
            'Carregando agentes cybernéticos...',
            'Sincronizando matriz digital...',
            'Ativando protocolo de evolução...',
            'Sistema pronto!'
        ];
        
        let messageIndex = 0;
        
        const loadingInterval = setInterval(() => {
            this.loadingProgress += 20;
            progressBar.style.width = this.loadingProgress + '%';
            
            if (messageIndex < messages.length) {
                loadingText.textContent = messages[messageIndex];
                messageIndex++;
            }
            
            if (this.loadingProgress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    this.showMainMenu();
                }, 1000);
            }
        }, 800);
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        this.currentScreen = screenId;
    }
    
    showMainMenu() {
        this.showScreen('mainMenu');
        this.updateCharacterPreview();
    }
    
    showCharacterSelect() {
        this.showScreen('characterSelect');
        this.updateCharacterSelection();
    }
    
    showInstructions() {
        this.showScreen('instructionsScreen');
    }
    
    selectCharacter(character) {
        this.selectedCharacter = character;
        this.updateCharacterSelection();
    }
    
    updateCharacterSelection() {
        document.querySelectorAll('.character-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-character="${this.selectedCharacter}"]`).classList.add('selected');
    }
    
    updateCharacterPreview() {
        const previewImage = document.getElementById('previewImage');
        previewImage.src = `assets/sprites/${this.selectedCharacter}_head.png`;
    }
    
    confirmCharacter() {
        this.showMainMenu();
    }
    
    startGame() {
        this.showScreen('gameScreen');
        if (this.game) {
            this.game.destroy();
        }
        this.game = new SnakeGame(this.selectedCharacter);
        this.game.start();
    }
    
    pauseGame() {
        if (this.game && this.game.isRunning) {
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
    
    backToMenu() {
        if (this.game) {
            this.game.destroy();
            this.game = null;
        }
        this.showMainMenu();
    }
    
    gameOver(stats) {
        document.getElementById('finalScore').textContent = stats.score;
        document.getElementById('finalLevel').textContent = stats.level;
        document.getElementById('finalLength').textContent = stats.length;
        document.getElementById('finalTime').textContent = stats.time;
        this.showScreen('gameOverScreen');
    }
    
    handleKeyPress(e) {
        if (this.currentScreen === 'gameScreen' && this.game) {
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    this.game.changeDirection('up');
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    this.game.changeDirection('down');
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    this.game.changeDirection('left');
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    this.game.changeDirection('right');
                    break;
                case 'Space':
                    e.preventDefault();
                    this.pauseGame();
                    break;
            }
        }
    }
    
    handleTouchDirection(direction) {
        if (this.currentScreen === 'gameScreen' && this.game) {
            this.game.changeDirection(direction);
        }
    }
}

// Initialize the game when page loads
let snakeCyberpunk;

document.addEventListener('DOMContentLoaded', () => {
    snakeCyberpunk = new SnakeCyberpunk();
});

// Prevent context menu on touch devices
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);


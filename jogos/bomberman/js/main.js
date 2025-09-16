// Arquivo principal - inicialização do jogo
let game;
let ui;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('BombermanGame - Iniciando...');
    
    // Criar instância do jogo
    game = new Game();
    
    // Criar sistema de UI
    ui = new UI(game);
    
    // Configurar PWA
    ui.setupPWA();
    
    // Aguardar carregamento dos assets
    const checkAssetsLoaded = () => {
        if (game.assetsLoaded) {
            console.log('Assets carregados com sucesso!');
            ui.hideLoading();
            
            // Mostrar menu principal
            ui.showScreen('mainMenu');
            
            // Configurar personagem padrão
            game.selectedCharacter = 'axol';
            ui.updateCharacterPreview();
            
        } else {
            // Verificar novamente em 100ms
            setTimeout(checkAssetsLoaded, 100);
        }
    };
    
    checkAssetsLoaded();
});

// Configurações globais
const CONFIG = {
    // Configurações do jogo
    GRID_SIZE: 32,
    MAP_WIDTH: 25,
    MAP_HEIGHT: 19,
    
    // Configurações do jogador
    PLAYER_SPEED: 150,
    PLAYER_LIVES: 3,
    
    // Configurações das bombas
    BOMB_TIMER: 3000,
    EXPLOSION_DURATION: 500,
    
    // Configurações dos power-ups
    POWERUP_SPAWN_CHANCE: 0.3,
    POWERUP_LIFETIME: 30000,
    
    // Pontuação
    POINTS_WALL_DESTROYED: 10,
    POINTS_BOMB_EXPLODED: 20,
    POINTS_POWERUP_COLLECTED: 50,
    POINTS_LEVEL_COMPLETED: 1000,
    
    // Configurações visuais
    ANIMATION_SPEED: 200,
    INVULNERABILITY_DURATION: 2000,
    
    // Configurações de áudio (para futuro)
    SOUND_ENABLED: true,
    MUSIC_ENABLED: true,
    VOLUME: 0.7
};

// Funções utilitárias globais
const Utils = {
    // Converter coordenadas de tela para grid
    screenToGrid: (x, y) => {
        return {
            x: Math.floor(x / CONFIG.GRID_SIZE),
            y: Math.floor(y / CONFIG.GRID_SIZE)
        };
    },
    
    // Converter coordenadas de grid para tela
    gridToScreen: (gridX, gridY) => {
        return {
            x: gridX * CONFIG.GRID_SIZE,
            y: gridY * CONFIG.GRID_SIZE
        };
    },
    
    // Calcular distância entre dois pontos
    distance: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Verificar colisão entre retângulos
    rectCollision: (rect1, rect2) => {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    // Gerar número aleatório entre min e max
    random: (min, max) => {
        return Math.random() * (max - min) + min;
    },
    
    // Gerar inteiro aleatório entre min e max
    randomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Clampar valor entre min e max
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },
    
    // Interpolar entre dois valores
    lerp: (start, end, factor) => {
        return start + (end - start) * factor;
    },
    
    // Formatar tempo em mm:ss
    formatTime: (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    // Salvar dados no localStorage
    saveData: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
            return false;
        }
    },
    
    // Carregar dados do localStorage
    loadData: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            return defaultValue;
        }
    }
};

// Sistema de estatísticas e conquistas
const Stats = {
    // Carregar estatísticas salvas
    load: () => {
        return Utils.loadData('bomberman_stats', {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            bestScore: 0,
            wallsDestroyed: 0,
            bombsExploded: 0,
            powerupsCollected: 0,
            totalPlayTime: 0,
            levelsCompleted: 0,
            charactersUnlocked: ['axol'], // Axol é desbloqueado por padrão
            achievements: []
        });
    },
    
    // Salvar estatísticas
    save: (stats) => {
        Utils.saveData('bomberman_stats', stats);
    },
    
    // Atualizar estatística específica
    update: (key, value) => {
        const stats = Stats.load();
        stats[key] = value;
        Stats.save(stats);
    },
    
    // Incrementar estatística
    increment: (key, amount = 1) => {
        const stats = Stats.load();
        stats[key] = (stats[key] || 0) + amount;
        Stats.save(stats);
    },
    
    // Verificar conquistas
    checkAchievements: () => {
        const stats = Stats.load();
        const achievements = [];
        
        // Conquista: Primeira vitória
        if (stats.gamesWon >= 1 && !stats.achievements.includes('first_win')) {
            achievements.push({
                id: 'first_win',
                name: 'Primeira Vitória',
                description: 'Vença seu primeiro jogo'
            });
        }
        
        // Conquista: Destruidor de paredes
        if (stats.wallsDestroyed >= 100 && !stats.achievements.includes('wall_destroyer')) {
            achievements.push({
                id: 'wall_destroyer',
                name: 'Destruidor de Paredes',
                description: 'Destrua 100 paredes'
            });
        }
        
        // Conquista: Mestre das bombas
        if (stats.bombsExploded >= 50 && !stats.achievements.includes('bomb_master')) {
            achievements.push({
                id: 'bomb_master',
                name: 'Mestre das Bombas',
                description: 'Exploda 50 bombas'
            });
        }
        
        // Adicionar novas conquistas às estatísticas
        if (achievements.length > 0) {
            stats.achievements.push(...achievements.map(a => a.id));
            Stats.save(stats);
            
            // Mostrar notificações das conquistas
            achievements.forEach(achievement => {
                ui.showNotification(`Conquista desbloqueada: ${achievement.name}!`, 3000);
            });
        }
        
        return achievements;
    }
};

// Sistema de configurações
const Settings = {
    // Carregar configurações
    load: () => {
        return Utils.loadData('bomberman_settings', {
            soundEnabled: true,
            musicEnabled: true,
            volume: 0.7,
            difficulty: 'normal', // easy, normal, hard
            controlScheme: 'arrows', // arrows, wasd
            showFPS: false,
            autoSave: true
        });
    },
    
    // Salvar configurações
    save: (settings) => {
        Utils.saveData('bomberman_settings', settings);
    },
    
    // Atualizar configuração específica
    update: (key, value) => {
        const settings = Settings.load();
        settings[key] = value;
        Settings.save(settings);
    }
};

// Tratamento de erros globais
window.addEventListener('error', (event) => {
    console.error('Erro no jogo:', event.error);
    
    // Mostrar mensagem de erro amigável ao usuário
    if (ui) {
        ui.showNotification('Ops! Algo deu errado. Recarregue a página.', 5000);
    }
});

// Tratamento de promessas rejeitadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada:', event.reason);
    event.preventDefault();
});

// Detectar se o jogo está sendo executado offline
window.addEventListener('online', () => {
    console.log('Conexão restaurada');
    if (ui) {
        ui.showNotification('Conexão restaurada!', 2000);
    }
});

window.addEventListener('offline', () => {
    console.log('Sem conexão com a internet');
    if (ui) {
        ui.showNotification('Modo offline ativado', 2000);
    }
});

// Prevenir zoom por pinch em dispositivos móveis
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});

// Prevenir menu de contexto (clique direito)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Log de inicialização
console.log('BombermanGamme v1.0');
console.log('Criado com HTML5, CSS3 e JavaScript');
console.log('Personagens: Axol, Bisou e Pepeca');

// Exportar para debug (apenas em desenvolvimento)
if (typeof window !== 'undefined') {
    window.BombermanGame = {
        game: () => game,
        ui: () => ui,
        config: CONFIG,
        utils: Utils,
        stats: Stats,
        settings: Settings
    };
}


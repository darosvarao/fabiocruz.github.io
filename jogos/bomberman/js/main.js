// Arquivo principal - inicialização do jogo (Rota 1)
let game;
let ui;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('BombermanGame - Iniciando...');

    try {
        if (typeof Game !== 'function') {
            console.warn('Classe Game ainda não está disponível. Garante que js/game.js é carregado ANTES deste ficheiro.');
        }

        // Criar instância do jogo
        game = new Game();

        // Criar sistema de UI
        if (typeof UI === 'function') {
            ui = new UI(game);
        } else {
            console.warn('Classe UI não encontrada. Algumas funcionalidades podem não estar disponíveis.');
        }

        if (ui && typeof ui.setupPWA === 'function') {
            ui.setupPWA();
        }

        // Aguardar assets
        const checkAssetsLoaded = () => {
            if (game && game.assetsLoaded) {
                console.log('Assets carregados com sucesso!');
                ui && ui.hideLoading && ui.hideLoading();
                ui && ui.showScreen && ui.showScreen('mainMenu');

                game.selectedCharacter = 'axol';
                ui && ui.updateCharacterPreview && ui.updateCharacterPreview();
            } else {
                setTimeout(checkAssetsLoaded, 100);
            }
        };
        checkAssetsLoaded();
    } catch (err) {
        console.error('Erro ao inicializar o jogo:', err);
    }
});

// Configurações globais
const CONFIG = {
    GRID_SIZE: 32,
    MAP_WIDTH: 25,   // 25*32 = 800
    MAP_HEIGHT: 19,  // 19*32 = 608 (ajusta o canvas lógico)
    PLAYER_SPEED: 150,
    PLAYER_LIVES: 3,
    BOMB_TIMER: 3000,
    EXPLOSION_DURATION: 500,
    POWERUP_SPAWN_CHANCE: 0.3,
    POWERUP_LIFETIME: 30000,
    POINTS_WALL_DESTROYED: 10,
    POINTS_BOMB_EXPLODED: 20,
    POINTS_POWERUP_COLLECTED: 50,
    POINTS_LEVEL_COMPLETED: 1000,
    ANIMATION_SPEED: 200,
    INVULNERABILITY_DURATION: 2000,
    SOUND_ENABLED: true,
    MUSIC_ENABLED: true,
    VOLUME: 0.7
};

// Utils
const Utils = {
    screenToGrid: (x, y) => ({ x: Math.floor(x / CONFIG.GRID_SIZE), y: Math.floor(y / CONFIG.GRID_SIZE) }),
    gridToScreen: (gx, gy) => ({ x: gx * CONFIG.GRID_SIZE, y: gy * CONFIG.GRID_SIZE }),
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    rectCollision: (r1, r2) => r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y,
    random: (min, max) => Math.random() * (max - min) + min,
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    clamp: (v, min, max) => Math.min(Math.max(v, min), max),
    lerp: (a, b, t) => a + (b - a) * t,
    formatTime: (ms) => {
        const sec = Math.floor(ms / 1000);
        const min = Math.floor(sec / 60);
        return `${String(min).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    },
    saveData: (k, d) => { try { localStorage.setItem(k, JSON.stringify(d)); return true; } catch(e){ console.error(e); return false; } },
    loadData: (k, def=null) => { try { const d = localStorage.getItem(k); return d ? JSON.parse(d) : def; } catch(e){ console.error(e); return def; } }
};

// Stats
const Stats = {
    load: () => Utils.loadData('bomberman_stats', {
        gamesPlayed: 0, gamesWon: 0, totalScore: 0, bestScore: 0,
        wallsDestroyed: 0, bombsExploded: 0, powerupsCollected: 0,
        totalPlayTime: 0, levelsCompleted: 0,
        charactersUnlocked: ['axol'], achievements: []
    }),
    save: (s) => Utils.saveData('bomberman_stats', s),
    update: (k, v) => { const s = Stats.load(); s[k] = v; Stats.save(s); },
    increment: (k, n=1) => { const s = Stats.load(); s[k] = (s[k]||0)+n; Stats.save(s); },
    checkAchievements: () => {
        const s = Stats.load(), a = [];
        if (s.gamesWon>=1 && !s.achievements.includes('first_win')) a.push({id:'first_win',name:'Primeira Vitória'});
        if (s.wallsDestroyed>=100 && !s.achievements.includes('wall_destroyer')) a.push({id:'wall_destroyer',name:'Destruidor de Paredes'});
        if (s.bombsExploded>=50 && !s.achievements.includes('bomb_master')) a.push({id:'bomb_master',name:'Mestre das Bombas'});
        if (a.length){ s.achievements.push(...a.map(x=>x.id)); Stats.save(s); a.forEach(x=>ui && ui.showNotification && ui.showNotification(`Conquista: ${x.name}`,3000)); }
        return a;
    }
};

// Settings
const Settings = {
    load: () => Utils.loadData('bomberman_settings', {
        soundEnabled:true,musicEnabled:true,volume:0.7,difficulty:'normal',
        controlScheme:'arrows',showFPS:false,autoSave:true
    }),
    save: (s) => Utils.saveData('bomberman_settings', s),
    update: (k,v) => { const s=Settings.load(); s[k]=v; Settings.save(s); }
};

// Global error handlers
window.addEventListener('error', e => { console.error('Erro:', e.error); ui && ui.showNotification && ui.showNotification('Ops! Algo deu errado.', 5000); });
window.addEventListener('unhandledrejection', e => { console.error('Promise rejeitada:', e.reason); e.preventDefault(); });
window.addEventListener('online', ()=> ui && ui.showNotification && ui.showNotification('Conexão restaurada!',2000));
window.addEventListener('offline',()=> ui && ui.showNotification && ui.showNotification('Modo offline!',2000));

// Prevenir gestos/menus
['gesturestart','gesturechange','gestureend','contextmenu'].forEach(evt=>{
    document.addEventListener(evt,e=>e.preventDefault(),{passive:false});
});

// Logs
console.log('BombermanGame v1.0');
console.log('Criado com HTML5, CSS3 e JavaScript');
console.log('Personagens: Axol, Bisou e Pepeca');

// Export global
if (typeof window!=='undefined'){
    if (typeof Game==='function'){ window.Game=Game; window.BombermanGame=Game; }
    if (typeof UI==='function'){ window.UI=UI; }
    window.__BM={game:()=>game,ui:()=>ui,config:CONFIG,utils:Utils,stats:Stats,settings:Settings};
}

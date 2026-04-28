export class UI {
    constructor(game) {
        this.game = game;
        
        // Elements
        this.hud = document.getElementById('hud');
        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('high-score');
        this.coinsEl = document.getElementById('coins');
        
        this.startScreen = document.getElementById('start-screen');
        this.startButton = document.getElementById('start-button');
        
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.restartButton = document.getElementById('restart-button');
        this.finalScoreEl = document.getElementById('final-score');
        this.finalCoinsEl = document.getElementById('final-coins');
        this.bestScoreEl = document.getElementById('best-score');
        
        this.initListeners();
    }

    initListeners() {
        this.startButton.addEventListener('click', () => {
            this.startScreen.classList.add('hidden');
            this.game.start();
        });

        this.restartButton.addEventListener('click', () => {
            this.gameOverScreen.classList.add('hidden');
            this.game.start();
        });
    }

    showHUD() {
        this.hud.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.startScreen.classList.add('hidden');
    }

    showGameOver(score, coins, best) {
        this.hud.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        
        this.finalScoreEl.innerText = score;
        this.finalCoinsEl.innerText = coins;
        this.bestScoreEl.innerText = best;
    }

    updateScore(score) {
        this.scoreEl.innerText = score;
    }

    updateCoins(coins) {
        this.coinsEl.innerText = coins;
    }

    updateHighScore(highScore) {
        this.highScoreEl.innerText = highScore;
    }
}

import * as THREE from 'three';
import { Player } from './Player.js';
import { World } from './World.js';
import { UI } from './UI.js';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.world = null;
        this.ui = null;
        
        this.state = 'START'; // START, PLAYING, GAMEOVER
        this.clock = new THREE.Clock();
        this.score = 0;
        this.coins = 0;
        this.highScore = localStorage.getItem('endlessRunnerHighScore') || 0;
        
        this.baseSpeed = 0.5;
        this.currentSpeed = 0;
        this.speedIncrement = 0.0001;
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000814);
        this.scene.fog = new THREE.Fog(0x000814, 10, 50);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 2, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

        // Components
        this.ui = new UI(this);
        this.player = new Player(this);
        this.world = new World(this);

        this.scene.add(this.player.mesh);
        
        this.ui.updateHighScore(this.highScore);
    }

    start() {
        this.state = 'PLAYING';
        this.score = 0;
        this.coins = 0;
        this.currentSpeed = this.baseSpeed;
        this.player.reset();
        this.world.reset();
        this.ui.showHUD();
    }

    gameOver() {
        this.state = 'GAMEOVER';
        if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('endlessRunnerHighScore', this.highScore);
        }
        this.ui.showGameOver(Math.floor(this.score), this.coins, this.highScore);
    }

    update() {
        const delta = this.clock.getDelta();

        if (this.state === 'PLAYING') {
            this.currentSpeed += this.speedIncrement;
            this.score += this.currentSpeed * 0.1;
            
            this.player.update(delta);
            this.world.update(this.currentSpeed);
            
            this.ui.updateScore(Math.floor(this.score));
            this.ui.updateCoins(this.coins);

            this.checkCollisions();
        }

        this.renderer.render(this.scene, this.camera);
    }

    checkCollisions() {
        // Collision with obstacles
        const playerBox = this.player.getHitbox();
        
        for (const obstacle of this.world.obstacles) {
            if (playerBox.intersectsBox(obstacle.hitbox)) {
                this.gameOver();
                return;
            }
        }

        // Collision with coins
        for (let i = this.world.coins.length - 1; i >= 0; i--) {
            const coin = this.world.coins[i];
            if (playerBox.intersectsBox(coin.hitbox)) {
                this.coins++;
                this.world.removeCoin(i);
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

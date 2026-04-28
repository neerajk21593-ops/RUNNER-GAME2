import * as THREE from 'three';
import { Game } from './Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();

    function animate() {
        requestAnimationFrame(animate);
        game.update();
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        game.onWindowResize();
    });
});

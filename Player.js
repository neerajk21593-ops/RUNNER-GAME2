import * as THREE from 'three';

export class Player {
    constructor(game) {
        this.game = game;
        this.mesh = this.createPlayerMesh();
        
        this.lane = 1; // 0: Left, 1: Center, 2: Right
        this.laneWidth = 4;
        this.targetX = 0;
        
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = -40;
        this.jumpStrength = 18;
        
        this.isSliding = false;
        this.slideTimer = 0;
        this.slideDuration = 0.8;
        
        this.hitbox = new THREE.Box3();
        
        this.initControls();
    }

    createPlayerMesh() {
        const group = new THREE.Group();
        
        // Body (center at y=1.2, height 1.6 -> bottom at 0.4)
        // Let's make it simpler: bottom at 0.
        const bodyGeo = new THREE.BoxGeometry(1, 1.6, 1);
        const bodyMat = new THREE.MeshPhongMaterial({ color: 0x00ffff });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.8; // Center at 0.8 makes bottom at 0
        group.add(body);

        // Head
        const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const headMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.9; // 1.6 + 0.3
        group.add(head);

        return group;
    }

    initControls() {
        window.addEventListener('keydown', (e) => {
            if (this.game.state !== 'PLAYING') return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.moveLane(-1);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.moveLane(1);
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                case ' ':
                    this.jump();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.slide();
                    break;
            }
        });
    }

    moveLane(direction) {
        this.lane = THREE.MathUtils.clamp(this.lane + direction, 0, 2);
        this.targetX = (this.lane - 1) * this.laneWidth;
    }

    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.jumpVelocity = this.jumpStrength;
        }
    }

    slide() {
        if (!this.isSliding) {
            this.isSliding = true;
            this.slideTimer = this.slideDuration;
            this.mesh.scale.y = 0.5;
            
            // If jumping, force land
            if (this.isJumping) {
                this.jumpVelocity = -this.jumpStrength;
            }
        }
    }

    reset() {
        this.lane = 1;
        this.targetX = 0;
        this.mesh.position.set(0, 0, 0);
        this.isJumping = false;
        this.isSliding = false;
        this.mesh.scale.y = 1;
        this.jumpVelocity = 0;
    }

    update(delta) {
        // Smooth lane movement
        this.mesh.position.x = THREE.MathUtils.lerp(this.mesh.position.x, this.targetX, 12 * delta);

        // Jump physics
        if (this.isJumping) {
            this.mesh.position.y += this.jumpVelocity * delta;
            this.jumpVelocity += this.gravity * delta;

            if (this.mesh.position.y <= 0) {
                this.mesh.position.y = 0;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }

        // Slide logic
        if (this.isSliding) {
            this.slideTimer -= delta;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.mesh.scale.y = 1;
            }
        }

        // Update hitbox
        this.hitbox.setFromObject(this.mesh);
    }

    getHitbox() {
        return this.hitbox;
    }
}

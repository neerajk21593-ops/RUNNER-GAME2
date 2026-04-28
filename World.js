import * as THREE from 'three';

export class World {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.coins = [];
        this.floors = [];
        
        this.floorLength = 100;
        this.spawnDistance = 80;
        this.nextSpawnZ = -40;
        
        this.init();
    }

    init() {
        // Create two floor segments for seamless looping
        this.floors.push(this.createFloor(0));
        this.floors.push(this.createFloor(-this.floorLength));
        
        this.floors.forEach(f => this.game.scene.add(f));
    }

    createFloor(z) {
        const geo = new THREE.PlaneGeometry(15, this.floorLength);
        const mat = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const floor = new THREE.Mesh(geo, mat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.z = z;
        
        // Add lane markers
        const grid = new THREE.GridHelper(15, 3, 0x444444, 0x222222);
        grid.rotation.x = Math.PI / 2;
        grid.position.z = 0.1; // Just above plane
        floor.add(grid);
        
        return floor;
    }

    reset() {
        // Clear obstacles
        this.obstacles.forEach(o => this.game.scene.remove(o.mesh));
        this.obstacles = [];
        
        // Clear coins
        this.coins.forEach(c => this.game.scene.remove(c.mesh));
        this.coins = [];
        
        // Reset floors
        this.floors[0].position.z = 0;
        this.floors[1].position.z = -this.floorLength;
        
        this.nextSpawnZ = -40;
    }

    update(speed) {
        // Move floors
        this.floors.forEach(floor => {
            floor.position.z += speed;
            if (floor.position.z > this.floorLength) {
                floor.position.z -= this.floorLength * 2;
            }
        });

        // Move obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.mesh.position.z += speed;
            o.hitbox.setFromObject(o.mesh);
            
            if (o.mesh.position.z > 10) {
                this.game.scene.remove(o.mesh);
                this.obstacles.splice(i, 1);
            }
        }

        // Move coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const c = this.coins[i];
            c.mesh.position.z += speed;
            c.mesh.rotation.y += 0.05;
            c.hitbox.setFromObject(c.mesh);
            
            if (c.mesh.position.z > 10) {
                this.removeCoin(i);
            }
        }

        // Spawn logic
        this.nextSpawnZ += speed;
        if (this.nextSpawnZ > 0) {
            this.spawnPattern();
            this.nextSpawnZ = -25; // Spacing
        }
    }

    spawnPattern() {
        const z = -this.spawnDistance;
        const rand = Math.random();
        
        if (rand < 0.7) {
            this.spawnObstacle(z);
        } else {
            this.spawnCoin(z);
        }
    }

    spawnObstacle(z) {
        const lane = Math.floor(Math.random() * 3);
        const x = (lane - 1) * 4;
        
        const types = ['ROCK', 'BARRIER', 'HIGH_BARRIER'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let geo, mat, mesh;
        
        if (type === 'ROCK') {
            geo = new THREE.DodecahedronGeometry(1.0);
            mat = new THREE.MeshPhongMaterial({ color: 0x888888 });
            mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, 0.5, z);
        } else if (type === 'BARRIER') {
            geo = new THREE.BoxGeometry(3, 1.2, 0.5);
            mat = new THREE.MeshPhongMaterial({ color: 0xff4400 });
            mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, 0.6, z);
        } else { // HIGH_BARRIER
            geo = new THREE.BoxGeometry(4, 2, 0.5);
            mat = new THREE.MeshPhongMaterial({ color: 0xff00ff });
            mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, 2.3, z); // Bottom at 2.3 - 1 = 1.3
        }

        const hitbox = new THREE.Box3().setFromObject(mesh);
        this.obstacles.push({ mesh, hitbox });
        this.game.scene.add(mesh);
    }

    spawnCoin(z) {
        const lane = Math.floor(Math.random() * 3);
        const x = (lane - 1) * 4;
        
        const geo = new THREE.TorusGeometry(0.5, 0.2, 8, 16);
        const mat = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0x333300 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 1.5, z);
        
        const hitbox = new THREE.Box3().setFromObject(mesh);
        this.coins.push({ mesh, hitbox });
        this.game.scene.add(mesh);
    }

    removeCoin(index) {
        this.game.scene.remove(this.coins[index].mesh);
        this.coins.splice(index, 1);
    }
}

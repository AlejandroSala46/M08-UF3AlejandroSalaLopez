import * as Phaser from "phaser";
import { min } from "rxjs";

export class Scene1 extends Phaser.Scene {
    playerShip!: Phaser.Physics.Arcade.Sprite;
    playerBullets: Phaser.Physics.Arcade.Sprite[] = [];  // Arreglo de balas
    enemyShip!: Phaser.Physics.Arcade.Sprite;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys: any;
    moveDirection: { x: number, y: number } = { x: 0, y: 0 };
    scoreText!: Phaser.GameObjects.Text;
    score: number = 0;
    lastShotTime: number = 0;
    shootCooldown: number = 300; // milisegundos entre disparos

    // Arreglo para almacenar enemigos
    enemies: Phaser.Physics.Arcade.Sprite[] = [];

    constructor() {
        super('scene1')
    }

    preload() {
        this.load.spritesheet('playerShip', 'assets/Ship1/Ship1.png', { frameWidth: 50, frameHeight: 50 });
        this.load.spritesheet('enemyShip', 'assets/Ship3/Ship3.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('playerBullet', 'assets/Shots/Shot1/shot1_asset.png', { frameWidth: 40, frameHeight: 40 })
        this.load.image('background', 'assets/space.background.png');

    }

    create() {

        var screenWidth = Math.min(innerWidth, 1080);

        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background').setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.playerShip = this.physics.add.sprite(screenWidth / 2, innerHeight, 'playerShip').setAngle(90);
        this.playerShip.setSize(40, 48); // Ajusta el tamaño de la hitbox (ancho, alto)
        this.playerShip.setOffset(-2, 0); // Ajusta el desplazamiento de la hitbox si es necesario
        this.playerShip.setCollideWorldBounds(true);

        this.physics.world.collide(this.playerBullets, this.enemies); // Colisión entre balas y enemigos

        //DEBUG DE HITBOX:
        // Activar la depuración de las hitboxes para todos los objetos de física
        this.physics.world.drawDebug = true;
        this.physics.world.debugGraphic = this.add.graphics(); // Graficar las cajas de colisión
        this.physics.world.debugGraphic.lineStyle(1, 0x00ff00, 1); // Estilo de la línea (color y grosor)
        this.physics.world.debugGraphic.strokeRect(0, 0, 200, 200); // Dibuja la hitbox

        // PC: teclado
        this.wasdKeys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            space: 'space'
        });


        this.scoreText = this.add.text(screenWidth / 2, 16, this.score.toString(), { fontSize: '40px', fill: '#FFFFFF' })

        // Crear el temporizador para generar enemigos cada segundo
        this.time.addEvent({
            delay: 1000, // cada 1000 ms (1 segundo)
            callback: this.createEnemy, // callback que se llama cada vez que se genera un enemigo
            callbackScope: this, // para que el callback tenga acceso a `this`
            loop: true // hacer que el evento se repita
        });

        this.physics.add.overlap(this.playerBullets, this.enemies, (bullet, enemy) => {
            // Casting explícito para asegurar que son Phaser.Physics.Arcade.Sprite
            const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
            const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;

            this.handleBulletEnemyCollision(bulletSprite, enemySprite);
        });


    }

    override update(time: number, delta: number) {
        var speed = 300;


        // Teclado WASD
        this.playerShip.setVelocity(0);
        if (this.wasdKeys.left.isDown) this.playerShip.setVelocityX(-speed);
        else if (this.wasdKeys.right.isDown) this.playerShip.setVelocityX(speed);

        if (this.wasdKeys.up.isDown) this.playerShip.setVelocityY(-speed);
        else if (this.wasdKeys.down.isDown) this.playerShip.setVelocityY(speed);

        if (this.wasdKeys.space.isDown && time - this.lastShotTime > this.shootCooldown) {
            this.shoot(90, 'playerBullet');
            this.lastShotTime = time;
        }
        // Verificar colisión entre balas y enemigos

        this.enemies.forEach(enemy => {
            if (enemy.y > innerHeight) {
                enemy.destroy();
                this.enemies.splice(this.enemies.indexOf(enemy), 1); // Elimina el elemento en el índice encontrado
            }
        })

        this.playerBullets.forEach(playerBullet => {
            if (playerBullet.y < 0) {
                playerBullet.destroy();
                this.playerBullets.splice(this.playerBullets.indexOf(playerBullet), 1); // Elimina el elemento en el índice encontrado
            }
        })


    }

    shoot(angle: number, bulletSprite: string) {

        var velocity: number = 0;

        if (angle === 90) velocity = -500;
        else if (angle === 270) velocity = 500;

        const bullet = this.physics.add.sprite(
            this.playerShip.x,
            this.playerShip.y,
            bulletSprite
        )
            .setAngle(angle)
            .setVelocityY(velocity);

        // Cambiar el tamaño de la hitbox de la bala
        bullet.setSize(10, 20); // Ajusta el tamaño de la hitbox de la bala (ancho, alto)

        if (bulletSprite === 'playerBullet') {
            this.playerBullets.push(bullet);

            this.playerBullets.forEach(bullet => {
                console.log('bala');
            });
        }




    }

    // Función para crear enemigos
    createEnemy() {
        // Generar una posición aleatoria para el enemigo en la parte superior de la pantalla
        const enemyX = Phaser.Math.Between(50, this.cameras.main.width - 50); // Aleatorio entre 50 y el ancho de la pantalla
        console.log('se genera enemigo');
        const enemy = this.physics.add.sprite(enemyX, -50, 'enemyShip')
            .setAngle(270) // Orientar al enemigo hacia abajo
            .setOrigin(0.5, 0.5)
            .setVelocityY(100); // Velocidad de movimiento del enemigo hacia abajo

        // Cambiar el tamaño de la hitbox del enemigo
        enemy.setSize(60, 100); // Ajusta el tamaño de la hitbox (ancho, alto)

        // Agregar el enemigo al arreglo de enemigos
        this.enemies.push(enemy);
    }

    updateScore() {
        this.scoreText.setText(this.score.toString());
    }

    handleBulletEnemyCollision(bullet: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
        console.log('Colisión entre bala y enemigo');
        bullet.destroy();
        enemy.destroy();
        this.score += 10; // Aumentar la puntuación
        this.updateScore(); // Actualizar la puntuación en pantalla
    }



}
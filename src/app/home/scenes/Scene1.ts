import * as Phaser from "phaser";
/* NOTA: 

Simplemente comentar que sinceramente creo que esta ha sido la practica que mas he disfrutado de todo el curso, me ha parecido super divertida y entretenida. 
Me ha dado rabia que sea en la recta final donde no le he podido dar mas tiempo... 
Me hubiese encantado meter powerups aleatorios que te hiciesen distintos boosts (tipo disparo triple o mas velocidad), meter mas enemigos con diferentes ataques y movimientos
o incluso meter algun "boss". 

Sin embargo, como he comentado, me ha encantado y me he viciado bastante al final al juego (aun asi no he conseguido mucha puntuacion).

Como supongo que ya habras visto, me he ido un poco de la idea original, que era hacer un juego de asteroides, pero me parecia un reto mas divertido hacer un juego a lo
space invaders (aunque hacer un sistema donde los asteroides reboten por las paredes de la pantalla tambien me llamaba bastante). 

Simplemente queria hacer esta nota a modo de: gracias por hacer una practica tan entretenida y curiosa. 

*/

export class Scene1 extends Phaser.Scene {
    playerShip!: Phaser.Physics.Arcade.Sprite;
    playerBullets: Phaser.Physics.Arcade.Sprite[] = [];  // Arreglo de balas
    enemyShip!: Phaser.Physics.Arcade.Sprite;
    enemyBullets: Phaser.Physics.Arcade.Sprite[] = [];
    lastEnemyShootTimes: Map<Phaser.Physics.Arcade.Sprite, number> = new Map();
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys: any;
    moveDirection: { x: number, y: number } = { x: 0, y: 0 };
    scoreText!: Phaser.GameObjects.Text;
    score: number = 0;
    lastShotTime: number = 0;
    shootCooldownPlayer: number = 300; // milisegundos entre disparos
    shootCooldownEnemies: number = 900;
    lastDelayUpdate: number = 0; // Marca de tiempo del último cambio
    enemSpawnDelay = 3000;

    private backgroundMusic: Phaser.Sound.BaseSound | null = null; // Variable para guardar el sonido de fondo

    enemySpawnEvent!: Phaser.Time.TimerEvent;

    gamePaused: Boolean = false;

    // Arreglo para almacenar enemigos
    enemies: Phaser.Physics.Arcade.Sprite[] = [];

    constructor() {
        super({ key: 'Scene1' });
    }

    preload() { 
        this.load.spritesheet('playerShip', 'assets/Ship1/Ship1.png', { frameWidth: 50, frameHeight: 50 });
        this.load.spritesheet('enemyShip', 'assets/Ship3/Ship3.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('playerBullet', 'assets/Shots/Shot1/shot1_asset.png', { frameWidth: 40, frameHeight: 40 })
        this.load.spritesheet('enemyBullet', 'assets/Shots/Shot3/shot3_asset.png', { frameWidth: 60, frameHeight: 60 })
        this.load.image('enemyExplosion1', 'assets/Explosions/Ship3_Explosion/Ship3_Explosion_009.png');
        this.load.image('enemyExplosion2', 'assets/Explosions/Ship3_Explosion/Ship3_Explosion_012.png');
        this.load.image('enemyExplosion3', 'assets/Explosions/Ship3_Explosion/Ship3_Explosion_013.png');
        this.load.image('enemyExplosion4', 'assets/Explosions/Ship3_Explosion/Ship3_Explosion_015.png');
        this.load.image('enemyExplosion5', 'assets/Explosions/Ship3_Explosion/Ship3_Explosion_018.png');
        this.load.image('background', 'assets/space.background.png');

        this.load.audio('battleSong', 'assets/sounds/battleSong.mp3');
        this.load.audio('gameOverMusic', 'assets/sounds/gameOverMusic.mp3');
        this.load.audio('explosion', 'assets/sounds/explosionSound.mp3');
        this.load.audio('click', 'assets/sounds/clickSound.mp3');
        this.load.audio('shot', 'assets/sounds/shotSound.mp3');

    }

    create() {

        var screenWidth = Math.min(innerWidth, 1080); //Como maximo la pantalla tiene que ser de 1080 de ancho

        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background').setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.playerShip = this.physics.add.sprite(screenWidth / 2, innerHeight, 'playerShip').setAngle(90);
        this.playerShip.setSize(33, 46); // Ajusta el tamaño de la hitbox (ancho, alto)
        this.playerShip.setOffset(2, 0); // Ajusta el desplazamiento de la hitbox si es necesario
        this.playerShip.setCollideWorldBounds(true);
        this.playerShip.setOrigin(0.5, 0.5);

        this.physics.world.collide(this.playerBullets, this.enemies); // Colisión entre balas y enemigos

        //DEBUG DE HITBOX:
        // Activar la depuración de las hitboxes para todos los objetos de física
        /*this.physics.world.drawDebug = true;
        this.physics.world.debugGraphic = this.add.graphics(); // Graficar las cajas de colisión
        this.physics.world.debugGraphic.lineStyle(1, 0x00ff00, 1); // Estilo de la línea (color y grosor)
        this.physics.world.debugGraphic.strokeRect(0, 0, 200, 200); // Dibuja la hitbox*/

        //Animacion explosion
        this.anims.create({
            key: 'explode',
            frames: [
                { key: 'enemyExplosion1', frame: 'enemyExplosion1' }, 
                { key: 'enemyExplosion2', frame: 'enemyExplosion2' },
                { key: 'enemyExplosion3', frame: 'enemyExplosion3' },
                { key: 'enemyExplosion4', frame: 'enemyExplosion4' },
                { key: 'enemyExplosion5', frame: 'enemyExplosion5' },
            ],
            frameRate: 15,
            hideOnComplete: true
        });

        //Activamos el input de teclado
        this.input.keyboard.enabled = true;

        // PC: teclado
        this.wasdKeys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            space: 'space',
            pause: Phaser.Input.Keyboard.KeyCodes.ESC
        });

        
        this.scoreText = this.add.text(screenWidth / 2, 16, this.score.toString(), { fontSize: '40px', fill: '#FFFFFF' })

        // Crear el temporizador para generar enemigos cada segundo
        this.enemySpawnEvent = this.time.addEvent({
            delay: this.enemSpawnDelay, // cada 1000 ms (1 segundo)
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

        this.physics.add.overlap(this.enemyBullets, this.playerShip, (bullet, player) => {
            // Casting explícito para asegurar que son Phaser.Physics.Arcade.Sprite
            const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite;
            const playerSprite = player as Phaser.Physics.Arcade.Sprite;

            this.gameOver();
        });

        this.physics.add.overlap(this.enemies, this.playerShip, (enemy, player) => {
            // Casting explícito para asegurar que son Phaser.Physics.Arcade.Sprite
            const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
            const playerSprite = player as Phaser.Physics.Arcade.Sprite;

            this.gameOver();
        });

        // Reproducir la música de fondo si no está sonando
        if (this.backgroundMusic == null || !this.backgroundMusic.isPlaying) {
            this.backgroundMusic = this.sound.add('battleSong', {
                loop: true,  // Hace que la música se repita
                volume: 0.5,  // Ajusta el volumen entre 0 (silencio) y 1 (máximo volumen)
            });

            this.backgroundMusic.play();
        }



    }

    override update(time: number, delta: number) {
        var speed = 300;
        if (this.gamePaused) return;

        // Teclado WASD
        this.playerShip.setVelocity(0);

        if (this.wasdKeys) {
            //Movimiento
            if (this.wasdKeys.left.isDown) this.playerShip.setVelocityX(-speed);
            else if (this.wasdKeys.right.isDown) this.playerShip.setVelocityX(speed);

            if (this.wasdKeys.up.isDown) this.playerShip.setVelocityY(-speed);
            else if (this.wasdKeys.down.isDown) this.playerShip.setVelocityY(speed);
            
            //Disparar
            if (this.wasdKeys.space.isDown && time - this.lastShotTime > this.shootCooldownPlayer) {
                console.log('disparo')
                this.shoot(90, 'playerBullet', this.playerShip);
                this.lastShotTime = time;
            }
            //Pausa
            if (this.wasdKeys.pause.isDown){
                this.gamePause();
            }

        }

        // Verificar colisión entre balas y enemigos
        this.enemies.forEach(enemy => {
            if (enemy.y > innerHeight) {
                enemy.destroy();
                this.enemies.splice(this.enemies.indexOf(enemy), 1); // Elimina el elemento en el índice encontrado
            }
            const lastShot = this.lastEnemyShootTimes.get(enemy) ?? 0;
            if (time - lastShot > this.shootCooldownEnemies) {
                this.shoot(270, 'enemyBullet', enemy);
                this.lastEnemyShootTimes.set(enemy, time);
            }
        })

        //Verifica si la bala del jugador ha salido de pantalla
        this.playerBullets.forEach(playerBullet => {
            if (playerBullet.y < 0) {
                playerBullet.destroy();
                this.playerBullets.splice(this.playerBullets.indexOf(playerBullet), 1); // Elimina el elemento en el índice encontrado
            }
        })

        //Verifica si la bala de los enemigos ha salido de pantalla
        this.enemyBullets.forEach(enemyBullet => {
            if (enemyBullet.y > innerHeight) {
                enemyBullet.destroy();
                this.enemyBullets.splice(this.enemyBullets.indexOf(enemyBullet), 1); // Elimina el elemento en el índice encontrado
            }
           
        })

        //Cada 10 segundos bajamos el delay entre spawn de enemigos medio segundo, hasta que spawneen cada segundo
        if (time - this.lastDelayUpdate > 10000 && this.enemSpawnDelay > 1000) {
            this.enemSpawnDelay -= 500;
            this.enemySpawnEvent.reset({ delay: this.enemSpawnDelay, callback: this.createEnemy, callbackScope: this, loop: true });
            this.lastDelayUpdate = time;
        }




    }

    shoot(angle: number, bulletSprite: string, ship: Phaser.Physics.Arcade.Sprite) {

        var velocity: number = 0;

        var posX: number = ship.x - 7;
        var posY: number = ship.y;

        if (angle === 90) velocity = -500; //Si el disparo es del jugador
        else if (angle === 270) velocity = 300; //Si el disparo es del enemigo

        const bullet = this.physics.add.sprite(
            posX,
            posY,
            bulletSprite
        )
            .setAngle(angle)
            .setVelocityY(velocity);



        if (bulletSprite === 'playerBullet') {
            // Cambiar el tamaño de la hitbox de la bala
            bullet.setSize(10, 20); 

            this.sound.play('shot', {
                volume: 0.1,
            });

            this.playerBullets.push(bullet);
        } else if (bulletSprite === 'enemyBullet') {
            bullet.setSize(15, 22) 
            bullet.setOffset(25, 3); // Ajusta el desplazamiento de la hitbox si es necesario
            this.enemyBullets.push(bullet);
        }




    }

    // Función para crear enemigos
    createEnemy() {
        // Generar una posición aleatoria para el enemigo en la parte superior de la pantalla
        const enemyX = Phaser.Math.Between(50, this.cameras.main.width - 50); // Aleatorio entre 50 y el ancho de la pantalla
        console.log('se genera enemigo');
        const enemy = this.physics.add.sprite(enemyX, -50, 'enemyShip')
            .setAngle(270) // Orientar al enemigo hacia abajo
            .setVelocityY(100); // Velocidad de movimiento del enemigo hacia abajo

        // Cambiar el tamaño de la hitbox del enemigo
        enemy.setSize(60, 100); //Es mas grande de lo que deberia para "facilitar" las cosas, porque si no seria muy dificil el juego

        // Agregar el enemigo al array de enemigos
        this.enemies.push(enemy);
        this.lastEnemyShootTimes.set(enemy, 0);

    }

    updateScore() {
        this.scoreText.setText(this.score.toString());
    }

    handleBulletEnemyCollision(bullet: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
        console.log('Colisión entre bala y enemigo');

        //Destruimos la bala
        bullet.destroy();

        //Destruimos el enemigo
        enemy.destroy();
        
        //Animacion de explosion
        this.shipExplosion(enemy);

        //Eliminamos al enemigo del array
        this.enemies.splice(this.enemies.indexOf(enemy), 1);

        this.score += 10; // Aumentar la puntuación
        this.updateScore(); // Actualizar la puntuación en pantalla
    }

    gameOver() {

        //Metodo para reiniciar todas las variables (con .stop no se limpian todas)
        this.shoutdown();

        //Animacion de explosion
        this.shipExplosion(this.playerShip)

        //Nueva musica de fondo
        this.backgroundMusic = this.sound.add('gameOverMusic', {
            loop: true,
            volume: 0.5,
        });

        this.backgroundMusic.play();


        // 2. Fondo semi-transparente
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);

        // 3. Texto "Game Over"
        this.add.text(this.scale.width / 2, 100, 'GAME OVER', {
            fontSize: '48px',
            color: '#FFFFFF',
        }).setOrigin(0.5);

        // 4. Texto de puntuación
        this.add.text(this.scale.width / 2, 160, `Score: ${this.score}`, {
            fontSize: '32px',
            color: '#FFFFFF',
        }).setOrigin(0.5);

        // 5. Crear un contenedor para los cuatro campos de texto
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '220px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';

        const letters: HTMLInputElement[] = [];

        // Crear los cuatro campos de texto
        for (let i = 0; i < 4; i++) {
            var letterInput = document.createElement('input');
            letterInput.type = 'text';
            letterInput.maxLength = 1; // Solo una letra por campo
            letterInput.style.width = '30px';
            letterInput.style.height = '40px';
            letterInput.style.textAlign = 'center';
            letterInput.style.fontSize = '28px';
            letterInput.style.textTransform = 'uppercase';
            letterInput.style.border = 'none';
            letterInput.style.outline = 'none';
            letterInput.style.background = 'transparent';
            letterInput.style.color = '#FFFFFF';
            letterInput.style.fontFamily = 'Arial, sans-serif';
            letterInput.style.margin = '0 5px';
            letterInput.placeholder = '_'; // Esto es el guion bajo visualmente

            // Agregar el input al contenedor
            container.appendChild(letterInput);
            letters.push(letterInput);

            // Si es el primer campo, enfocar automáticamente
            if (i === 0) {
                letterInput.focus();
            }

            letterInput.addEventListener('input', (e) => {
                const val = (e.target as HTMLInputElement).value;
                if (val.length === 1 && i < letters.length - 1) {
                    letters[i + 1].focus();
                }
            });

            letterInput.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    if (letterInput.value === '' && i > 0) {
                        letters[i - 1].focus();
                    } else {
                        letterInput.value = '';
                    }
                }
            });
        }

        // Añadir el contenedor al documento
        document.body.appendChild(container);

        // 6. Botón Guardar
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Guardar';
        saveButton.style.position = 'absolute';
        saveButton.style.top = '270px';
        saveButton.style.left = '50%';
        saveButton.style.transform = 'translateX(-50%)';
        saveButton.style.fontSize = '24px';
        document.body.appendChild(saveButton);

        // 7. Acción al hacer clic en el botón guardar
        saveButton.addEventListener('click', () => {
            const name = letters.map((input) => input.value).join('');

            this.sound.play('click', {
                volume: 0.5, // Ajusta el volumen entre 0 (silencio) y 1 (máximo volumen)
            });

            if (name.length === 4) {
                const scoreEntry = {
                    name: name,
                    score: this.score
                };

                // Recuperar el ranking previo y agregar el nuevo
                const ranking = JSON.parse(localStorage.getItem('gameScores') || '[]');
                ranking.push(scoreEntry);
                localStorage.setItem('gameScores', JSON.stringify(ranking));

                // Limpiar elementos
                container.remove();
                saveButton.remove();

                this.backgroundMusic?.destroy();

                this.score = 0;

                this.scene.stop();
                // Volver a menú
                this.scene.start('MenuScene');
            }
        });
    }

    gamePause() {
        // Pausar lógica de juego
        this.physics.pause();
        this.enemySpawnEvent.paused = true;
        this.gamePaused = true;

        // Oscurecer el fondo con un rectángulo semitransparente
        const overlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.6
        ).setDepth(1000);
    
        // Crear texto "Pausa"
        const pauseText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            'Pausa',
            { fontSize: '48px', fill: '#ffffff' }
        ).setOrigin(0.5).setDepth(1001);
    
        // Botón "Reiniciar"
        const restartButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Reiniciar',
            { fontSize: '32px', fill: '#ffffff', backgroundColor: '#333' }
        ).setOrigin(0.5).setInteractive().setDepth(1001);
    
        restartButton.on('pointerdown', () => {
            console.log('pulsando restart')
            this.cleanupPauseUI([overlay, pauseText, restartButton, exitButton]);
            this.gamePaused = false;
            this.physics.resume();
            this.enemySpawnEvent.paused = false;
            
        });
    
        // Botón "Salir"
        const exitButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 80,
            'Salir',
            { fontSize: '32px', fill: '#ffffff', backgroundColor: '#333' }
        ).setOrigin(0.5).setInteractive().setDepth(1001);
    
        exitButton.on('pointerdown', () => {
            this.cleanupPauseUI([overlay, pauseText, restartButton, exitButton]);
            this.gamePaused = false;
            this.physics.resume();
            this.enemySpawnEvent.paused = false;
            this.gameOver();
        });

        
    }

    cleanupPauseUI(elements: Phaser.GameObjects.GameObject[]) {
        elements.forEach(el => el.destroy());  
    }
    
    //Animacion de explosion
    shipExplosion(ship: Phaser.Physics.Arcade.Sprite) {
        const explosion = this.add.sprite(ship.x, ship.y, 'enemyExplosion1');
        explosion.setOrigin(0.5, 0.5);
        explosion.play('explode');

        this.sound.play('explosion', {
            volume: 0.5, // Ajusta el volumen entre 0 (silencio) y 1 (máximo volumen)
        });

    }

    // Eliminar todos los enemigos y balas
    shoutdown() {
        
        this.input.keyboard.enabled = false;
        this.input.keyboard.removeAllListeners();
        this.input.keyboard.clearCaptures();

        this.physics.pause();
        this.scene.pause();

        this.backgroundMusic?.destroy();
        this.enemies.forEach(enemy => enemy.destroy());
        this.playerBullets.forEach(bullet => bullet.destroy());
        this.enemyBullets.forEach(bullet => bullet.destroy());
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.lastEnemyShootTimes.clear();
        this.enemSpawnDelay = 3000;
        this.enemySpawnEvent.destroy();
        
    }



}
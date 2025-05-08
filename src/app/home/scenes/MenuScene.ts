import * as Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    private backgroundMusic: Phaser.Sound.BaseSound | null = null; // Variable para guardar el sonido de fondo

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('background', 'assets/space.background.png');

        this.load.image('gameLogo', 'assets/gameLogo.png');

        this.load.audio('backgroundMusic', 'assets/sounds/menuSong.mp3');

        this.load.audio('click', 'assets/sounds/clickSound.mp3');


    }

    create() {

        
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background').setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        
        const { width, height } = this.sys.game.canvas;

        this.add.image(width/2, 200, 'gameLogo').setDisplaySize(400, 400);


        // Botón Play
        const playButton = this.add.text(width / 2, height / 2, 'Play', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive();

        playButton.on('pointerdown', () => {
            this.click();
            this.shutdown();

            this.scene.start('Scene1'); // Inicia el juego
        });

        // Botón Score
        const scoreButton = this.add.text(width / 2, height / 2 + 100, 'Score', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive();

        scoreButton.on('pointerdown', () => {
            this.click();
            this.scene.start('RankingScene');
        });

        // Botón Controles
        const controlButton = this.add.text(width / 2, height / 2 + 200, 'Controles', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive();

        controlButton.on('pointerdown', () => {
            this.click();
            this.scene.start('ControlScene');
        });


        // Reproducir la música de fondo si no está sonando
        if (this.backgroundMusic == null || !this.backgroundMusic.isPlaying) {
            this.backgroundMusic = this.sound.add('backgroundMusic', {
                loop: true,  // Hace que la música se repita
                volume: 0.5,  // Ajusta el volumen entre 0 (silencio) y 1 (máximo volumen)
            });

            this.backgroundMusic.play();
        }

    }

    click() {
        // Reproducir la música de fondo
        this.sound.play('click', {
            volume: 0.5, // Ajusta el volumen entre 0 (silencio) y 1 (máximo volumen)
        });
    }

     // Método que detiene la música de fondo cuando se cambia de escena
     shutdown() {
        if (this.backgroundMusic){
            this.backgroundMusic.destroy();  // Detener la música de fondo
        }
        
    }
}

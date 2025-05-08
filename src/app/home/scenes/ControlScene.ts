import * as Phaser from 'phaser';

export class ControlScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ControlScene' });
    }

    preload() {
        this.load.image('background', 'assets/space.background.png');
        this.load.image('controls', 'assets/controles.png');
        this.load.audio('click', 'assets/sounds/clickSound.mp3');
    }

    create() {
        
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background').setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const { width, height } = this.sys.game.canvas;

        this.add.text(width / 2, height / 2 - 200, 'Controles', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        this.add.image(width/2, height/2, 'controls').setDisplaySize(400, 300);

        /*
        // Controles de la nave, centrados
        this.add.text(width / 2, height / 2 - 50, 'W, A, S, D -> Controles de la nave', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2, 'SPACE -> Disparar', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 50, 'ESC -> Pausar el juego', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);*/

        // Botón Play
        const returnButton = this.add.text(width / 2, height / 2 + 250, 'Back', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
        })
            .setOrigin(0.5)
            .setInteractive();

        returnButton.on('pointerdown', () => {
            this.click();
            this.scene.start('MenuScene'); // Inicia el juego
        });

    }
    click() {
        // Reproducir la música de fondo
        this.sound.play('click', {
            volume: 0.5, // Ajusta el volumen entre 0 (silencio) y 1 (máximo volumen)
        });
    }
}

import * as Phaser from 'phaser';

interface Player {
    name: string;
    score: number;
  }

export class RankingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RankingScene' });
  }

  preload() {
    this.load.image('background', 'assets/space.background.png');
    this.load.audio('click', 'assets/sounds/clickSound.mp3');
  }

  create() {
    console.log('estas en el ranking');
    this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background').setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // 2. Título del ranking
    this.add.text(this.scale.width / 2, 50, 'TOP 10 RANKING', {
      fontSize: '48px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // 3. Recuperar el ranking desde el localStorage
    let ranking: Player[] = JSON.parse(localStorage.getItem('gameScores') || '[]');

    // 4. Ordenar por puntuación de mayor a menor
    ranking = ranking.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    // 5. Mostrar los primeros 10 jugadores
    const top10 = ranking.slice(0, 10); // Obtener los 10 primeros
    const yOffset = 150; // Desplazamiento vertical para los nombres

    top10.forEach((entry, index: number) => {
      const playerText = `${index + 1}. ${entry.name} - ${entry.score}`;
      this.add.text(this.scale.width / 2, yOffset + index * 40, playerText, {
        fontSize: '32px',
        color: '#FFFFFF',
      }).setOrigin(0.5);
    });

    // 6. Botón para regresar al menú principal
    const backButton = this.add.text(this.scale.width / 2, yOffset + top10.length * 40 + 50, 'Back', {
      fontSize: '32px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive();

    // 7. Acción al hacer clic en el botón regresar
    backButton.on('pointerdown', () => {
      this.click();
      this.scene.start('MenuScene'); // O vuelve a la escena de inicio
    });
  }
  click() {
    // Reproducir la música de fondo
    this.sound.play('click', {
        volume: 0.5, // Ajusta el volumen entre 0 (silencio) y 1 (máximo volumen)
    });
}
}

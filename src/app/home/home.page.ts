import { Component } from '@angular/core';
import * as Phaser from 'phaser';
import { Scene1 } from './scenes/Scene1';
import { MenuScene } from './scenes/MenuScene'; // Importa tu escena de menú
import { RankingScene } from './scenes/RankingScene';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  game!: Phaser.Game;
  config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: Math.min(window.innerWidth, 1080),
    height: window.innerHeight,
    parent: 'game',
    scene: [MenuScene, Scene1, RankingScene],
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    }
  };

  constructor() {}

  ngOnInit(){
    this.game = new Phaser.Game(this.config);
  }

}

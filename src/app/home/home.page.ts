import { Component } from '@angular/core';
import * as Phaser from 'phaser';
import { Scene1 } from './scenes/Scene1';

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
    scene: Scene1,
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

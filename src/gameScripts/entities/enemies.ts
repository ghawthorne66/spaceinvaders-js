import { Game } from '../game';
import { GameObject } from '../core/class/GameObject/game-object';
import { Vector3 } from '../core/class/vector3';
import { Enemy } from './enemy';
import { MathUtils } from '../core/class/math-utils';
/**
 * PLAYER PROTOTYPE
 */
export class Enemies extends GameObject {
  moveDirection: number = 1;
  movementSpeed: number = 2000;
  maxMovementX: number = 0;
  minMovementX: number = 0;
  enemiesGO: Enemy[] = [];
  constructor(name: string) {
    super(name, { className: 'Enemies' });
    this.onAwake();
  }

  onAwake() {
    this.spawnRandom();
    this.maxMovementX = Game.scene.width - 64 * 10;
    super.onAwake();
  }

  onStart() {
    this.move();
    setInterval(() => {
      this.shoot();
    }, 1000);
  }

  checkCollision = (element: HTMLElement) => {
    const { top, left } = element.getBoundingClientRect();
    let collided = document.elementsFromPoint(left, top);
    collided = collided.filter(
      (c: HTMLElement) => c.className.indexOf('Player') > -1,
    );
    if (collided.length > 0) {
      const playerElement = collided[0];
      const player = Game.findGameObject('SpaceShip');
      if (player) {
        player.damage();
      }
      playerElement.classList.add('Damaged');
      setTimeout(() => {
        playerElement.classList.remove('Damaged');
      }, 500);
    }
    return (collided || []).length > 0;
  };

  move() {
    let { maxMovementX, minMovementX } = this;
    /// we need to move the plaeyr into a specific direction
    const targetMove = 64 * this.moveDirection;
    this.transform.position.x += targetMove;
    /// get the player current offset left
    /// change it according to current direction
    this.enemiesGO.map(ego => {
      ego.transform.position.x += targetMove;
    });
    if (
      this.transform.position.x > maxMovementX ||
      this.transform.position.x < minMovementX
    ) {
      this.moveDirection *= -1;
      setTimeout(() => {
        this.transform.position.y += 64;
        this.enemiesGO.map(ego => {
          ego.transform.position.y += 64;
        });
        this.movementSpeed -= this.movementSpeed / 8;
        this.movementSpeed = Math.max(500, this.movementSpeed);
      }, this.movementSpeed / 2);
    }

    setTimeout(() => {
      this.move();
    }, this.movementSpeed);
  }

  shoot() {
    return;
    const { htmlElement } = this;
    const bullet = document.createElement('div');
    const enemies = htmlElement.querySelectorAll('.Enemy');
    const randomEnemy =
      enemies[Math.floor(Math.random() * enemies.length - 1) + 1];
    if (!randomEnemy) {
      return;
    }
    const { offsetLeft, offsetTop } = randomEnemy as any;
    bullet.classList.add('EnemiesBullet');
    bullet.style.left = `${offsetLeft + htmlElement.offsetLeft + 21.5}px`;
    bullet.style.top = `${offsetTop + htmlElement.offsetTop + 48}px`;
    Game.scene.appendChild(bullet);
    bullet.classList.add('Shooted');
    const thisInterval = setInterval(() => {
      const collides = this.checkCollision(bullet);
      if (collides) {
        Game.scene.removeChild(bullet);
        clearInterval(thisInterval);
        return;
      }
      const bTop = bullet.getBoundingClientRect().top;
      bullet.style.top = `${bTop}px`;
      if (bTop >= 900) {
        Game.scene.removeChild(bullet);
        clearInterval(thisInterval);
      }
    }, 10);
  }

  spawnRandom() {
    for (let i = 0; i < Math.floor(Math.random() * 5 + 1); i++) {
      for (let j = 0; j < 10; j++) {
        this.enemiesGO.push(
          new Enemy(`Enemy${i}${j}`, new Vector3(64 * j, 64 * i, 0))
        );
      }
    }
  }
}

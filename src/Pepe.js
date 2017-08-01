import pepeLeft from './images/pepe-left.png'
import pepeRight from './images/pepe-right.png'
import pepeFeelsLeftMan from './images/pepe-sad-left.png'
import pepeFeelsRightMan from './images/pepe-sad-right.png'

export default class Pepe {
    constructor(args) {
        this.position = this.bottomRight = this.topLeft = args.position;
        this.velocity = {x: 0, y: 0};
        this.acceleration = {x: 0, y: 0};
        this.resetCombo = args.resetCombo;
        this.gameOver = args.gameOver;
        this.lastDirection = 'right';
        this.frames = 4;
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 25 / this.frames;
        this.bounce = false;
        this.dead = false;
    }

    getMemed(gameState) {
        this.dead = true;
        this.topLeft = this.bottomRight = {x: gameState.screen.width * 2, y: gameState.screen.height * 2};
        this.gameOver();
    }

    boing() {
        this.bounce = true;
    }

    render(gameState) {
        this.width = gameState.screen.width / 15;
        this.height = gameState.screen.height / 10;
        this.baseY = gameState.screen.groundY - this.height;

        // animate Pepe
        this.tickCount++;
        if(this.tickCount >= this.ticksPerFrame) {
            this.frameIndex++;
            this.tickCount = 0;
        }
        if(this.frameIndex > this.frames - 1) this.frameIndex = 0;

        // jump
        if(gameState.keys.up && this.position.y === this.baseY){
            this.acceleration.y = gameState.screen.height / -30; // jump power
        } else if (this.bounce) {
            this.acceleration.y = gameState.screen.height / -30;
            this.velocity.y = 0;
            this.bounce = false;
        } else {
            this.acceleration.y = gameState.screen.height / 500; // gravity
        }

        // side to side
        if(gameState.keys.left){
            this.velocity.x = gameState.screen.width / -125;
            this.lastDirection = 'left';
        } else if(gameState.keys.right){
            this.velocity.x = gameState.screen.width / 125;
            this.lastDirection = 'right';
        } else {
            this.velocity.x = 0;
        }

        this.velocity.y += this.acceleration.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // game world boundaries
        if(this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x = 0;
        }
        if(this.position.x > gameState.screen.width - this.width) {
            this.position.x = gameState.screen.width - this.width;
            this.velocity.x = 0;
        }
        if(this.position.y > this.baseY) {
            this.position.y = this.baseY;
            this.velocity.y = 0;
        }

        // reset bounce combo if Pepe is grounded
        if(this.position.y === this.baseY) {
            this.resetCombo();
        }

        // define hitbox
        this.topLeft = {
            x: this.position.x + 0.2 * this.width,
            y: this.position.y + 0.2 * this.height,
        };

        this.bottomRight = {
            x: this.position.x + 0.8 * this.width,
            y: this.position.y + this.height,
        };

        this.centerY = this.position.y + (this.bottomRight.y - this.topLeft.y) / 2;
        this.centerX = this.topLeft.x + (this.bottomRight.x - this.topLeft.x) / 2;


        // draw Pepe
        const context = gameState.context;
        context.save();
        let sprite = new Image();
        if(gameState.keys.down && !gameState.keys.up && !gameState.keys.left && !gameState.keys.right) {
            sprite.src = this.lastDirection === 'right' ? pepeFeelsRightMan : pepeFeelsLeftMan;
            context.drawImage(sprite, this.position.x, this.position.y, this.width, this.width);
        } else {
            if (gameState.keys.left) {
                sprite.src = pepeLeft;
            } else if (gameState.keys.right) {
                sprite.src = pepeRight;
            } else if (gameState.keys.up) {
                sprite.src = this.lastDirection === 'right' ? pepeRight : pepeLeft;
            } else {
                sprite.src = this.lastDirection === 'right' ? pepeRight : pepeLeft;
            }
            context.drawImage(sprite, this.frameIndex * sprite.width / this.frames, 0, sprite.width / this.frames, sprite.height, this.position.x, this.position.y, this.width, this.height);
        }

        // hitbox visualization
        context.beginPath();
        context.lineWidth="6";
        context.strokeStyle="red";
        context.rect(this.topLeft.x, this.topLeft.y, this.bottomRight.x - this.topLeft.x, this.bottomRight.y - this.topLeft.y);
        context.stroke();
        context.restore();
    }
}
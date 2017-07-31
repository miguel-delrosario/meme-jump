import pepeLeft from './images/pepe-left.png'
import pepeRight from './images/pepe-right.png'
import pepeFeelsLeftMan from './images/pepe-sad-left.png'
import pepeFeelsRightMan from './images/pepe-sad-right.png'

export default class Pepe {
    constructor(args) {
        this.position = this.bottomRight = this.topLeft = args.position;
        this.velocity = {x: 0, y: 0};
        this.acceleration = {x: 0, y: 0};
        this.create = args.create;
        this.gameOver = args.gameOver;
        this.lastDirection = 'right';
        this.frames = 4;
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 25 / this.frames;
        this.bounce = false;
        this.dead = false;
    }

    getMemed(){
        this.dead = true;
        this.gameOver();
    }

    render(gameState){
        this.width = gameState.screen.width / 12;
        this.height = gameState.screen.height / 8;
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
            this.velocity.y = -30;
            this.bounce = false;
        } else {
            this.acceleration.y = gameState.screen.height / 500; // gravity
        }

        // side to side
        if(gameState.keys.left){
            this.velocity.x = gameState.screen.width / -125;
        } else if(gameState.keys.right){
            this.velocity.x = gameState.screen.width / 125;
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

        // set hurtbox
        this.topLeft = {
            x: this.position.x + 0.1 * this.width,
            y: this.position.y + 0.1 * this.height
        };

        this.bottomRight = {
            x: this.position.x + 0.9 * this.width,
            y: this.position.y + 0.9 * this.height,
        };

        this.centerX = this.position.x + this.width / 2;


        // draw the guy
        const context = gameState.context;
        context.save();
        let guy = new Image();
        if(gameState.keys.down && !gameState.keys.up && !gameState.keys.left && !gameState.keys.right) {
            guy.src = this.lastDirection === 'right' ? pepeFeelsRightMan : pepeFeelsLeftMan;
            context.drawImage(guy, this.position.x, this.position.y, this.width, this.width);
        } else {
            if (gameState.keys.left) {
                guy.src = pepeLeft;
                this.lastDirection = 'left';
            } else if (gameState.keys.right) {
                guy.src = pepeRight;
                this.lastDirection = 'right';
            } else if (gameState.keys.up) {
                guy.src = this.lastDirection === 'right' ? pepeRight : pepeLeft;
            } else {
                guy.src = this.lastDirection === 'right' ? pepeRight : pepeLeft;
            }
            context.drawImage(guy, this.frameIndex * guy.width / this.frames, 0, guy.width / this.frames, guy.height, this.position.x, this.position.y, this.width, this.height);
        }
        context.restore();
    }
}
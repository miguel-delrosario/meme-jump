import pepeRight from './pepe-right.png'
import pepeLeft from './pepe-left.png'
import pepeFeelsLeftMan from './pepe-sad-left.png'
import pepeFeelsRightMan from './pepe-sad-right.png'
import datBoi from './boi.png';

export default class Pepe {
    constructor(args) {
        this.position = args.position;
        this.velocity = {x: 0, y: 0};
        this.acceleration = {x: 0, y: 0};
        this.jump = false;
        this.create = args.create;
        this.onDie = args.onDie;
        this.lastDirection = 'right';
        this.boiFrames;
        this.boiFrameIndex = 0;
        this.boiTickCount = 0;
        this.boiTicksPerFrame = 30/5;
    }

    getMemed(){
        this.delete = true;
        this.onDie();
    }

    render(gameState){
        this.boiTickCount++;
        if(this.boiTickCount >= this.boiTicksPerFrame) {
            this.boiFrameIndex++;
            this.boiTickCount = 0;
        }
        if(this.boiFrameIndex > 4) this.boiFrameIndex = 0;
        this.width = gameState.screen.width / 10;
        this.baseY = gameState.screen.height * 0.5;
        // jump
        if(gameState.keys.up && this.position.y === this.baseY){
            this.acceleration.y = gameState.screen.height / -30; // jump power
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


        // draw the guy
        const context = gameState.context;
        context.save();
        const guy = new Image();
        if(gameState.keys.left) {
            guy.src = pepeLeft;
            this.lastDirection = 'left';
        } else if(gameState.keys.right) {
            guy.src = pepeRight;
            this.lastDirection = 'right';
        } else if(gameState.keys.up){
            guy.src = this.lastDirection === 'right' ? pepeRight : pepeLeft;
        } else if(gameState.keys.down){
            guy.src = this.lastDirection === 'right' ? pepeFeelsRightMan : pepeFeelsLeftMan;
        } else {
            guy.src = this.lastDirection === 'right' ? pepeRight : pepeLeft;
        }
        context.drawImage(guy, this.position.x, this.position.y, this.width, this.width);
        const boi = new Image();
        boi.src = datBoi;
        console.log(boi.height);
        context.drawImage(boi, this.boiFrameIndex * boi.width / 5, 0, boi.width / 5, boi.height, this.position.x, this.position.y, boi.width / 10, boi.height/2);
        context.restore();
    }
}
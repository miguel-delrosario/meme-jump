import pepeRight from './pepe-right.png'
import pepeLeft from './pepe-left.png'
import pepeFeelsBadMan from './pepe-feels-bad-man.png'

export default class Pepe {
    constructor(args) {
        this.position = args.position;
        this.velocity = {x: 0, y: 0};
        this.acceleration = {x: 0, y: 0};
        this.jump = false;
        this.create = args.create;
        this.onDie = args.onDie;
        this.pepeLast = pepeRight;
    }

    getMemed(){
        this.delete = true;
        this.onDie();
    }

    render(gameState){
        this.width = gameState.screen.width / 15;
        this.baseY = gameState.screen.height * 0.75;
        // jump
        if(gameState.keys.up && this.position.y === this.baseY){
            this.acceleration.y = -40; // jump power
        } else {
            this.acceleration.y = 1.635; // gravity
        }

        // side to side
        if(gameState.keys.left){
            this.velocity.x = -20;
        } else if(gameState.keys.right){
            this.velocity.x = 20;
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
        } else if(gameState.keys.right) {
            guy.src = pepeRight;
        } else if(gameState.keys.up){
            guy.src = this.velocity.x >= 0 ? pepeRight : pepeLeft;
        } else if(gameState.keys.down){
            guy.src = pepeFeelsBadMan;
        } else {
            guy.src = this.pepeLast;
        }
        this.pepeLast = guy.src;
        context.drawImage(guy, this.position.x, this.position.y, this.width, this.width);
        context.restore();
    }
}
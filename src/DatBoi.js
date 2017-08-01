import boiLeft from './images/boi-left.png';
import boiRight from './images/boi-right.png';

export default class DatBoi {
    constructor(args) {
        this.goingRight = Math.round(Math.random());
        this.pointValue = 10;
        this.widthRatio = 10;
        this.heightRatio = 4.75;
        this.position = {
            x: this.goingRight ? 0 - args.gameScreen.width / this.widthRatio : args.gameScreen.width + args.gameScreen.width / this.widthRatio,
            y: args.gameScreen.groundY - args.gameScreen.height / this.heightRatio,
        };
        this.topLeft = {x: 0, y: 0};
        this.bottomRight = {x: 0, y: 0};
        this.velocity = {x: 0, y: 0};
        this.addScore = args.addScore;
        this.frames = 5;
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 25 / this.frames;
        this.dead = false;
        this.deadFrames = 30;
    }

    squish() {
        this.dead = true;
        this.addScore(this.pointValue);
    }

    despawn() {
        this.dead = true;
    }

    render(gameState){
        this.width = gameState.screen.width / this.widthRatio;
        this.height = gameState.screen.height / this.heightRatio;

        // animate DatBoi
        this.tickCount++;
        if(this.tickCount >= this.ticksPerFrame) {
            this.frameIndex++;
            this.tickCount = 0;
        }
        if(this.frameIndex > this.frames - 1) this.frameIndex = 0;

        this.velocity.x = this.goingRight ? gameState.screen.width / 300 : gameState.screen.width / -300;

        this.position.x += this.velocity.x;
        this.position.y = gameState.screen.groundY - this.height;

        // Dat Boi dies beyond game world boundaries
        if (this.position.x < 0 - this.width || this.position.x > gameState.screen.width + this.width) {
            this.despawn();
        }

        // define hitbox
        this.topLeft = {
            x: this.position.x + (this.goingRight ? 0.25 : 0.4) * this.width,
            y: this.position.y,
        };
        this.bottomRight = {
            x: this.position.x + (this.goingRight ? 0.6 : 0.75) * this.width,
            y: this.position.y + this.height,
        };
        this.centerX = this.topLeft.x + (this.bottomRight.x - this.topLeft.x) / 2;

        // draw the DatBoi
        const context = gameState.context;
        context.save();

        // Dat Boi
        if(!this.dead) {
            let sprite = new Image();
            sprite.src = this.goingRight ? boiRight : boiLeft;
            context.drawImage(sprite, this.frameIndex * sprite.width / this.frames, 0, sprite.width / this.frames, sprite.height, this.position.x, this.position.y, this.width, this.height);
            // hitbox visualization
            // context.beginPath();
            // context.lineWidth="6";
            // context.strokeStyle="red";
            // context.rect(this.topLeft.x, this.topLeft.y, this.bottomRight.x - this.topLeft.x, this.bottomRight.y - this.topLeft.y);
            // context.stroke();
        } else {
            if(this.deadFrames === 30) {
                console.log("killed a boi");
                this.velocity = {x: 0, y: 0};
                this.deadY = this.position.y + (this.bottomRight.y - this.topLeft.y) / 2
                this.deadX = this.position.x + (this.bottomRight.x - this.topLeft.x) / 2;
            }
            context.font = "50px Arial";
            context.fillText(`+${this.pointValue * gameState.combo}`, this.deadX, this.deadY);
            this.deadFrames--;
        }
        context.restore();
    }
}

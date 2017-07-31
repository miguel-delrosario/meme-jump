import boiLeft from './images/boi-left.png';
import boiRight from './images/boi-right.png';

export default class DatBoi {
    constructor(args) {
        this.position = this.topLeft = this.bottomRight = args.position;
        this.direction = args.position.x < 0 ? 'right' : 'left';
        this.velocity = {x: 0, y: 0};
        this.addScore = args.addScore;
        this.frames = 5;
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 25 / this.frames;
    }

    squish() {
        this.dead = true;
        this.addScore(30);
    }

    render(gameState){
        this.width = gameState.screen.width / 10;
        this.height = gameState.screen.height / 4.75;

        // animate DatBoi
        this.tickCount++;
        if(this.tickCount >= this.ticksPerFrame) {
            this.frameIndex++;
            this.tickCount = 0;
        }
        if(this.frameIndex > this.frames - 1) this.frameIndex = 0;

        this.velocity.x = this.direction === 'right' ? gameState.screen.width / 200 : gameState.screen.width / -200;

        this.position.x += this.velocity.x;
        this.position.y = gameState.screen.groundY - this.height;

        // Dat Boi dies beyond game world boundaries
        if(this.position.x < 0 - this.width || this.position.x > gameState.screen.width) {
            this.position.x = 0 - this.width;
        }

        // set hitbox
        this.topLeft = {
            x: this.position.x + 0.25 * this.width,
            y: this.position.y,
        };

        this.bottomRight = {
            x: this.position.x + 0.75 * this.width,
            y: this.position.y + this.height,
        };

        this.centerX = this.position.x + this.width / 2;

        // draw the DatBoi
        const context = gameState.context;
        context.save();
        let boi = new Image();
        boi.src = this.direction === 'right' ? boiRight : boiLeft;
        console.log(boi.width);
        context.drawImage(boi, this.frameIndex * boi.width / this.frames, 0, boi.width / this.frames, boi.height, this.position.x, this.position.y, this.width, this.height);
        context.restore();
    }
}

export default class Meme {
    constructor(args) {
        this.goingRight = Math.round(Math.random());
        this.pointValue = args.pointValue;
        this.widthRatio = args.widthRatio;
        this.heightRatio = args.heightRatio;
        this.flyHeight = args.flyHeight;
        this.speedRatio = args.speedRatio;
        this.hitBoxStartRatio = args.hitBoxStartRatio;
        this.hitBoxEndRatio = args.hitBoxEndRatio;
        this.heightBoxRatio = args.heightBoxRatio;
        this.position = {
            x: this.goingRight ? 0 - args.gameScreen.width / this.widthRatio : args.gameScreen.width + args.gameScreen.width / this.widthRatio,
            y: args.gameScreen.groundY - this.flyRatio * args.gameScreen.height / this.heightRatio,
        };
        this.topLeft = {x: 0, y: 0};
        this.bottomRight = {x: 0, y: 0};
        this.velocity = {x: 0, y: 0};
        this.addScore = args.addScore;
        this.frames = args.frames;
        this.rightSprite = args.rightSprite;
        this.leftSprite = args.leftSprite;
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

        // animate Meme
        this.tickCount++;
        if(this.tickCount >= this.ticksPerFrame) {
            this.frameIndex++;
            this.tickCount = 0;
        }
        if(this.frameIndex > this.frames - 1) this.frameIndex = 0;


        this.velocity.x = this.goingRight ? gameState.screen.width / this.speedRatio : gameState.screen.width / - this.speedRatio;

        this.position.x += this.velocity.x;
        this.position.y = gameState.screen.groundY - this.height * this.flyHeight;

        // Meme dies beyond game world boundaries
        if (this.position.x < 0 - this.width || this.position.x > gameState.screen.width + this.width) {
            this.despawn();
        }

        if(!this.dead) {
            // define hitbox
            this.topLeft = {
                x: this.position.x + (this.goingRight ? this.hitBoxStartRatio : 1 - this.hitBoxEndRatio) * this.width,
                y: this.position.y + (1 - this.heightBoxRatio) * this.height,
            };
            this.bottomRight = {
                x: this.position.x + (this.goingRight ? this.hitBoxEndRatio : 1 - this.hitBoxStartRatio) * this.width,
                y: this.position.y + this.height,
            };

            this.centerX = this.topLeft.x + (this.bottomRight.x - this.topLeft.x) / 2;
            this.centerY = this.position.y + (this.bottomRight.y - this.topLeft.y) / 2;
        }

        // draw the NyanCat
        const context = gameState.context;
        context.save();

        if(!this.dead) {
            const sprite = this.goingRight ? window.images[this.rightSprite] : window.images[this.leftSprite];
            context.drawImage(sprite, this.frameIndex * sprite.width / this.frames, 0, sprite.width / this.frames, sprite.height, this.position.x, this.position.y, this.width, this.height);
            // hitbox visualization
            if(window.hitboxVisualization) {
                context.beginPath();
                context.lineWidth = "6";
                context.strokeStyle = "red";
                context.rect(this.topLeft.x, this.topLeft.y, this.bottomRight.x - this.topLeft.x, this.bottomRight.y - this.topLeft.y);
                context.stroke();
            }
        } else {
            if(this.deadFrames === 30) {
                this.velocity = {x: 0, y: 0};
                this.deadY = this.centerY;
                this.deadX = this.centerX;
                this.position.x = 0;
                this.position.y = 0;
                // move hitbox offscreen
                this.topLeft = {x: -1, y: -1};
                this.bottomRight = {x: -1, y: -1};
                this.centerY = -1;
                this.centerX = -1;
            }
            context.font = "4vh Comic Sans MS";
            context.fillStyle = '#ffec21';
            context.fillText(`+${this.pointValue * gameState.combo}`, this.deadX, this.deadY);
            this.deadFrames--;
        }
        context.restore();
    }
}

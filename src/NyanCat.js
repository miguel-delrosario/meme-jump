export default class NyanCat {
    constructor(args) {
        this.goingRight = Math.round(Math.random());
        this.pointValue = 25;
        this.widthRatio = 8;
        this.heightRatio = 10;
        this.flyRatio = 5;
        this.position = {
            x: this.goingRight ? 0 - args.gameScreen.width / this.widthRatio : args.gameScreen.width + args.gameScreen.width / this.widthRatio,
            y: args.gameScreen.groundY - this.flyRatio * args.gameScreen.height / this.heightRatio,
        };
        this.topLeft = {x: 0, y: 0};
        this.bottomRight = {x: 0, y: 0};
        this.velocity = {x: 0, y: 0};
        this.addScore = args.addScore;
        this.speedRatio = 400;
        this.frames = 6;
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 25 / this.frames;
        this.dead = false;
        this.deadFrames = 30;
    }

    squish() {
        this.dead = true;

        // move hitbox offscreen
        this.topLeft = {x: -1, y: -1};
        this.bottomRight = {x: -1, y: -1};
        this.centerY = -1;
        this.centerX = -1;

        this.addScore(this.pointValue);
    }

    despawn() {
        this.dead = true;
    }

    render(gameState){
        this.width = gameState.screen.width / this.widthRatio;
        this.height = gameState.screen.height / this.heightRatio;

        // animate NyanCat
        this.tickCount++;
        if(this.tickCount >= this.ticksPerFrame) {
            this.frameIndex++;
            this.tickCount = 0;
        }
        if(this.frameIndex > this.frames - 1) this.frameIndex = 0;


        this.velocity.x = this.goingRight ? gameState.screen.width / this.speedRatio : gameState.screen.width / - this.speedRatio;

        this.position.x += this.velocity.x;
        this.position.y = gameState.screen.groundY - this.flyRatio * this.height;

        // NyanCat dies beyond game world boundaries
        if (this.position.x < 0 - this.width || this.position.x > gameState.screen.width + this.width) {
            this.despawn();
        }

        if(!this.dead) {
            // define hitbox
            this.topLeft = {
                x: this.position.x + (this.goingRight ? 0.5 : 0) * this.width,
                y: this.position.y,
            };
            this.bottomRight = {
                x: this.position.x + (this.goingRight ? 1 : 0.5) * this.width,
                y: this.position.y + this.height,
            };

            this.centerX = this.topLeft.x + (this.bottomRight.x - this.topLeft.x) / 2;
            this.centerY = this.position.y + (this.bottomRight.y - this.topLeft.y) / 2;
        }

        // draw the NyanCat
        const context = gameState.context;
        context.save();

        if(!this.dead) {
            const sprite = this.goingRight ? window.images.nyanRight : window.images.nyanLeft;
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
                this.deadY = this.position.y + (this.bottomRight.y - this.topLeft.y) / 2
                this.deadX = this.position.x + (this.bottomRight.x - this.topLeft.x) / 2;
                this.position.x = 0;
                this.position.y = 0;
            }
            context.font = "4vh Comic Sans MS";
            context.fillStyle = '#ffec21';
            context.fillText(`+${this.pointValue * gameState.combo}`, this.deadX, this.deadY);
            this.deadFrames--;
        }
        context.restore();
    }
}

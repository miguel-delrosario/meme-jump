export default class Pepe {
    constructor(args) {
        this.position = this.bottomRight = this.topLeft = args.position;
        this.speedMultiplier = args.speedMultiplier;
        this.velocity = {x: 0, y: 0};
        this.acceleration = {x: 0, y: 0};
        this.resetCombo = args.resetCombo;
        this.gameOver = args.gameOver;
        this.lastDirection = 'right';
        this.frames = 6;
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = 25 / this.frames;
        this.bounce = false;
        this.framesGrounded = 2; // arbitrary value over 1
        this.dead = false;
    }

    getMemed() {
        this.dead = true;

        // move hitbox offscreen
        this.topLeft = {x: -1, y: -1};
        this.bottomRight = {x: -1, y: -1};
        this.centerY = -1;
        this.centerX = -1;

        this.gameOver();
    }

    boing() {
        this.bounce = true;
    }

    render(gameState) {
        this.width = gameState.screen.width / 17;
        this.height = gameState.screen.height / 11;
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
            this.acceleration.y = gameState.screen.height / -40; // jump power
        } else if (this.bounce) {
            this.acceleration.y = gameState.screen.height / -40;
            this.velocity.y = 0;
            this.bounce = false;
        } else {
            this.acceleration.y = gameState.screen.height / 800; // gravity
        }

        // side to side
        if(gameState.keys.left){
            this.velocity.x = gameState.screen.width * this.speedMultiplier / -125;
            this.lastDirection = 'left';
        } else if(gameState.keys.right){
            this.velocity.x = gameState.screen.width * this.speedMultiplier  / 125;
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
            this.framesGrounded++;
            this.resetCombo();
        } else {
            this.framesGrounded = 0;
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


        const context = gameState.context;
        context.save();
        let sprite;
        const i = window.images;
        if(gameState.keys.down && !gameState.keys.up && !gameState.keys.left && !gameState.keys.right) {
            sprite = this.lastDirection === 'right' ? i.pepeFeelsRightMan : i.pepeFeelsLeftMan;
            context.drawImage(sprite, this.position.x, this.position.y, this.width, this.height);
        } else {
            if (gameState.keys.left) {
                sprite = i.pepeLeft;
            } else if (gameState.keys.right) {
                sprite = i.pepeRight;
            } else if (gameState.keys.up) {
                sprite = this.lastDirection === 'right' ? i.pepeRight : i.pepeLeft;
            } else {
                sprite = this.lastDirection === 'right' ? i.pepeRight : i.pepeLeft;
            }
            context.drawImage(sprite, this.frameIndex * sprite.width / this.frames, 0, sprite.width / this.frames, sprite.height, this.position.x, this.position.y, this.width, this.height);
        }

        // hitbox visualization
        if(window.hitboxVisualization) {
            context.beginPath();
            context.lineWidth = "6";
            context.strokeStyle = "red";
            context.rect(this.topLeft.x, this.topLeft.y, this.bottomRight.x - this.topLeft.x, this.bottomRight.y - this.topLeft.y);
            context.stroke();
        }

        context.restore();
    }
}

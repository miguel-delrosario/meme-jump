export default class Guy {
    constructor(args) {
        this.position = args.position;
        this.baseY = args.position.y;
        console.log(args.position.y);
        this.velocity = {x: 0, y: 0};
        this.acceleration = {x: 0, y: 0};
        this.jump = false;
        this.create = args.create;
        this.onDie = args.onDie;
    }

    getMemed(){
        this.delete = true;
        this.onDie();
    }

    render(gameState){
        // Jump
        if(gameState.keys.up && this.position.y === this.baseY){
            this.acceleration.y = -25;
        } else {
            this.acceleration.y = 2;
        }

        // Side to Side
        if(gameState.keys.left){
            this.velocity.x = -5;
        } else if(gameState.keys.right){
            this.velocity.x = 5;
        } else {
            this.velocity.x = 0;
        }


        this.velocity.y += this.acceleration.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Game world boundaries
        if(this.position.x < 0) {
            this.position.x = 0;
        }
        if(this.position.x > gameState.screen.width) {
            this.position.x = gameState.screen.width;
        }
        if(this.position.y > this.baseY) {
            this.position.y = this.baseY;
            this.velocity.y = 0;
        }


        // Draw
        const context = gameState.context;
        context.save();
        context.translate(this.position.x, this.position.y);
        context.strokeStyle = '#ff1700';
        context.fillStyle = '#000000';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, -15);
        context.lineTo(10, 10);
        context.lineTo(5, 7);
        context.lineTo(-5, 7);
        context.lineTo(-10, 10);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    }
}
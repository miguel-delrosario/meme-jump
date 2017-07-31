import React, { Component } from 'react';
import Pepe from './Pepe';
import DatBoi from './DatBoi';
import Lava from './images/lava.png';

const KEY = {
    UP: 38,
    LEFT:  37,
    DOWN: 40,
    RIGHT: 39,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
};

export class MemeJump extends Component {
    constructor() {
        super();
        this.state = {
            screen: {
                width: window.innerWidth,
                height: window.innerHeight,
                groundY: window.innerHeight * 0.8,
                ratio: window.devicePixelRatio || 1,
            },
            keys: {
                left: 0,
                right: 0,
                up: 0,
                down: 0,
                space: 0,
            },
            score: 0,
            inGame: true,
            context: null,
        };
        this.pepe = null;
        this.datBoi = [];
    }

    handleResize(value, e){
        this.setState({
            screen : {
                width: window.innerWidth,
                height: window.innerHeight,
                groundY: window.innerHeight * 0.8,
                ratio: window.devicePixelRatio || 1,
            }
        });
    }

    handleKeys(value, e) {
        let keys = this.state.keys;
        if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
        if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
        if (e.keyCode === KEY.DOWN || e.keyCode === KEY.S) keys.down = value;
        if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
        this.setState({
            keys: keys
        });
    }

    componentDidMount() {
        window.addEventListener('keyup', this.handleKeys.bind(this, false));
        window.addEventListener('keydown', this.handleKeys.bind(this, true));
        window.addEventListener('resize',  this.handleResize.bind(this, false));

        const context = this.refs.canvas.getContext('2d');
        this.setState({ context: context });

        this.startGame();
        requestAnimationFrame(() => {
            this.update()
        });
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.handleKeys.bind(this, false));
        window.removeEventListener('keydown', this.handleKeys.bind(this, true));
        window.removeEventListener('resize',  this.handleResize.bind(this, false));
    }

    startGame() {
        // make Pepe
        this.pepe = new Pepe({
            position: {
                x: this.state.screen.width / 2,
                y: this.state.screen.groundY - this.state.screen.height / 6,
            },
            gameOver: this.gameOver.bind(this)
        });

        // make dat boi
        let boi = new DatBoi({
            position: {
                x: 0 - this.state.screen.width / 10,
                y: this.state.screen.groundY - this.state.screen.height / 4.75,
            },
            addScore: this.addScore.bind(this)
        });
        this.newMeme(boi, 'datBoi');
    }

    update() {
        let context = this.state.context;

        context.save();
        context.scale(this.state.screen.ratio, this.state.screen.ratio);
        let background = new Image();
        background.src = "http://i.imgur.com/VvNhMb0.jpg"; // Windows XP Wallpaper (Bliss)
        context.drawImage(background, 0, 0, this.state.screen.width, this.state.screen.height);

        let floor = new Image();
        // floor.src = "https://wallpaperscraft.com/image/nicolas_cage_texture_portrait_face_58062_3840x2160.jpg";
        floor.src = Lava;
        context.drawImage(floor, 0, 0, floor.width, floor.height, 0, this.state.screen.height * 0.41, this.state.screen.width, this.state.screen.height);

        this.checkCollisions(this.pepe, this.datBoi);

        this.updateMemes(this.datBoi, 'datBoi');
        if(!this.pepe.dead) this.pepe.render(this.state);

        // Next frame
        requestAnimationFrame(() => {
            this.update()
        });

        context.restore();
    }

    checkCollisions(pepe, memeGroup) {
        for (let meme of memeGroup) {
            console.log(meme);
            if (pepe.velocity.y > 0 &&
                pepe.bottomRight.y > meme.topLeft.y &&
                (pepe.topLeft.x < meme.centerX &&
                pepe.bottomRight.x > meme.centerX)) {
                meme.squish();
                pepe.bounce = true;
            } else if (pepe.topLeft.x < meme.bottomRight.x &&
                pepe.bottomRight.x > meme.topLeft.x &&
                pepe.topLeft.y < meme.bottomRight.y &&
                pepe.bottomRight.y > meme.topLeft.y){
                pepe.getMemed();
            }
        }
    }

    newMeme(meme, group) {
        this[group].push(meme);
    }

    updateMemes(memes, group){
        let index = 0;
        for (let meme of memes) {
            if (meme.dead) {
                this[group].splice(index, 1);
            }else{
                memes[index].render(this.state);
            }
            index++;
        }
    }

    addScore(points){
        if(this.state.inGame){
            this.setState({
                score: this.state.score + points,
            });
        }
    }

    gameOver(){
        this.setState({
            inGame: false,
        });
    }

    render() {


        if(!this.state.inGame){
            this.endgame = (
                <div className="endgame">
                    <p>Game over, man!</p>
                    <p>Damn</p>
                    <button
                        onClick={ this.startGame.bind(this) }>
                        try again?
                    </button>
                </div>
            )
        }
        return (
            <div>
                {this.endgame}
                <canvas ref="canvas"
                        width={this.state.screen.width * this.state.screen.ratio}
                        height={this.state.screen.height * this.state.screen.ratio}/>
            </div>
        );
    }
}

export default MemeJump;
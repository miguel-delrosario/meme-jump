import React, { Component } from 'react';
import Pepe from './Pepe';
import DatBoi from './DatBoi';

import Bliss from './images/bliss.jpg'
import PepeLeft from './images/pepe-left.png'
import PepeRight from './images/pepe-right.png'
import PepeFeelsLeftMan from './images/pepe-sad-left.png'
import PepeFeelsRightMan from './images/pepe-sad-right.png'
import BoiLeft from './images/boi-left.png';
import BoiRight from './images/boi-right.png';

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
                groundY: window.innerHeight * 0.87,
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
            highScore: window.localStorage.getItem("high-score") || 0,
            combo: 0,
            inGame: true,
            context: null,
        };
        this.pepe = null;
        this.datBoi = [];
        this.memeCount = {
            overall: 0,
            datBoi: 0,
        };
        this.memeQueue = {
            datBoi: {
                maxTimer: 60,
                curTimer: 0,
                maxAlive: 5,
            },
        };
    }

    handleResize(){
        this.setState({
            screen : {
                width: window.innerWidth,
                height: window.innerHeight,
                groundY: window.innerHeight * 0.8,
                ratio: window.devicePixelRatio || 1,
            }
        });

        let context = this.state.context;
        context.save();
        context.scale(this.state.screen.ratio, this.state.screen.ratio);
        context.drawImage(window.images.bliss, 0, 0, this.state.screen.width, this.state.screen.height);
        context.restore();
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

        // hitbox visibility flag
        window.hitboxVisualization = false;

        this.load(
            [
                'pepeLeft',
                'pepeRight',
                'pepeFeelsRightMan',
                'pepeFeelsLeftMan',
                'boiLeft',
                'boiRight',
                'bliss'
            ],
            [
                PepeLeft,
                PepeRight,
                PepeFeelsRightMan,
                PepeFeelsLeftMan,
                BoiLeft,
                BoiRight,
                Bliss
            ]
        );
    }

    load(names, images) {
        let img;
        let uploaded = {};
        for(let i = 0; i < images.length; i++) {
            img = new Image();
            if(i === images.length - 1) {
                img.addEventListener('load', () => {this.startGame()}); // start game when final image has loaded
            }
            img.src = images[i];
            uploaded[names[i]] = img;
        }
        window.images = uploaded;
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.handleKeys.bind(this, false));
        window.removeEventListener('keydown', this.handleKeys.bind(this, true));
        window.removeEventListener('resize',  this.handleResize.bind(this));
    }

    startGame() {
        this.setState({
            inGame: true,
            score: 0,
        });
        // make Pepe
        this.pepe = new Pepe({
            position: {
                x: this.state.screen.width / 2, // center x-coordinate
                y: this.state.screen.groundY - this.state.screen.height / 6, // floor y-coordinate - height of Pepe
            },
            resetCombo: this.resetCombo.bind(this),
            gameOver: this.gameOver.bind(this)
        });

        requestAnimationFrame(() => {
            this.update()
        });
    }

    update() {
        let context = this.state.context;

        context.save();
        context.scale(this.state.screen.ratio, this.state.screen.ratio);

        context.drawImage(window.images.bliss, 0, 0, this.state.screen.width, this.state.screen.height);

        if(this.state.inGame) {
            this.checkCollisions(this.pepe, this.datBoi);

            this.spawn('datBoi');
            this.sweepAwayDead('datBoi');
            this.pepe.render(this.state);

            // Next frame
            requestAnimationFrame(() => {
                this.update()
            });
        }

        context.restore();
    }

    checkCollisions(pepe, memeGroup) {
        let pepeVulnerable = true;
        let pepeDie = false;
        for (let meme of memeGroup) {
            if (pepe.velocity.y > 0 && pepe.bottomRight.y >= meme.topLeft.y && pepe.centerY <= meme.topLeft.y &&
                ((pepe.topLeft.x <= meme.centerX && pepe.bottomRight.x >= meme.centerX) ||
                (pepe.topLeft.x <= meme.topLeft.x && pepe.bottomRight.x >= meme.topLeft.x) ||
                (pepe.bottomRight.x >= meme.bottomRight.x && pepe.topLeft.x <= meme.bottomRight.x))) {
                this.state.combo++;
                meme.squish();
                pepe.boing();
                pepeVulnerable = false;
            } else if (
                pepe.topLeft.x < meme.bottomRight.x &&
                pepe.bottomRight.x > meme.topLeft.x &&
                pepe.topLeft.y < meme.bottomRight.y &&
                pepe.bottomRight.y > meme.topLeft.y) {
                if(pepeVulnerable) {
                    pepeDie = true;
                }
            }
        }
        if (pepeVulnerable && pepeDie) {
            pepe.getMemed(this.state);
        }
    }

    spawn(group) {
        let queue = this.memeQueue[group]
        queue.curTimer--;
        if (queue.curTimer <= 0) {
            if (this[group].length < queue.maxAlive) {
                this.newMeme(group);
                this.memeQueue[group].curTimer = this.memeQueue[group].maxTimer;
            }
        }
    }

    newMeme(group) {
        let meme;
        switch(group) {
            case 'datBoi':
                meme = new DatBoi({gameScreen: this.state.screen, addScore: this.addScore.bind(this)});
                break;
            default:
                console.log("how'd it get here");
        }
        this[group].push(meme);
    }

    sweepAwayDead(memeGroup){
        this[memeGroup] = this[memeGroup].reduce((acc, meme) =>
        {
            if(meme.deadFrames > 0) {
            meme.render(this.state);
            return [...acc, meme];
            } else {
                return acc;
            }
        }, []);
    }

    addScore(points){
        if(this.state.inGame){
            const newScore = this.state.score + points * this.state.combo;
            if(newScore > this.state.highScore) {
                this.setState({
                    highScore: newScore,
                    score: newScore,
                });
            } else {
                this.setState({score: newScore});
            }
        }
    }

    resetCombo(){
        this.setState({combo: 0});
    }

    gameOver(){
        this.setState({inGame: false});
        this.datBoi = [];
        if(this.state.score >= this.state.highScore) {
            window.localStorage.setItem("high-score", this.state.score)
        }
    }

    render() {
        if(this.state.score >= this.state.highScore) {
            this.message = `New high score of ${this.state.highScore}!`
        } else {
            this.message = `You scored ${this.state.score} points!`
        }
        if(!this.state.inGame){
            this.endgame = (
                <div className="endgame">
                    <p>Game Over</p>
                    <p>{this.message}</p>
                    <button className="try-again pure-button" onClick={this.startGame.bind(this)}>
                        >try again
                    </button>
                </div>
            )
        } else {
            this.endgame = null;
        }
        return (
            <div>
                {this.endgame}
                <div className="hud combo">🔥 Combo: {this.state.combo}</div>
                <div className="hud score">️🐸 Score: {this.state.score}</div>
                <div className="hud high-score">🎉 High Score: {this.state.highScore}</div>
                <canvas ref="canvas"
                        width={this.state.screen.width * this.state.screen.ratio}
                        height={this.state.screen.height * this.state.screen.ratio}/>
            </div>
        );
    }
}

export default MemeJump;
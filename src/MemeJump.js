import React, { Component } from 'react';
import Pepe from './Pepe';
import DatBoi from './DatBoi';
import NyanCat from './NyanCat';

import Bliss from './images/bliss.jpg'
import PepeLeft from './images/pepe-left.png'
import PepeRight from './images/pepe-right.png'
import PepeFeelsLeftMan from './images/pepe-sad-left.png'
import PepeFeelsRightMan from './images/pepe-sad-right.png'
import BoiLeft from './images/boi-left.png';
import BoiRight from './images/boi-right.png';
import NyanLeft from './images/nyan-left.png';
import NyanRight from './images/nyan-right.png';

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

// hitbox visibility flag
window.hitboxVisualization = false;

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
            maxCombo: 0,
            context: null,
        };
        this.pepe = null;
        this.resetGame();
    }

    resetGame() {
        this.datBoi = [];
        this.nyanCat = [];
        this.memeCount = {
            overall: 0,
            datBoi: 0,
            nyanCat: 0,
        };
        this.memeQueue = {
            datBoi: {
                curTimer: 0,
                maxTimer: 60,
                curMaxAlive: 3,
                absMaxAlive: 5,
            },
            nyanCat: {
                curTimer: 0,
                maxTimer: 150,
                curMaxAlive: 2,
                absMaxAlive: 4,
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

        // preload images before game starts
        this.load(
            [
                'pepeLeft',
                'pepeRight',
                'pepeFeelsRightMan',
                'pepeFeelsLeftMan',
                'boiLeft',
                'boiRight',
                'nyanLeft',
                'nyanRight',
                'bliss'
            ],
            [
                PepeLeft,
                PepeRight,
                PepeFeelsRightMan,
                PepeFeelsLeftMan,
                BoiLeft,
                BoiRight,
                NyanLeft,
                NyanRight,
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
            score: 0
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

        // draw background
        context.save();
        context.scale(this.state.screen.ratio, this.state.screen.ratio);
        context.drawImage(window.images.bliss, 0, 0, this.state.screen.width, this.state.screen.height);

        if(this.state.inGame) {
            let memeGroups = ['datBoi', 'nyanCat'];

            this.checkCollisions(this.pepe, memeGroups);
            this.spawn(memeGroups);
            this.sweepAwayDead(memeGroups);
            this.pepe.render(this.state);

            // next frame
            requestAnimationFrame(() => {
                this.update()
            });
        }

        context.restore();
    }

    checkCollisions(pepe, groups) {
        let pepeVulnerable;
        let pepeDie;
        let bounceCount;
        let memesToSquish;
        let newCombo;
        let newMaxCombo;
        for(let group of groups) {
            pepeVulnerable = true;
            pepeDie = false;
            bounceCount = 0;
            memesToSquish = [];
            for (let meme of this[group]) {
                if (pepe.velocity.y > -5 && pepe.bottomRight.y >= meme.topLeft.y && pepe.centerY <= meme.topLeft.y &&
                    ((pepe.topLeft.x <= meme.centerX && pepe.bottomRight.x >= meme.centerX) ||
                    (pepe.topLeft.x <= meme.topLeft.x && pepe.bottomRight.x >= meme.topLeft.x) ||
                    (pepe.bottomRight.x >= meme.bottomRight.x && pepe.topLeft.x <= meme.bottomRight.x))) {
                    bounceCount++;
                    memesToSquish.push(meme); // add meme to the chopping block
                    pepe.boing();
                    // TODO: check if pepeVulnerable is not needed
                    pepeVulnerable = false; // to prevent pepe from dying when hopping on multiple of the same memes
                } else if (
                    pepe.topLeft.x < meme.bottomRight.x &&
                    pepe.bottomRight.x > meme.topLeft.x &&
                    pepe.topLeft.y < meme.bottomRight.y &&
                    pepe.bottomRight.y > meme.topLeft.y) {
                    if (pepeVulnerable) {
                        pepeDie = true;
                    }
                }
            }
            newCombo = this.state.combo + bounceCount;
            newMaxCombo = (newCombo > this.state.maxCombo) ? newCombo : this.state.maxCombo;
            this.setState({
                combo: newCombo,
                maxCombo: newMaxCombo
            });

            for(let meme of memesToSquish) {
                meme.squish();
            }

            if (pepeVulnerable && pepeDie) {
                pepe.getMemed();
            }
        }
    }

    spawn(groups) {
        for(let group of groups) {
            let queue = this.memeQueue[group];
            if(this.memeCount[group] === queue.curMaxAlive * 2 && queue.curMaxAlive < queue.absMaxAlive) queue.curMaxAlive++;
            queue.curTimer--;
            if (queue.curTimer <= 0) {
                if (this[group].length < queue.curMaxAlive) {
                    this.newMeme(group);
                    this.memeQueue[group].curTimer = this.memeQueue[group].maxTimer;
                }
            }
        }
    }

    newMeme(group) {
        let meme;
        let shouldSpawn = false;
        switch(group) {
            case 'datBoi':
                meme = new DatBoi({gameScreen: this.state.screen, addScore: this.addScore.bind(this)});
                shouldSpawn = true; // spawn DatBois from the get-go
                break;
            case 'nyanCat':
                meme = new NyanCat({gameScreen: this.state.screen, addScore: this.addScore.bind(this)});
                if(this.memeCount.datBoi >= 10) shouldSpawn = true; // spawn NyanCats after 10 DatBois have spawned
                break;
            default:
        }
        if(shouldSpawn) {
            this[group].push(meme);
            this.memeCount.overall++;
            this.memeCount[group]++;
        }
    }

    sweepAwayDead(groups) {
        for(let group of groups) {
            this[group] = this[group].reduce((acc, meme) => {
                if (meme.deadFrames > 0) {
                    meme.render(this.state);
                    return [...acc, meme];
                } else {
                    return acc;
                }
            }, []);
        }
    }

    addScore(points) {
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

    resetCombo() {
        this.setState({combo: 0});
    }

    gameOver(){
        this.setState({inGame: false});

        this.resetGame();

        if(this.state.score >= this.state.highScore) {
            window.localStorage.setItem("high-score", this.state.score)
        }
    }

    render() {
        if(this.state.score >= this.state.highScore) {
                this.message = `NEW HIGH SCORE OF ${this.state.highScore}!`
        } else {
            this.message = `YOU SCORED ${this.state.score} POINTS!`
        }
        if(!this.state.inGame){
            this.endgame = (
                <div className="endgame">
                    <h2>GAME OVER</h2>
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
                <div className="hud combo">
                    <span role="img" aria-label="fire-emoji">🔥</span>
                    <span className="max-combo"> {this.state.inGame ? `Combo: ${this.state.combo}` : `Max Combo: ${this.state.maxCombo}`}</span>
                </div>
                <div className="hud score">
                    <span role="img" aria-label="frog-emoji">️🐸</span> Score: {this.state.score}
                </div>
                <div className="hud high-score">
                    <span role="img" aria-label="party-popper-emoji">🎉</span> High Score: {this.state.highScore}
                </div>
                <canvas ref="canvas"
                        width={this.state.screen.width * this.state.screen.ratio}
                        height={this.state.screen.height * this.state.screen.ratio}/>
            </div>
        );
    }
}

export default MemeJump;
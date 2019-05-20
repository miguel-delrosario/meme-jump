import React, { Component } from 'react';
import Pepe from './Pepe';
import Meme from './Meme';

import Bliss from './images/bliss.jpg'
import PepeLeft from './images/pepe-left.png'
import PepeRight from './images/pepe-right.png'
import PepeFeelsLeftMan from './images/pepe-sad-left.png'
import PepeFeelsRightMan from './images/pepe-sad-right.png'
import BoiLeft from './images/boi-left.png';
import BoiRight from './images/boi-right.png';
import NyanLeft from './images/nyan-left.png';
import NyanRight from './images/nyan-right.png';
import DogeLeft from './images/doge-left.png';
import DogeRight from './images/doge-right.png';
import Poof from './images/poof.png';
import YouDied from './images/you-died.png';
import PaymentForm from "./PaymentForm";

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
        this.groundRatio = 0.87;
        this.state = {
            screen: {
                width: window.innerWidth,
                height: window.innerHeight,
                groundY: window.innerHeight * this.groundRatio,
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
            inGame: true,
            modal: null,
            upgradeEnabled: false
        };

        this.pepe = null;
        this.memeGroups = ['doge', 'datBoi', 'nyanCat'];
        this.resetGame();
    }

    resetGame() {
        this.doge = [];
        this.datBoi = [];
        this.nyanCat = [];
        this.memeCount = {
            overall: 0,
            datBoi: 0,
            nyanCat: 0,
            doge: 0,
        };
        this.memeQueue = {
            doge: {
                curTimer: 0,
                curMaxTimer: 150,
                absMinTimer: 100,
            },
            datBoi: {
                curTimer: 0,
                curMaxTimer: 200,
                absMinTimer: 150,
            },
            nyanCat: {
                curTimer: 0,
                curMaxTimer: 250,
                absMinTimer: 200,
            },
        };
    }

    isMobileDevice() {
    return typeof window.orientation !== "undefined" || navigator.userAgent.indexOf('IEMobile') !== -1;
    };

    handleResize(){
        this.setState({
            screen : {
                width: window.innerWidth,
                height: window.innerHeight,
                groundY: window.innerHeight * this.groundRatio,
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

    componentWillMount() {
        // copypasta'd from https://developer.squareup.com/blog/online-payments-form-react/
        let sqPaymentScript = document.createElement("script");
        sqPaymentScript.src = "https://js.squareup.com/v2/paymentform";
        sqPaymentScript.type = "text/javascript";
        sqPaymentScript.async = false;
        document.getElementsByTagName("head")[0].appendChild(sqPaymentScript);
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
                'dogeLeft',
                'dogeRight',
                'poof',
                'youDied',
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
                DogeLeft,
                DogeRight,
                Poof,
                YouDied,
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
            maxCombo: 0,
            score: 0,
            modal: null,
        });

        // make Pepe
        this.pepe = new Pepe({
            position: {
                x: this.state.screen.width / 2, // center x-coordinate
                y: this.state.screen.groundY - this.state.screen.height / 6, // floor y-coordinate - height of Pepe
            },
            speedMultiplier: (this.state.upgradeEnabled ? 2 : 1),
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
            this.checkCollisions(this.pepe, this.memeGroups);
            this.spawn(this.memeGroups);
            this.sweepAwayDead(this.memeGroups);
            this.pepe.render(this.state);

            // next frame
            requestAnimationFrame(() => {
                this.update()
            });
        }

        context.restore();
    }

    checkCollisions(pepe, groups) {
        let bounceCount;
        let memesToSquish;
        let newCombo;
        let newMaxCombo;
        for(let group of groups) {
            bounceCount = 0;
            memesToSquish = [];
            for (let meme of this[group]) {
                if ((pepe.velocity.y > -5 && pepe.bottomRight.y >= meme.topLeft.y && pepe.centerY <= meme.topLeft.y) &&
                    ((pepe.topLeft.x <= meme.centerX && pepe.bottomRight.x >= meme.centerX) ||
                    (pepe.topLeft.x <= meme.topLeft.x && pepe.bottomRight.x >= meme.topLeft.x) ||
                    (pepe.bottomRight.x >= meme.bottomRight.x && pepe.topLeft.x <= meme.bottomRight.x) ||
                    (pepe.centerX >= meme.topLeft.x && pepe.centerX <= meme.bottomRight.x))) {
                    bounceCount++;
                    memesToSquish.push(meme); // add meme to the chopping block
                    pepe.boing();
                } else if (
                    ((pepe.topLeft.x < meme.topLeft.x && pepe.bottomRight.x > meme.topLeft.x) ||
                    (pepe.topLeft.x < meme.bottomRight.x && pepe.bottomRight.x > meme.bottomRight.x) ||
                    (pepe.topLeft.x > meme.topLeft.x && pepe.bottomRight.x < meme.bottomRight.x)) &&
                    pepe.bottomRight.y > meme.topLeft.y && pepe.topLeft.y < meme.bottomRight.y) {
                    pepe.getMemed();
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
        }
    }

    spawn(groups) {
        for(let group of groups) {
            let queue = this.memeQueue[group];
            queue.curTimer--;
            if (queue.curTimer <= 0 || queue.curTimer === 2 * queue.curMaxTimer) {
                this.newMeme(group);
                queue.curTimer = queue.curMaxTimer;
                if(queue.curMaxTimer > queue.absMinTimer) {
                    queue.curMaxTimer -= 5;
                }
            }
        }
    }

    newMeme(group) {
        let meme = {};
        let shouldSpawn = false;
        switch(group) {
            case 'doge':
                shouldSpawn = true; // spawn Doge from the get-go
                meme = new Meme({
                    gameScreen: this.state.screen,
                    pointValue: 100,
                    widthRatio: 8,
                    heightRatio: 10,
                    speedRatio: 550,
                    flyHeight: 1,
                    frames: 13,
                    ticksPerFrame: 40,
                    hitBoxStartRatio: 0,
                    hitBoxEndRatio: 1,
                    heightBoxRatio: 0.8,
                    rightSprite: 'dogeRight',
                    leftSprite: 'dogeLeft',
                    addScore: this.addScore.bind(this)
                });
                break;
            case 'datBoi':
                if(this.memeCount.doge >= 5) {
                    shouldSpawn = true; // spawn DatBois after 10 Doges have spawned
                    meme = new Meme({
                        gameScreen: this.state.screen,
                        pointValue: 150,
                        widthRatio: 10,
                        heightRatio: 4.5,
                        speedRatio: 300,
                        flyHeight: 1,
                        frames: 5,
                        ticksPerFrame: 25,
                        hitBoxStartRatio: 0.25,
                        hitBoxEndRatio: 0.6,
                        heightBoxRatio: 1,
                        rightSprite: 'boiRight',
                        leftSprite: 'boiLeft',
                        addScore: this.addScore.bind(this)
                    });
                }
                break;
            case 'nyanCat':
                if(this.memeCount.datBoi >= 5) {
                    shouldSpawn = true; // spawn NyanCats after 10 DatBois have spawned
                    meme = new Meme({
                        gameScreen: this.state.screen,
                        pointValue: 250,
                        widthRatio: 8,
                        heightRatio: 10,
                        speedRatio: 400,
                        flyHeight: 4,
                        frames: 6,
                        ticksPerFrame: 25,
                        hitBoxStartRatio: 0.47,
                        hitBoxEndRatio: 0.9,
                        heightBoxRatio: 1,
                        rightSprite: 'nyanRight',
                        leftSprite: 'nyanLeft',
                        addScore: this.addScore.bind(this)
                    });
                }
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

    showPaymentForm() {
        let paymentForm = (
            <PaymentForm paymentForm={window.SqPaymentForm} enableUpgrade={this.enableUpgrade.bind(this)} close={this.closePaymentForm.bind(this)} />
        )
        this.setState({modal: paymentForm})
    }

    enableUpgrade() {
        this.setState({upgradeEnabled: true});

        this.startGame();
    }

    closePaymentForm() {
        this.setState({
            modal: this.endgame(),
            upgradeEnabled: false,
        });
    }

    endgame() {
        let upgradeCharacter = null;
        if (!this.state.upgradeEnabled) {
            upgradeCharacter = (
                <button className="try-again pure-button" onClick={this.showPaymentForm.bind(this)}>
                    >upgrade character
                </button>
            )
        }
        return (
            (
                <div className="endgame modal">
                    <img className="you-died" src={YouDied} alt="Game Over" height={this.state.screen.height / 10}/>
                    <p>{this.message}</p>
                    <div className="button-tray">
                        <button className="try-again pure-button" onClick={this.startGame.bind(this)}>
                            >try again
                        </button>
                        {upgradeCharacter}
                    </div>
                </div>
            )
        )
    }

    gameOver(){
        this.setState({
            inGame: false,
            modal: this.endgame(),
        });

        this.resetGame();

        if(this.state.score >= this.state.highScore) {
            window.localStorage.setItem("high-score", this.state.score)
        }
    }

    render() {
        if(this.state.score >= this.state.highScore) {
            this.message = `NEW HIGH SCORE: ${this.state.highScore}!`;
        } else {
            this.message = `SCORE: ${this.state.score}!`;
        }

        this.speedNotif = null;
        if (this.state.upgradeEnabled) {
            this.speedNotif = (
                <div className="hud speed-notif">
                    <span className="speed-notif">2xSpeed Active</span>
                </div>
            )
        }

        return (
            <div>
                {this.state.modal}
                {this.speedNotif}
                <div className="hud combo">
                    <span role="img" aria-label="fire-emoji">🔥</span>
                    <span className="hud-text max-combo">{this.state.inGame ? `Combo: ${this.state.combo}` : `Max Combo: ${this.state.maxCombo}`}</span>
                </div>
                <div className="hud score">
                    <span role="img" aria-label="frog-emoji">️🐸</span>
                    <span className="hud-text">Score: {this.state.score}</span>
                </div>
                <div className="hud high-score">
                    <span role="img" aria-label="party-popper-emoji">🎉</span>
                    <span className="hud-text">High Score: {this.state.highScore}</span>
                </div>
                <canvas ref="canvas"
                        width={this.state.screen.width * this.state.screen.ratio}
                        height={this.state.screen.height * this.state.screen.ratio}/>
            </div>
        );
    }
}

export default MemeJump;

import React, { Component } from 'react';
import Pepe from './Pepe';

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
        }
        this.pepe = null;
    }

    handleResize(value, e){
        this.setState({
            screen : {
                width: window.innerWidth,
                height: window.innerHeight,
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

    updateObjects(items, group){
        let index = 0;
        for (let item of items) {
            if (item.delete) {
                this[group].splice(index, 1);
            }else{
                items[index].render(this.state);
            }
            index++;
        }
    }


    update() {
        const context = this.state.context;
        const pepe = this.pepe;

        context.save();
        context.scale(this.state.screen.ratio, this.state.screen.ratio);
        context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);

        this.pepe.render(this.state);

        // Next frame
        requestAnimationFrame(() => {
            this.update()
        });

        context.restore();
    }

    gameOver(){
        this.setState({
            inGame: false,
        });
    }

    startGame() {
        // make Pepe
        let pepe = new Pepe({
            position: {
                x: this.state.screen.width / 2,
                y: this.state.screen.height * 0.75
            },
            onDie: this.gameOver.bind(this)
        });
        this.pepe = pepe;
    }

    render() {
        return (
            <div>
                <canvas ref="canvas"
                        width={this.state.screen.width * this.state.screen.ratio}
                        height={this.state.screen.height * this.state.screen.ratio}/>
            </div>
        );
    }
}

export default MemeJump;
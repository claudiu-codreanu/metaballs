class Ball {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.radius = r;

        this.speedX = random(2, 10);
        this.speedY = random(2, 10);
    }

    calcPosition(width, height) {
        this.moveX();
        this.moveY();

        this.clampX(width);
        this.clampY(height);
    }


    moveX() { this.x += this.speedX; }
    moveY() { this.y += this.speedY; }

    bounceX() { this.speedX = -this.speedX; }
    bounceY() { this.speedY = -this.speedY; }


    clampX(width) {
        if(this.x < this.radius) {
            this.x = this.radius;
            this.bounceX();
        }

        if(this.x > width - this.radius) {
            this.x = width - this.radius;
            this.bounceX();
        }
    }

    clampY(height) {
        if(this.y < this.radius) {
            this.y = this.radius;
            this.bounceY();
        }

        if(this.y > height - this.radius) {
            this.y = height - this.radius;
            this.bounceY();
        }
    }
}


class Game {
    constructor(numBalls, radius, width, height) {
        this.width = width;
        this.height = height;

        this.balls = [];
        this.zoom = 1; // pixelation factor, not used

        for(let i = 0; i < numBalls; i++) {
            let x = random(0, width),
                y = random(0, height);

            this.balls.push(new Ball(x, y, radius));
        }
    }

    calcFrame() {
        //console.time("calc frame");

        let {balls, width, height, zoom} = this;
        balls.forEach(ball => ball.calcPosition(width, height));

        this.pixels = [];

        for(let y = 0; y < height; y += zoom) {
            let row = [];

            for(let x = 0; x < width; x += zoom) {
                row.push(this.calcPixel(x, y));
            }

            this.pixels.push(row);
        }

        //console.timeEnd("calc frame");
    }

    paintFrame(ctx) {
        //console.time("paint frame");

        let {pixels, width, height} = this;

        if(!this.imageData) {
            this.imageData = ctx.getImageData(0, 0, width, height);
        }

        let index = 0;
        let {data} = this.imageData;

        for(let y = 0; y < pixels.length; y++) {
            let row = pixels[y];

            for(let x = 0; x < row.length; x++) {
                let n = row[x];
                let [r, g, b] = this.getRgb(n);

                data[index++] = r;
                data[index++] = g;
                data[index++] = b;

                data[index++] = 255;
            }
        }

        ctx.putImageData(this.imageData, 0, 0);

        //console.timeEnd("paint frame");
    }

    calcPixel(x, y) {
        let {balls} = this;

        let pixel = balls.reduce((total, ball) => {
            return total + ball.radius / this.calcDist(x, y, ball.x, ball.y);
        }, 0);

        let max = settings.colorEffect == "hsl" ? 360 : 255;

        if(pixel >= 1) {
            return max;
        }

        return Math.floor(pixel * max);
    }

    calcDist(x1, y1, x2, y2) {
        let dx = x2 - x1,
            dy = y2 - y1;

        return Math.sqrt(dx*dx + dy*dy);
    }

    getRgb(n) {
        let {colorEffect, invertedColor} = settings;

        switch(colorEffect) {
            case "red":
                return invertedColor ? [255 - n, 0, 0] : [n, 0, 0];

            case "green":
                return invertedColor ? [0, 255 - n, 0] : [0, n, 0];

            case "blue":
                return invertedColor ? [0, 0, 255 - n] : [0, 0, n];

            case "grey":
                return invertedColor ? [255 - n, 255 - n, 255 - n] : [n, n, n];

            case "hsl":
                let [r, g, b] = hsl2rgb(n);
                return invertedColor ? [255 - r, 255 - g, 255 - b] : [r, g, b];

            default:
                return [0, 0, 0];
        }
    }
}


function random(min, max) {
    return min + Math.ceil( Math.random() * (max - min) );
}


// formula found at: https://www.rapidtables.com/convert/color/hsl-to-rgb.html
function hsl2rgb(h, s = 1, l = 0.5) {
    let c = (1 - Math.abs(2*l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;

    let r1, g1, b1;

    if(h < 60) {
        r1 = c;
        g1 = x;
        b1 = 0;
    } else if(h < 120) {
        r1 = x;
        g1 = c;
        b1 = 0;
    } else if(h < 180) {
        r1 = 0;
        g1 = c;
        b1 = x;
    } else if(h < 240) {
        r1 = 0;
        g1 = x;
        b1 = c;
    } else if(h < 300) {
        r1 = x;
        g1 = 0;
        b1 = c;
    } else {
        r1 = c;
        g1 = 0;
        b1 = x;
    }

    let r = 255 * (r1 + m);
    let g = 255 * (g1 + m);
    let b = 255 * (b1 + m);

    return [Math.round(r), Math.round(g), Math.round(b)];
}


function fillRgbTable() {
    let table = [];

    for(let h = 0; h <= 360; h++) {
        table.push(hsl2rgb(h));
    }

    return table;
}


let canvas,
    ctx,
    rgbTable,
    interval;

let settings = {
    colorEffect: "hsl",
    invertedColor: false,
    numBalls: 5,
    ballRadius: 30
}


window.onload = () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    rgbTable = fillRgbTable();
    startGame();
}


function startGame() {
    let {numBalls, ballRadius} = settings;
    let {width, height} = canvas;

    let game = new Game(numBalls, ballRadius, width, height);
    
    interval = setInterval(() => {
        game.calcFrame();
        game.paintFrame(ctx);
    }, 50);
}

function stopGame() {
    clearInterval(interval);
}


function setColorEffect(color) {
    settings.colorEffect = color;
}

function setInvertedEffect() {
    let chk = document.getElementById("chkInverted");
    settings.invertedColor = chk.checked;
}


function setNumBalls() {
    let input = document.getElementById("numBalls");
    settings.numBalls = clamp(input);

    stopGame();
    startGame();
}

function setBallRadius() {
    let input = document.getElementById("ballRadius");
    settings.ballRadius = clamp(input);

    stopGame();
    startGame();
}

function clamp(input) {
    let min = parseInt(input.min),
        max = parseInt(input.max),
        value = input.valueAsNumber;

    if(value < min) {
        value = min;
        input.valueAsNumber = min;
    }

    if(value > max) {
        value = max;
        input.valueAsNumber = max;
    }

    return value;
}


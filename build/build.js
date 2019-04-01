var sketch = (p) => {
    const DEFAULT_KIT_PATH = "audio/default-kit/";
    const DEFAULT_KIT_NAMES = [
        "snare01.wav",
        "snare02.wav",
        "snare03.wav",
        "snare04.wav",
        "clap01.wav",
        "kick01.wav",
        "kick02.wav",
        "openhat01.wav",
        "openhat02.wav",
        "openhat03.wav",
        "clap02.wav",
        "closedhat01.wav",
        "closedhat03.wav",
        "closedhat02.wav",
        "closedhat04.wav"
    ];
    const SOUNDS = [];
    const NUM_COLS = 5;
    const NUM_ROWS = 3;
    let size = { x: 8, y: 8 };
    const X_GAP = 3;
    const Y_GAP = 75;
    const SQUARE_SIZE = 20;
    const PADDING = 2;
    const SEQUENCER_DIM_SIZE_X = size.x * (SQUARE_SIZE + PADDING) + SQUARE_SIZE + 2 * PADDING;
    const SEQUENCER_DIM_SIZE_Y = size.y * (SQUARE_SIZE + PADDING) + SQUARE_SIZE + 2 * PADDING + 75;
    let SEQUENCER_ARR = [];
    let CURRENT_STEP = { x: 0, y: 0 };
    let drawFullSeq = true;
    let drawInfo = true;
    let BPM = 240;
    let MILLIS_PER_BEAT = (60 / BPM) * 1000;
    let BEAT_PER_SEC = BPM / 60;
    let LAST_PRINT = p.millis();
    let bpmSlider;
    let resetButton;
    let randomizeButton;
    let inverseButton;
    p.preload = () => {
        DEFAULT_KIT_NAMES.forEach(name => {
            SOUNDS.push({ name: name, sound: p.loadSound(DEFAULT_KIT_PATH + name) });
        });
    };
    p.setup = () => {
        setupManipulators();
        for (let y = 0; y < NUM_ROWS; y++) {
            for (let x = 0; x < NUM_COLS; x++) {
                let seq = new Sequencer(size.x, size.y, X_GAP + x * SEQUENCER_DIM_SIZE_X, Y_GAP + y * SEQUENCER_DIM_SIZE_Y, PADDING, SQUARE_SIZE);
                seq.setup(p, SOUNDS[SEQUENCER_ARR.length]);
                SEQUENCER_ARR.push(seq);
            }
        }
        p.createCanvas(p.windowWidth, p.windowHeight).drop(fileHandle);
        p.frameRate(BEAT_PER_SEC * 10);
    };
    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        drawFullSeq = true;
    };
    p.draw = () => {
        if (drawFullSeq) {
            drawFullSeq = false;
            SEQUENCER_ARR.forEach(seq => {
                seq.initialDraw(p);
            });
        }
        if (drawInfo) {
            drawInfo = false;
            drawSliderInfo();
        }
        handleBeat();
    };
    p.mouseClicked = (coords) => {
        let seq = getSequencerFromCoord(coords);
        if (seq)
            seq.mouseClicked(p, coords);
    };
    function getSequencerFromCoord(point) {
        let seqX = Math.floor((point.x - X_GAP) / SEQUENCER_DIM_SIZE_X);
        let seqY = Math.floor((point.y - Y_GAP) / SEQUENCER_DIM_SIZE_Y);
        if (seqX < 0 || seqX >= NUM_COLS || seqY < 0 || seqY >= NUM_ROWS) {
            return false;
        }
        return SEQUENCER_ARR[seqX + seqY * NUM_COLS];
    }
    function drawSliderInfo() {
        p.fill(255);
        p.stroke(255);
        p.rect(0, 0, p.windowWidth, Y_GAP - 1);
        p.fill(0);
        p.textSize(12);
        p.text("BPM", 1, 20);
        p.text(bpmSlider.value(), 440, 20);
    }
    function setupManipulators() {
        bpmSlider = p.createSlider(60, 600, BPM, 2);
        bpmSlider.position(35, 5);
        bpmSlider.style("width", "400px");
        bpmSlider.mouseReleased((event) => {
            BPM = bpmSlider.value();
            MILLIS_PER_BEAT = (60 / BPM) * 1000;
            BEAT_PER_SEC = BPM / 60;
            p.frameRate(BEAT_PER_SEC * 10);
            drawInfo = true;
        });
        resetButton = p.createButton('Reset');
        resetButton.position(5, 30);
        resetButton.mousePressed((event) => {
            CURRENT_STEP = { x: 0, y: 0 };
            drawFullSeq = true;
            LAST_PRINT = p.millis();
            SEQUENCER_ARR.forEach(seq => {
                seq.reset(p);
            });
        });
        randomizeButton = p.createButton('Randomize');
        randomizeButton.position(70, 30);
        randomizeButton.mousePressed((event) => {
            SEQUENCER_ARR.forEach(seq => {
                seq.randomize(p);
            });
        });
        inverseButton = p.createButton('Inverse');
        inverseButton.position(170, 30);
        inverseButton.mousePressed((event) => {
            SEQUENCER_ARR.forEach(seq => {
                seq.inverse(p);
            });
        });
    }
    function handleBeat() {
        let curMillis = p.millis();
        let timeElapsed = curMillis - LAST_PRINT;
        if (timeElapsed > MILLIS_PER_BEAT) {
            step();
            LAST_PRINT = curMillis;
        }
    }
    function step() {
        let newStep = Object.assign({}, CURRENT_STEP);
        newStep.x++;
        if (newStep.x >= size.x) {
            newStep.x = 0;
            newStep.y = (newStep.y + 1) % size.y;
        }
        SEQUENCER_ARR.forEach(seq => {
            seq.play(newStep);
        });
        SEQUENCER_ARR.forEach(seq => {
            seq.draw(p, CURRENT_STEP, newStep);
        });
        CURRENT_STEP = newStep;
    }
    function fileHandle(file) {
        if (file.type == "audio") {
            let curMouseX = p.mouseX;
            let curMouseY = p.mouseY;
            p.loadSound(file.data, (sound) => {
                let seq = getSequencerFromCoord({ x: curMouseX, y: curMouseY });
                if (seq) {
                    seq.setSound(p, file.name, sound);
                }
            });
        }
    }
};
var sketchP = new p5(sketch);
class Sequencer {
    constructor(xGridSize = 8, yGridSize = 8, xAlign = 3, yAlign = 3, padding = 2, squareSize = 10) {
        this.padding = 2;
        this.squareSize = 10;
        this.sound = null;
        this.size = { x: xGridSize, y: yGridSize };
        this.align = { x: xAlign, y: yAlign };
        this.padding = padding;
        this.squareSize = squareSize;
        let activated = [];
        for (let y = 0; y < this.size.y; y++) {
            activated.push(Array(this.size.x).fill(false));
        }
        this.matrix = activated;
        this.sound = null;
    }
    setup(p, { name, sound }) {
        this.setupSliders(p);
        this.setSound(p, name, sound);
    }
    setSound(p, name, sound) {
        this.filename = name;
        this.sound = sound;
        this.drawFilename(p);
    }
    initialDraw(p) {
        p.strokeWeight(1);
        p.stroke(1);
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                let fill = 255;
                if (this.matrix[y][x])
                    fill = 100;
                this.drawSquare(p, { x: x, y: y }, fill);
            }
        }
        this.drawFilename(p);
    }
    draw(p, oldStep, newStep) {
        p.strokeWeight(1);
        p.stroke(1);
        this.drawSquare(p, newStep, 0);
        this.drawSquare(p, oldStep, this.matrix[oldStep.y][oldStep.x] ? 100 : 255);
    }
    drawSquare(p, point, fill) {
        p.fill(fill);
        let { x, y } = point;
        let topLeftY = this.align.y + y * this.squareSize + y * this.padding;
        let topLeftX = this.align.x + x * this.squareSize + x * this.padding;
        p.rect(topLeftX, topLeftY, this.squareSize, this.squareSize);
    }
    drawFilename(p) {
        let x = this.align.x;
        let y = this.align.y + this.size.y * (this.squareSize + this.padding);
        p.strokeWeight(0);
        p.fill(255);
        p.rect(x, y, this.size.y * (this.squareSize + 2 * this.padding), this.squareSize);
        p.fill(0);
        p.textSize(12);
        p.text(this.filename, this.align.x, this.align.y + this.size.y * (this.squareSize + 2 * this.padding));
    }
    mouseClicked(p, click) {
        let grid = this.calculateGridPosition(click);
        if (grid.x <= -1 ||
            grid.x >= this.size.x ||
            grid.y <= -1 ||
            grid.y >= this.size.y) {
            return;
        }
        this.drawSquare(p, grid, this.toggle(grid) ? 100 : 255);
    }
    calculateGridPosition(click) {
        let selectedX = Math.floor((click.x - this.align.x) / (this.squareSize + this.padding));
        let selectedY = Math.floor((click.y - this.align.y) / (this.squareSize + this.padding));
        return { x: selectedX, y: selectedY };
    }
    toggle(grid) {
        let { x, y } = grid;
        if (this.matrix[y][x]) {
            return (this.matrix[y][x] = false);
        }
        return (this.matrix[y][x] = true);
    }
    play(grid) {
        if (this.matrix[grid.y][grid.x] && this.sound != null)
            this.sound.play();
    }
    reset(p) {
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                this.matrix[y][x] = false;
                this.drawSquare(p, { x, y }, 255);
            }
        }
    }
    randomize(p) {
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                if (Math.random() < 0.3) {
                    this.matrix[y][x] = true;
                    this.drawSquare(p, { x, y }, 100);
                }
                else {
                    this.matrix[y][x] = false;
                    this.drawSquare(p, { x, y }, 255);
                }
            }
        }
    }
    inverse(p) {
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                this.drawSquare(p, { x, y }, this.toggle({ x, y }) ? 100 : 255);
            }
        }
    }
    setupSliders(p) {
        let sliderWidth = this.size.x * (this.squareSize - this.padding);
        if (this.loudnessSlider == null) {
            this.loudnessSlider = p.createSlider(0, 2, 1, 0.1);
            this.loudnessSlider.position(this.align.x, 5 + this.align.y + this.size.y * (this.squareSize + 2 * this.padding));
            this.loudnessSlider.style("width", "" + sliderWidth);
            this.loudnessSlider.mouseReleased(event => {
                console.log("setting volume");
                this.sound.setVolume(this.loudnessSlider.value(), 0, 0);
            });
        }
        if (this.panSlider == null) {
            this.panSlider = p.createSlider(-1, 1, 0, 0.1);
            this.panSlider.position(this.align.x, 25 + this.align.y + this.size.y * (this.squareSize + 2 * this.padding));
            this.panSlider.style("width", "" + sliderWidth);
            this.panSlider.mouseReleased(event => {
                console.log("setting pan");
                this.sound.pan(this.panSlider.value(), 0);
            });
        }
    }
}
//# sourceMappingURL=build.js.map
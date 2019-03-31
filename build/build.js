var sketch = (p) => {
    const DEFAULT_KIT_PATH = "audio/default-kit/";
    const DEFAULT_KIT_NAMES = [
        "snare01.wav",
        "snare03.wav",
        "snare02.wav",
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
    const SIZE = { x: 8, y: 8 };
    const X_GAP = 3;
    const Y_GAP = 3;
    const SQUARE_SIZE = 20;
    const PADDING = 2;
    const SEQUENCER_DIM_SIZE_X = SIZE.x * (SQUARE_SIZE + PADDING) + SQUARE_SIZE + 2 * PADDING;
    const SEQUENCER_DIM_SIZE_Y = SIZE.y * (SQUARE_SIZE + PADDING) + SQUARE_SIZE + 2 * PADDING + 75;
    let SEQUENCER_ARR = [];
    let CURRENT_STEP = { x: 0, y: 0 };
    let inititalDrawDone = false;
    let BPM = 240;
    let MILLIS_PER_BEAT = (1 / (BPM / 60)) * 1000;
    let LAST_PRINT = p.millis();
    p.preload = () => {
        DEFAULT_KIT_NAMES.forEach(name => {
            SOUNDS.push({ name: name, sound: p.loadSound(DEFAULT_KIT_PATH + name) });
        });
    };
    p.setup = () => {
        for (let y = 0; y < NUM_ROWS; y++) {
            for (let x = 0; x < NUM_COLS; x++) {
                let seq = new Sequencer(SIZE.x, SIZE.y, X_GAP + x * SEQUENCER_DIM_SIZE_X, Y_GAP + y * SEQUENCER_DIM_SIZE_Y, PADDING, SQUARE_SIZE);
                seq.setup(p, SOUNDS[SEQUENCER_ARR.length]);
                SEQUENCER_ARR.push(seq);
            }
        }
        p.createCanvas(p.windowWidth, p.windowHeight).drop(fileHandle);
        p.frameRate(BPM * 2);
    };
    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        inititalDrawDone = false;
    };
    p.draw = () => {
        if (!inititalDrawDone) {
            inititalDrawDone = true;
            SEQUENCER_ARR.forEach(seq => {
                seq.initialDraw(p);
            });
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
        if (newStep.x >= SIZE.x) {
            newStep.x = 0;
            newStep.y = (newStep.y + 1) % SIZE.y;
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
                this.drawSquare(p, { x: x, y: y }, 255);
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
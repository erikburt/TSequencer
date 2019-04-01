var sketch = (p: p5) => {
  const DEFAULT_KIT_PATH = "audio/default-kit/";
  const DEFAULT_KIT_NAMES = [
    "snare01.wav",
    "snare02.wav",
    "tom01.wav",
    "tom02.wav",
    "tom03.wav",
    "kick01.wav",
    "kick02.wav",
    "openhat01.wav",
    "openhat02.wav",
    "clap01.wav",
    "closedhat01.wav",
    "closedhat02.wav",
    "clap02.wav",
    "laser.wav",
    "drop.wav"
  ];
  const SOUNDS: { name: string; sound: p5.SoundFile }[] = [];

  const NUM_COLS = 5;
  const NUM_ROWS = 3;

  let size: IPoint = { x: 8, y: 8 }; // Grid size of sequencer
  const X_GAP = 3; // Initial gap from left side of window to first line
  const Y_GAP = 75; // Initial gap from top side of window to first line
  const SQUARE_SIZE = 20; // Side size of individual squares
  const PADDING = 2; // Padding between individual squares
  const SEQUENCER_DIM_SIZE_X = // The amount of room one sequencer takes up on the x axis
    size.x * (SQUARE_SIZE + PADDING) + SQUARE_SIZE + 2 * PADDING;
  const SEQUENCER_DIM_SIZE_Y = // The amount of room one sequencer takes up on the y axis
    size.y * (SQUARE_SIZE + PADDING) + SQUARE_SIZE + 2 * PADDING + 75;

  let SEQUENCER_ARR: Sequencer[] = []; // Stores all the sequencers
  let CURRENT_STEP: IPoint = { x: 0, y: 0 }; //Maintains the current step of all the sequencers
  let drawFullSeq = true;
  let drawInfo = true;

  let BPM = 240;
  let MILLIS_PER_BEAT = (60 / BPM) * 1000;
  let BEAT_PER_SEC = BPM / 60;
  let LAST_PRINT = p.millis();

  let beatInterval: number;

  let bpmSlider: p5.Element;
  let resetButton: p5.Element;
  let randomizeButton: p5.Element;
  let inverseButton: p5.Element;

  // The initial loading of all the default sounds, called before setup
  p.preload = () => {
    DEFAULT_KIT_NAMES.forEach(name => {
      // @ts-ignore: Load Sound does not exist on type p5
      p.loadSound(DEFAULT_KIT_PATH + name, (sound: p5.SoundFile) => {
        // @ts-ignore: Filedoes not exist on type SoundFile
        let name = sound.file.split("/")[2];
        SOUNDS.push({ name, sound });
      });
    });
  };

  // Setup function, called implictly by p5
  p.setup = () => {
    setupManipulators();

    let drumNumber = 0;

    for (let y = 0; y < NUM_ROWS; y++) {
      for (let x = 0; x < NUM_COLS; x++) {
        //Instantiate a new sequencer
        let seq = new Sequencer(
          size.x,
          size.y,
          X_GAP + x * SEQUENCER_DIM_SIZE_X,
          Y_GAP + y * SEQUENCER_DIM_SIZE_Y,
          PADDING,
          SQUARE_SIZE
        );

        let drum = SOUNDS[drumNumber++ % SOUNDS.length];

        seq.setup(p, drum);
        SEQUENCER_ARR.push(seq);
      }
    }

    p.createCanvas(p.windowWidth, p.windowHeight).drop(fileHandle);
    p.frameRate(BEAT_PER_SEC); //Refreshes on the beat interval

    beatInterval = setInterval(step, MILLIS_PER_BEAT);
  };

  // On window resize - resize canvas and redraw
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    drawFullSeq = true;
    drawInfo = true;
  };

  p.draw = () => {
    if (drawInfo) {
      drawInfo = false;
      drawSliderInfo();
    }
  };

  // Handles the mouse click events
  p.mouseClicked = (event: MouseEvent) => {
    let coords = { x: event.pageX, y: event.pageY };

    let seq = getSequencerFromCoord(coords);
    if (seq) seq.mouseClicked(p, coords);
  };

  // Calculates which sequencer the click affects
  function getSequencerFromCoord(point: IPoint): ISequencer | false {
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

    //p.text("Rows", 1, 50);
    //p.text(rowSlider.value(), 240, 50);
  }

  function setupManipulators() {
    bpmSlider = p.createSlider(60, 960, BPM, 2);
    bpmSlider.position(35, 5);
    bpmSlider.style("width", "400px");

    bpmSlider.mouseReleased((event: MouseEvent) => {
      BPM = bpmSlider.value();
      MILLIS_PER_BEAT = (60 / BPM) * 1000;
      BEAT_PER_SEC = BPM / 60;

      p.frameRate(BEAT_PER_SEC * 10);
      drawInfo = true;

      clearInterval(beatInterval);
      beatInterval = setInterval(step, MILLIS_PER_BEAT);
    });

    resetButton = p.createButton("Reset");
    resetButton.position(5, 30);
    resetButton.mousePressed((event: MouseEvent) => {
      CURRENT_STEP = { x: 0, y: 0 };
      drawFullSeq = true;
      LAST_PRINT = p.millis();

      SEQUENCER_ARR.forEach(seq => {
        seq.reset(p);
      });
    });

    randomizeButton = p.createButton("Randomize");
    randomizeButton.position(70, 30);
    randomizeButton.mousePressed((event: MouseEvent) => {
      SEQUENCER_ARR.forEach(seq => {
        seq.randomize(p);
      });
    });

    inverseButton = p.createButton("Inverse");
    inverseButton.position(170, 30);
    inverseButton.mousePressed((event: MouseEvent) => {
      SEQUENCER_ARR.forEach(seq => {
        seq.inverse(p);
      });
    });
  }

  // Propagates a step in all the sequencers
  function step(): void {
    let newStep = { ...CURRENT_STEP };
    newStep.x++;

    if (newStep.x >= size.x) {
      newStep.x = 0;
      newStep.y = (newStep.y + 1) % size.y;
    }

    // Play all enabled sounds
    //TODO: Calculate delays and adjust for them
    SEQUENCER_ARR.forEach(seq => {
      seq.play(newStep);
    });

    // Then update the view (eliminates delay between plays)
    SEQUENCER_ARR.forEach(seq => {
      seq.draw(p, CURRENT_STEP, newStep, drawFullSeq);
    });

    if(drawFullSeq) drawFullSeq = false;

    CURRENT_STEP = newStep;
  }

  // Handles the drop of the file on the screen
  function fileHandle(file: p5.File) {
    if (file.type == "audio") {
      let curMouseX = p.mouseX;
      let curMouseY = p.mouseY;

      // @ts-ignore: Load Sound does not exist on type p5 (false)
      p.loadSound(file.data, (sound: p5.SoundFile) => {
        let seq = getSequencerFromCoord({ x: curMouseX, y: curMouseY });
        if (seq) {
          seq.setSound(p, file.name, sound);
        }
      });
    }
  }
};

var sketchP = new p5(sketch);

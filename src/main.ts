var sketch = (p: p5) => {
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
  const SOUNDS: { name: string; sound: p5.SoundFile }[] = [];

  const NUM_COLS = 5;
  const NUM_ROWS = 3;

  const SIZE: IPoint = { x: 8, y: 8 }; // Grid size of sequencer
  const X_GAP = 3; // Initial gap from left side of window to first line
  const Y_GAP = 3; // Initial gap from top side of window to first line
  const SQUARE_SIZE = 20; // Side size of individual squares
  const PADDING = 2; // Padding between individual squares
  const SEQUENCER_DIM_SIZE_X = // The amount of room one sequencer takes up on the x axis
    SIZE.x * (SQUARE_SIZE + PADDING) + SQUARE_SIZE + 2 * PADDING;
  const SEQUENCER_DIM_SIZE_Y = // The amount of room one sequencer takes up on the y axis
    SIZE.y * (SQUARE_SIZE + PADDING) + SQUARE_SIZE + 2 * PADDING + 75;

  let SEQUENCER_ARR: Sequencer[] = []; // Stores all the sequencers
  let CURRENT_STEP: IPoint = { x: 0, y: 0 }; //Maintains the current step of all the sequencers
  let inititalDrawDone = false;

  let BPM = 240;
  let MILLIS_PER_BEAT = (1 / (BPM / 60)) * 1000;
  let LAST_PRINT = p.millis();

  // The initial loading of all the default sounds, called before setup
  p.preload = () => {
    DEFAULT_KIT_NAMES.forEach(name => {
      // @ts-ignore: Load Sound does not exist on type p5
      SOUNDS.push({ name: name, sound: p.loadSound(DEFAULT_KIT_PATH + name) });
    });
  };

  // Setup function, called implictly by p5
  p.setup = () => {
    for (let y = 0; y < NUM_ROWS; y++) {
      for (let x = 0; x < NUM_COLS; x++) {
        //Instantiate a new sequencer
        let seq = new Sequencer(
          SIZE.x,
          SIZE.y,
          X_GAP + x * SEQUENCER_DIM_SIZE_X,
          Y_GAP + y * SEQUENCER_DIM_SIZE_Y,
          PADDING,
          SQUARE_SIZE
        );

        seq.setup(p, SOUNDS[SEQUENCER_ARR.length]);
        SEQUENCER_ARR.push(seq);
      }
    }

    p.createCanvas(p.windowWidth, p.windowHeight).drop(fileHandle);
    p.frameRate(BPM * 2); //Aim for 2x BPM
  };

  // On window resize - resize canvas and redraw
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    inititalDrawDone = false;
  };

  // Called hopefully BPM * 2 times per second
  p.draw = () => {
    // Makes sure the sequencers are fully drawn once, rest of the draws are simply small updates
    if (!inititalDrawDone) {
      inititalDrawDone = true;

      SEQUENCER_ARR.forEach(seq => {
        seq.initialDraw(p);
      });
    }

    handleBeat();
  };

  // Handles the mouse click events
  p.mouseClicked = (coords: IPoint) => {
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

  // Calls a step on an approximate BPM
  function handleBeat(): void {
    let curMillis = p.millis();
    let timeElapsed = curMillis - LAST_PRINT;

    if (timeElapsed > MILLIS_PER_BEAT) {
      step();
      LAST_PRINT = curMillis;
    }
  }

  // Propagates a step in all the sequencers
  function step(): void {
    let newStep = { ...CURRENT_STEP };
    newStep.x++;

    if (newStep.x >= SIZE.x) {
      newStep.x = 0;
      newStep.y = (newStep.y + 1) % SIZE.y;
    }

    // Play all enabled sounds
    //TODO: Calculate delays and adjust for them
    SEQUENCER_ARR.forEach(seq => {
      seq.play(newStep);
    });

    // Then update the view (eliminates delay between plays)
    SEQUENCER_ARR.forEach(seq => {
      seq.draw(p, CURRENT_STEP, newStep);
    });

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

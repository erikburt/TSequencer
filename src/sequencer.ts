interface ISequencer {
  size: IPoint;
  align: IPoint;
  squareSize: number;
  padding: number;

  loudnessSlider: p5.Element;
  panSlider: p5.Element;

  filename: string;
  sound: p5.SoundFile;
  matrix: boolean[][] | number[][];

  setup(p: p5, { name, sound }: { name: string; sound: p5.SoundFile }): void;
  setSound(p: p5, name: string, sound: p5.SoundFile): void;
  play(grid: IPoint): void;
  toggle(grid: IPoint): void;
  initialDraw(p: p5): void;
  draw(p: p5, oldStep: IPoint, newStep: IPoint, fullDraw: boolean): void;
  drawSquare(p: p5, point: IPoint, fill: number): void;
  mouseClicked(p: p5, click: IPoint): void;
}

interface IPoint {
  x: number;
  y: number;
}

class Sequencer implements ISequencer {
  size: IPoint;
  align: IPoint;
  padding = 2;
  squareSize = 10;

  matrix: boolean[][];
  sound: p5.SoundFile = null;
  filename: string;

  loudnessSlider: p5.Element;
  panSlider: p5.Element;

  constructor(
    xGridSize: number = 8,
    yGridSize: number = 8,
    xAlign: number = 3,
    yAlign: number = 3,
    padding: number = 2,
    squareSize: number = 10
  ) {
    this.size = { x: xGridSize, y: yGridSize };
    this.align = { x: xAlign, y: yAlign };
    this.padding = padding;
    this.squareSize = squareSize;

    // Creates the 2d array of booleans
    let activated = [];
    for (let y = 0; y < this.size.y; y++) {
      activated.push(Array(this.size.x).fill(false));
    }
    this.matrix = activated;
    this.sound = null;
  }

  // Initial setup function, called from sketch.ts setup. Sets up sliders and the default sounds
  setup(p: p5, { name, sound }: { name: string; sound: p5.SoundFile }): void {
    this.setupSliders(p);
    this.setSound(p, name, sound);
  }

  // Sets the sound for the sequencer and updates the drawn name
  setSound(p: p5, name: string, sound: p5.SoundFile): void {
    this.filename = name;
    this.sound = sound;

    this.drawFilename(p);
  }

  //Draws the full grid initially
  initialDraw(p: p5) {
    p.strokeWeight(1);
    p.stroke(1);

    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        let fill = 255;

        if (this.matrix[y][x]) fill = 100;

        this.drawSquare(p, { x: x, y: y }, fill);
      }
    }

    this.drawFilename(p);
  }

  // Draws the two squares that need to be updated
  draw(p: p5, oldStep: IPoint, newStep: IPoint, fullDraw: boolean) {
    p.strokeWeight(1);
    p.stroke(1);

    if (fullDraw) {
      for (let y = 0; y < this.size.y; y++) {
        for (let x = 0; x < this.size.x; x++) {
          let fill = 255;
  
          if (this.matrix[y][x]) fill = 100;
  
          this.drawSquare(p, { x: x, y: y }, fill);
        }
      }
  
      this.drawFilename(p);
    }

    this.drawSquare(p, newStep, 0);
    this.drawSquare(p, oldStep, this.matrix[oldStep.y][oldStep.x] ? 100 : 255);
  }

  // Draws a square at the selected grid point. Fill must be set before calling
  drawSquare(p: p5, point: IPoint, fill: number) {
    p.fill(fill);
    let { x, y } = point;

    let topLeftY = this.align.y + y * this.squareSize + y * this.padding;
    let topLeftX = this.align.x + x * this.squareSize + x * this.padding;
    p.rect(topLeftX, topLeftY, this.squareSize, this.squareSize);
  }

  // Draws the current filename under the sequencer
  drawFilename(p: p5): void {
    let x = this.align.x;
    let y = this.align.y + this.size.y * (this.squareSize + this.padding);

    //Draw over the previous just in case it exists
    p.strokeWeight(0);
    p.fill(255);
    p.rect(
      x,
      y,
      this.size.y * (this.squareSize + 2 * this.padding),
      this.squareSize
    );

    //Draw name
    p.fill(0);
    p.textSize(12);
    p.text(
      this.filename,
      this.align.x,
      this.align.y + this.size.y * (this.squareSize + 2 * this.padding)
    );
  }

  // Called by sketch.ts if the click was within the bounds of the sequencer
  mouseClicked(p: p5, click: IPoint): void {
    let grid = this.calculateGridPosition(click);

    if (
      grid.x <= -1 ||
      grid.x >= this.size.x ||
      grid.y <= -1 ||
      grid.y >= this.size.y
    ) {
      return;
    }

    this.drawSquare(p, grid, this.toggle(grid) ? 100 : 255);
  }

  // Calculates the box which was clicked given canvas coordinates
  calculateGridPosition(click: IPoint): IPoint {
    let selectedX = Math.floor(
      (click.x - this.align.x) / (this.squareSize + this.padding)
    );
    let selectedY = Math.floor(
      (click.y - this.align.y) / (this.squareSize + this.padding)
    );

    return { x: selectedX, y: selectedY };
  }

  // Togggles a canvas coordinate
  toggle(grid: IPoint): boolean {
    let { x, y } = grid;

    if (this.matrix[y][x]) {
      return (this.matrix[y][x] = false);
    }

    return (this.matrix[y][x] = true);
  }

  // Plays the associated sound if enabled and sound exists
  play(grid: IPoint): void {
    if (this.matrix[grid.y][grid.x] && this.sound != null) this.sound.play();
  }

  // Resets all the matrix
  reset(p: p5): void {
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        this.matrix[y][x] = false;
        this.drawSquare(p, { x, y }, 255);
      }
    }
  }

  randomize(p: p5): void {
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        if (Math.random() < 0.3) {
          this.matrix[y][x] = true;
          this.drawSquare(p, { x, y }, 100);
        } else {
          this.matrix[y][x] = false;
          this.drawSquare(p, { x, y }, 255);
        }
      }
    }
  }

  inverse(p: p5): void {
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        this.drawSquare(p, { x, y }, this.toggle({ x, y }) ? 100 : 255);
      }
    }
  }

  // Initializes sliders and event handlers
  setupSliders(p: p5): void {
    let sliderWidth = this.size.x * (this.squareSize - this.padding);

    if (this.loudnessSlider == null) {
      this.loudnessSlider = p.createSlider(0, 2, 1, 0.1);
      this.loudnessSlider.position(
        this.align.x,
        5 + this.align.y + this.size.y * (this.squareSize + 2 * this.padding)
      );
      this.loudnessSlider.style("width", "" + sliderWidth);

      this.loudnessSlider.mouseReleased(event => {
        console.log("setting volume");

        // @ts-ignore: Slider value may not be a number (false)
        this.sound.setVolume(this.loudnessSlider.value(), 0, 0);
      });
    }

    if (this.panSlider == null) {
      this.panSlider = p.createSlider(-1, 1, 0, 0.1);
      this.panSlider.position(
        this.align.x,
        25 + this.align.y + this.size.y * (this.squareSize + 2 * this.padding)
      );
      this.panSlider.style("width", "" + sliderWidth);

      this.panSlider.mouseReleased(event => {
        console.log("setting pan");

        // @ts-ignore: Slider value may not be a number (false)
        this.sound.pan(this.panSlider.value(), 0);
      });
    }
  }
}

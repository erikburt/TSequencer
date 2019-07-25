class AudioBufferWrapper {
  audioContext: AudioContext;
  filename: string;
  buffer: AudioBuffer | null = null;
  gainNode: GainNode;
  panNode: StereoPannerNode;

  constructor(audioContext: AudioContext, audioUrl: string) {
    this.audioContext = audioContext;
    this.filename = audioUrl.split("/").slice(-1)[0];

    this.gainNode = audioContext.createGain();
    this.panNode = audioContext.createStereoPanner();

    this.panNode.connect(this.gainNode);
    this.gainNode.connect(audioContext.destination);

    this.loadSound(audioUrl);
  }

  loadSound(audioUrl: string): void {
    let request = new XMLHttpRequest();
    request.open("GET", audioUrl, true);
    request.responseType = "arraybuffer";

    request.onload = async () => {
      let audio = request.response;

      try {
        this.buffer = await this.audioContext.decodeAudioData(audio);
      } catch (e) {
        console.error(
          `Error with decoding audio from ${audioUrl}, ${e.message}`
        );
      }
    };

    request.send();
  }

  play(volume: number, pan: number): void {
    if (this.buffer == null)
      console.error(`Buffer is null for ${this.filename}`);

    this.gainNode.gain.value = volume / 100;
    this.panNode.pan.value = pan;

    //TODO: Prepare a source node for play after one is played for the next iteration. To reduce latency when playing
    let source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.panNode);
    source.start(0);
  }
}

export default AudioBufferWrapper;

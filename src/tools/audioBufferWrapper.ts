class AudioBufferWrapper {
  audioContext: AudioContext;
  filename: string;
  buffer: AudioBuffer | null = null;

  constructor(audioContext: AudioContext, audioUrl: string) {
    this.audioContext = audioContext;
    this.filename = audioUrl.split("/").slice(-1)[0];

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

  play(): void {
    if (this.buffer == null)
      console.error(`Buffer is null for ${this.filename}`);

    //TODO: Prepare a source node for play after one is played for the next iteration. To reduce latency when playing
    let source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }
}

export default AudioBufferWrapper;

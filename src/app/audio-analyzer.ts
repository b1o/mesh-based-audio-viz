export class AudioAnalyzer {

  public readonly FFT_SIZE = 2048;

  public audio;
  public audioCtx: AudioContext;
  public analyzer: AnalyserNode;
  public source: MediaStreamAudioSourceNode;

  public dataArray: Uint8Array;

  constructor(stream) {
    window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];

    console.log(stream);

    this.audioCtx = new AudioContext();
    this.analyzer = this.audioCtx.createAnalyser();
    this.analyzer.fftSize = this.FFT_SIZE;
    this.analyzer.smoothingTimeConstant = 0;
    this.source = this.audioCtx.createMediaElementSource(stream);
    this.source.connect(this.analyzer);
    this.analyzer.connect(this.audioCtx.destination);
    this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);

    this.analyzer.maxDecibels = 128;

    this.audio = stream;
  }

  public setSmoothing(value) {
    this.analyzer.smoothingTimeConstant = value;
  }

  public analyze() {
    this.analyzer.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }

}

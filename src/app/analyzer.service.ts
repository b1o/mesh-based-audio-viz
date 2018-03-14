import { Injectable } from '@angular/core';
import { AudioAnalyser } from 'three';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AnalyzerService {
  public audioElement: HTMLAudioElement;

  public readonly FFT_SIZE = 1024;

  private dataArray: Uint8Array = new Uint8Array().fill(0);
  private audioCtx: AudioContext;
  private analyzer: AnalyserNode;
  private source: MediaStreamAudioSourceNode;
  private analyzerInterval;

  private hasAudio = false;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.volume = 0.1;

    this.audioCtx = new AudioContext();
    this.analyzer = this.audioCtx.createAnalyser();
    this.analyzer.fftSize = this.FFT_SIZE;
    this.source = this.audioCtx.createMediaElementSource(this.audioElement);

    this.source.connect(this.analyzer);
    this.analyzer.connect(this.audioCtx.destination);
    this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
  }

  public setFile(src) {
    this.hasAudio = true;
    this.audioElement.src = src;
  }

  public play() {
    this.audioElement.play();
  }

  public changeVolume(value) {
    if (value < 0 || value > 1) {
      throw new Error('volume must be between 0 and 1');
    }

    this.audioElement.volume = value;
  }

  getAnalyzerData() {
    this.analyzer.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  public stop() {
    this.audioElement.pause();
  }
}

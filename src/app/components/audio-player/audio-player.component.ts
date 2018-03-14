import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  OnChanges,
  ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AudioAnalyzer } from '../../audio-analyzer';
import { Drawer } from '../../drawer';
import { AnalyzerService } from '../../analyzer.service';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit, OnChanges {
  @Input() file;


  public currentVolume = 0.1;

  public proccessing = false;
  public fileSrc;

  private animation;

  constructor(private cd: ChangeDetectorRef, private sanitizer: DomSanitizer, private analyzerService: AnalyzerService) {}

  ngOnInit() {
    // this.loadFile(this.file);

  }

  ngOnChanges() {
    if (this.file) {
      this.loadFile(this.file);
    }
  }

  onVolumeChange(value) {
    this.analyzerService.changeVolume(value);
  }

  public play() {
    this.analyzerService.play();
  }

  public stop() {
    this.analyzerService.stop();
  }

  loadFile(file) {
    this.proccessing = true;
    const reader = new FileReader();

    reader.onload = (event: any) => {
    this.proccessing = false;
      this.analyzerService.setFile(event.target.result);
    };
    reader.readAsDataURL(file);
  }
}

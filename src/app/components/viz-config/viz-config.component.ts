import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';

@Component({
  selector: 'app-viz-config',
  templateUrl: './viz-config.component.html',
  styleUrls: ['./viz-config.component.css']
})
export class VizConfigComponent implements OnInit, OnChanges {


  @Input() configs;
  @Output() configChanged = new EventEmitter();

  public keyValues = [];

  constructor() { }

  onConfigChange() {
    this.configChanged.emit(this.configs);
  }

  ngOnChanges() {
    this.parseConfigs()
  }

  parseConfigs(): any {
    this.keyValues = [];
    Object.keys(this.configs).forEach(key => {
      if(this.configs[key].canChange) {
        this.keyValues.push({key, value: this.configs[key]});
      }
    })
  }

  ngOnInit() {
    this.parseConfigs()
    console.log('configs')

  }

}

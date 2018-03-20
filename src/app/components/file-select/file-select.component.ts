import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-select',
  templateUrl: './file-select.component.html',
  styleUrls: ['./file-select.component.css']
})
export class FileSelectComponent implements OnInit {

  @Output() file = new EventEmitter();

  soundCloudSrc;

  constructor() { }

  ngOnInit() {
  }

  newFile(file) {
    this.file.emit(file);
    console.log(file);
  }
}

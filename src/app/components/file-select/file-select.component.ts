import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-select',
  templateUrl: './file-select.component.html',
  styleUrls: ['./file-select.component.css']
})
export class FileSelectComponent implements OnInit {

  @Output() file = new EventEmitter();

  public songs = [{
    name: 'Arctic Monkeys - Do I Wanna Know- (Official Video).mp3',
    link: '/assets/Arctic Monkeys - Do I Wanna Know- (Official Video).mp3'
  },
  {
    name: 'Ariana Grande - Into You.mp3',
    link: '/assets/Ariana Grande - Into You.mp3'
  },
  {
    name: 'Bastille - Pompeii.mp3',
    link: '/assets/Bastille - Pompeii.mp3'
  },
  {
    name: 'Daft Punk - Get Lucky (Official Audio) ft. Pharrell Williams.mp3',
    link: '/assets/Daft Punk - Get Lucky (Official Audio) ft. Pharrell Williams.mp3'
  },
  {
    name: 'Don\'t You Worry Child (Live).mp3',
    link: '/assets/Don\'t You Worry Child (Live).mp3'
  },
  {
    name: 'Galantis - Runaway (U & I) (Official Video).mp3',
    link: '/assets/Galantis - Runaway (U & I) (Official Video).mp3'
  },
  {
    name: 'Krewella - Surrender The Throne.mp3',
    link: '/assets/Krewella - Surrender The Throne.mp3'
  },
  {
    name: 'Maduk ft Veela - Ghost Assasin (Hourglass Bonusmix).mp3',
    link: '/assets/Maduk ft Veela - Ghost Assasin (Hourglass Bonusmix).mp3'
  },
  {
    name: 'Major Lazer - Be Together (feat. Wild Belle) (Vanic Remix).mp3',
    link: '/assets/Major Lazer - Be Together (feat. Wild Belle) (Vanic Remix).mp3'
  },
  {
    name: 'Major Lazer – Light it Up (feat. Nyla & Fuse ODG) [Remix] by Method Studios.mp3',
    link: '/assets/Major Lazer – Light it Up (feat. Nyla & Fuse ODG) [Remix] by Method Studios.mp3'
  },
  {
    name: 'Meiko - Leave The Lights On (Krot Remix).mp3',
    link: '/assets/Meiko - Leave The Lights On (Krot Remix).mp3'
  },
  {
    name: 'OneRepublic - Counting Stars.mp3',
    link: '/assets/OneRepublic - Counting Stars.mp3'
  },
  {
    name: 'Skrillex & Rick Ross - Purple Lamborghini [Official Video].mp3',
    link: '/assets/Skrillex & Rick Ross - Purple Lamborghini [Official Video].mp3'
  },
  {
    name: 'The Weeknd - Starboy ft. Daft Punk.mp3',
    link: '/assets/The Weeknd - Starboy ft. Daft Punk.mp3'
  },
  {
    name: 'The XX - Intro [long version].mp3',
    link: '/assets/The XX - Intro [long version].mp3'
  },
  {
    name: 'TheFatRat - Monody (feat. Laura Brehm).mp3',
    link: '/assets/TheFatRat - Monody (feat. Laura Brehm).mp3'
  },
  {
    name: 'twenty one pilots- Heathens (from Suicide Squad- The Album) [OFFICIAL VIDEO].mp3',
    link: '/assets/twenty one pilots- Heathens (from Suicide Squad- The Album) [OFFICIAL VIDEO].mp3'
  },
  {
    name: 'twenty one pilots- Stressed Out [OFFICIAL VIDEO].mp3',
    link: '/assets/twenty one pilots- Stressed Out [OFFICIAL VIDEO].mp3'
  },
  {
    name: '[DnB] - Tristam & Braken - Frame of Mind [Monstercat Release].mp3',
    link: '/assets/[DnB] - Tristam & Braken - Frame of Mind [Monstercat Release].mp3'
  }]

  soundCloudSrc;
  public src;
  constructor() { }

  ngOnInit() {
  }

  newFile() {
    // this.file.emit(file);
    this.file.emit(this.src);
    console.log(this.src);
  }
}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { FileSelectComponent } from './components/file-select/file-select.component';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { SceneComponent } from './components/scene/scene.component';
import { AnalyzerService } from './analyzer.service';
import { VizConfigComponent } from './components/viz-config/viz-config.component';


@NgModule({
  declarations: [
    AppComponent,
    FileSelectComponent,
    AudioPlayerComponent,
    SceneComponent,
    VizConfigComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [AnalyzerService],
  bootstrap: [AppComponent]
})
export class AppModule { }

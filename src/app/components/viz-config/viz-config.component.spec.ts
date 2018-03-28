import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VizConfigComponent } from './viz-config.component';

describe('VizConfigComponent', () => {
  let component: VizConfigComponent;
  let fixture: ComponentFixture<VizConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VizConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VizConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

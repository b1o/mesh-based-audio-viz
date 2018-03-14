import { TestBed, inject } from '@angular/core/testing';

import { AnalyzerServiceService } from './analyzer-service.service';

describe('AnalyzerServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyzerServiceService]
    });
  });

  it('should be created', inject([AnalyzerServiceService], (service: AnalyzerServiceService) => {
    expect(service).toBeTruthy();
  }));
});

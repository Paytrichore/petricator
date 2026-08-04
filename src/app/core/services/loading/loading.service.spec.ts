import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should start in non-loading state', () => {
    expect(service.isLoading()).toBeFalse();
  });

  it('should set loading to true when show is called', () => {
    service.show();

    expect(service.isLoading()).toBeTrue();
  });

  it('should keep loading true until all requests are hidden', () => {
    service.show();
    service.show();

    service.hide();
    expect(service.isLoading()).toBeTrue();

    service.hide();
    expect(service.isLoading()).toBeTrue();
  });

  it('should stay visible for at least one second', fakeAsync(() => {
    service.show();
    service.hide();

    tick(999);
    expect(service.isLoading()).toBeTrue();

    tick(1);
    expect(service.isLoading()).toBeFalse();
  }));

  it('should hide immediately after one second has already elapsed', fakeAsync(() => {
    service.show();

    tick(1001);
    service.hide();

    expect(service.isLoading()).toBeFalse();
  }));

  it('should not go below zero when hide is called too many times', () => {
    service.hide();

    expect(service.isLoading()).toBeFalse();
  });
});

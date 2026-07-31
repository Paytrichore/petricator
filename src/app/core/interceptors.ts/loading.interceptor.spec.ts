import { HttpContext, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LoadingInterceptor, SKIP_GLOBAL_LOADER } from './loading.interceptor';
import { LoadingService } from '../services/loading/loading.service';

describe('LoadingInterceptor', () => {
  let loadingService: LoadingService;
  const routerStub = { url: '/' };

  beforeEach(() => {
    routerStub.url = '/';
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerStub },
      ],
    });
    loadingService = TestBed.inject(LoadingService);
    loadingService.reset();
  });

  it('should toggle loading around request lifecycle', fakeAsync(() => {
    const events$ = new Subject<HttpResponse<unknown>>();
    const request = new HttpRequest('GET', '/test');
    const next: HttpHandlerFn = () => events$.asObservable();

    TestBed.runInInjectionContext(() => {
      LoadingInterceptor(request, next).subscribe();
    });

    expect(loadingService.isLoading()).toBeTrue();

    events$.next(new HttpResponse({ status: 200 }));
    events$.complete();

    expect(loadingService.isLoading()).toBeTrue();

    tick(1000);
    expect(loadingService.isLoading()).toBeFalse();
  }));

  it('should skip loader when request opts out', () => {
    const request = new HttpRequest('GET', '/test', {
      context: new HttpContext().set(SKIP_GLOBAL_LOADER, true),
    });

    const next: HttpHandlerFn = () => new Subject<HttpResponse<unknown>>().asObservable();

    TestBed.runInInjectionContext(() => {
      LoadingInterceptor(request, next).subscribe();
    });

    expect(loadingService.isLoading()).toBeFalse();
  });

  it('should skip loader on login route', () => {
    routerStub.url = '/login';

    const request = new HttpRequest('POST', '/api/login', null);
    const next: HttpHandlerFn = () => new Subject<HttpResponse<unknown>>().asObservable();

    TestBed.runInInjectionContext(() => {
      LoadingInterceptor(request, next).subscribe();
    });

    expect(loadingService.isLoading()).toBeFalse();
  });

  it('should skip loader on signup route', () => {
    routerStub.url = '/signup';

    const request = new HttpRequest('POST', '/api/signup', null);
    const next: HttpHandlerFn = () => new Subject<HttpResponse<unknown>>().asObservable();

    TestBed.runInInjectionContext(() => {
      LoadingInterceptor(request, next).subscribe();
    });

    expect(loadingService.isLoading()).toBeFalse();
  });
});

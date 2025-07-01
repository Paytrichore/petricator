import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    injector = TestBed.inject(EnvironmentInjector);
  });

  it('should return true if authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const result = runInInjectionContext(injector, () => authGuard({} as any, {} as any));
    expect(result).toBeTrue();
    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to /login and return false if not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const result = runInInjectionContext(injector, () => authGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
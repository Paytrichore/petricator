import { TestBed } from '@angular/core/testing';
import { AuthService, mapUserFromApi } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('AuthService', () => {
  let service: AuthService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;
  let storeSpy: jasmine.SpyObj<Store<any>>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['post']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Store, useValue: storeSpy },
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch login action with credentials', () => {
    const email = 'a@a.com';
    const password = 'pass';
    service.login(email, password);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Auth] Login attempt',
      email,
      password
    }));
  });

  it('should dispatch signup action with credentials', () => {
    const username = 'user';
    const email = 'a@a.com';
    const password = 'pass';
    service.signup(username, email, password);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Auth] Signup attempt',
      username,
      email,
      password
    }));
  });

  it('should return true if access_token exists', () => {
    spyOn(localStorage, 'getItem').and.returnValue('token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false if access_token does not exist', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should remove token and user and navigate on logout', () => {
    spyOn(localStorage, 'removeItem');
    service.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should map user and exclude password and __v', () => {
    const apiUser = {
      _id: '1',
      username: 'bob',
      email: 'bob@bob.com',
      password: 'secret',
      __v: 42,
      extra: 'ok'
    };
    const mapped = mapUserFromApi(apiUser);
    expect(mapped).toEqual(jasmine.objectContaining({ _id: '1', username: 'bob', email: 'bob@bob.com', extra: 'ok' }));
    expect('password' in mapped).toBeFalse();
    expect('__v' in mapped).toBeFalse();
  });
});
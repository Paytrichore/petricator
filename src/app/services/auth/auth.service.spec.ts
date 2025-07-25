import { TestBed } from '@angular/core/testing';
import { AuthService, mapUserFromApi } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Store } from '@ngrx/store';

describe('AuthService', () => {
  let service: AuthService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;
  let storeSpy: jasmine.SpyObj<Store<any>>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
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

  it('should call /users/me and handle success in checkUserStatusOnRefresh', () => {
    spyOn(localStorage, 'getItem').and.returnValue('token');
    const userData = { _id: '1', username: 'bob', email: 'bob@bob.com' };
    httpSpy.get = jasmine.createSpy().and.returnValue(of(userData));
    spyOn(service, 'hasValidToken').and.returnValue(true);

    service.checkUserStatusOnRefresh();

    expect(httpSpy.get).toHaveBeenCalledWith(jasmine.stringMatching('/users/me'));
    // Ajoute ici tes attentes sur le traitement du userData si tu en as
  });

  it('should call /users/me and handle error in checkUserStatusOnRefresh', () => {
    spyOn(localStorage, 'getItem').and.returnValue('token');
    httpSpy.get = jasmine.createSpy().and.returnValue(throwError(() => new Error('401')));
    spyOn(service, 'hasValidToken').and.returnValue(true);
    spyOn(console, 'error');

    service.checkUserStatusOnRefresh();

    expect(httpSpy.get).toHaveBeenCalledWith(jasmine.stringMatching('/users/me'));
    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la vérification du statut utilisateur:',
      jasmine.any(Error)
    );
  });

  it('should not call /users/me if token is not valid in checkUserStatusOnRefresh', () => {
    spyOn(service, 'hasValidToken').and.returnValue(false);
    service.checkUserStatusOnRefresh();
    expect(httpSpy.get).not.toHaveBeenCalled();
  });

  it('should return false if no token in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(service.hasValidToken()).toBeFalse();
  });

  it('should return false if token is not a valid JWT', () => {
    spyOn(localStorage, 'getItem').and.returnValue('invalid.token');
    expect(service.hasValidToken()).toBeFalse();
  });

  it('should return false if token is expired', () => {
    // exp in the past
    const payload = { exp: Math.floor(Date.now() / 1000) - 1000 };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    spyOn(localStorage, 'getItem').and.returnValue(token);
    expect(service.hasValidToken()).toBeFalse();
  });

  it('should return true if token is valid and not expired', () => {
    // exp in the future
    const payload = { exp: Math.floor(Date.now() / 1000) + 1000 };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    spyOn(localStorage, 'getItem').and.returnValue(token);
    expect(service.hasValidToken()).toBeTrue();
  });

  it('should log error and call logout if status is 401 in checkUserStatusOnRefresh', () => {
  spyOn(service, 'hasValidToken').and.returnValue(true);
  spyOn(service, 'logout');
  spyOn(console, 'error');
  const errorObj = { status: 401, message: 'Unauthorized' };
  httpSpy.get.and.returnValue(throwError(() => errorObj));

  service.checkUserStatusOnRefresh();

  expect(console.error).toHaveBeenCalledWith(
    'Erreur lors de la vérification du statut utilisateur:',
      errorObj
    );
    expect(service.logout).toHaveBeenCalled();
  });

it('should call /users/use-points with points in useActionPoints', () => {
  httpSpy.post.and.returnValue(of({ success: true }));
  const points = 5;
  service.useActionPoints(points).subscribe(result => {
    expect(httpSpy.post).toHaveBeenCalledWith(
      jasmine.stringMatching('/users/use-points'),
      { points }
    );
    expect(result).toEqual({ success: true });
  });
});

  it('should call /users/draft with empty body in makeDraft', () => {
    httpSpy.post.and.returnValue(of({ draft: true }));
    service.makeDraft().subscribe(result => {
      expect(httpSpy.post).toHaveBeenCalledWith(
        jasmine.stringMatching('/users/draft'),
        {}
      );
      expect(result).toEqual({ draft: true });
    });
  });

  it('should call checkUserStatusOnRefresh in refreshUserStatus', () => {
    spyOn(service, 'checkUserStatusOnRefresh');
    service.refreshUserStatus();
    expect(service.checkUserStatusOnRefresh).toHaveBeenCalled();
  });
});
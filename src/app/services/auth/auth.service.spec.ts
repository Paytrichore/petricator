import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
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
        { provide: Store, useValue: storeSpy }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call http.post and set token and user on login', (done) => {
    spyOn(localStorage, 'setItem');
    const response = { access_token: 'token', user: { id: 1 } };
    httpSpy.post.and.returnValue(of(response));
    service.login('a@a.com', 'pass').subscribe(res => {
      expect(res).toEqual(response);
      expect(httpSpy.post).toHaveBeenCalledWith(
        jasmine.any(String),
        { email: 'a@a.com', password: 'pass' }
      );
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(response.user));
      done();
    });
  });

  it('should call http.post and set token and user on signup', (done) => {
    spyOn(localStorage, 'setItem');
    const response = { access_token: 'token', user: { id: 1 } };
    httpSpy.post.and.returnValue(of(response));
    service.signup('user', 'a@a.com', 'pass').subscribe(res => {
      expect(res).toEqual(response);
      expect(httpSpy.post).toHaveBeenCalledWith(
        jasmine.any(String),
        { username: 'user', email: 'a@a.com', password: 'pass' }
      );
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(response.user));
      done();
    });
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
});
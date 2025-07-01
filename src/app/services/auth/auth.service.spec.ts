import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['post']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call http.post and set token on login', (done) => {
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
      done();
    });
  });

  it('should call http.post and set token on signup', (done) => {
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

  it('should remove token and navigate on logout', () => {
    spyOn(localStorage, 'removeItem');
    service.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
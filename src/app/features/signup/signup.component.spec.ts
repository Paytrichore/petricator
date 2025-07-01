import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signup']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.loginForm.setValue({ username: '', email: '', password: '' });
    component.onSubmit();
    expect(authServiceSpy.signup).not.toHaveBeenCalled();
  });

  it('should call authService.signup and navigate on success', () => {
    component.loginForm.setValue({ username: 'user', email: 'test@test.com', password: '123456' });
    authServiceSpy.signup.and.returnValue(of({ access_token: 'token', user: { id: 1 } }));
    component.onSubmit();
    expect(authServiceSpy.signup).toHaveBeenCalledWith('user', 'test@test.com', '123456');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set error message on signup error', () => {
    component.loginForm.setValue({ username: 'user', email: 'test@test.com', password: '123456' });
    const errorResponse = { error: { message: 'Erreur' } };
    authServiceSpy.signup.and.returnValue(throwError(() => errorResponse));
    component.onSubmit();
    expect(component.error).toBe('Erreur');
  });

  it('should set default error message if error has no message', () => {
    component.loginForm.setValue({ username: 'user', email: 'test@test.com', password: '123456' });
    authServiceSpy.signup.and.returnValue(throwError(() => ({})));
    component.onSubmit();
    expect(component.error).toBe("Erreur lors de l'inscription");
  });
});
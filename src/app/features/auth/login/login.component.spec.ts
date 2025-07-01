import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Mock BasicInputComponent
@Component({
  selector: 'app-basic-input',
  template: '<input>',
  standalone: true
})
class MockBasicInputComponent {
  @Input() control: any;
  @Input() label: string = '';
  @Input() type: string = 'text';
}

// Mock ToFormControlPipe
@Pipe({ name: 'toFormControl', standalone: true })
class MockToFormControlPipe implements PipeTransform {
  transform(value: any): FormControl {
    return value;
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    TestBed.configureTestingModule({
      imports: [
    LoginComponent,
    ReactiveFormsModule,
    MockBasicInputComponent,
    MockToFormControlPipe,
    NoopAnimationsModule,
    HttpClientTestingModule
  ],
  providers: [
    FormBuilder,
    { provide: AuthService, useValue: authServiceSpy },
    { provide: ActivatedRoute, useValue: {} },
    provideRouter([])
  ]
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with email and password controls', () => {
    expect(component.loginForm.contains('email')).toBeTrue();
    expect(component.loginForm.contains('password')).toBeTrue();
  });

  it('should not submit if form is invalid and should mark all as touched', () => {
    spyOn(component.loginForm, 'markAllAsTouched');
    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call authService.login and navigate on success', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    authServiceSpy.login.and.returnValue(of({ access_token: 'fake-token', user: { id: 1, email: 'test@test.com' } }));
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@test.com', '123456');
  });

  it('should set error message on login error', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    const errorResponse = { error: { message: 'Erreur' } };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));
    component.onSubmit();
    expect(component.error).toBe('Erreur');
  });

  it('should set default error message if error has no message', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    authServiceSpy.login.and.returnValue(throwError(() => ({})));
    component.onSubmit();
    expect(component.error).toBe('Erreur lors de la connexion');
  });

  it('should log form value on change', () => {
    spyOn(console, 'log');
    component.loginForm.setValue({ email: 'a@a.com', password: 'abcdef' });
    component.onChange();
    expect(console.log).toHaveBeenCalledWith('Form changed:', { email: 'a@a.com', password: 'abcdef' });
  });
});
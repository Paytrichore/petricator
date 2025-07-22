import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from '../../../services/message/message.service';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';
import { Actions } from '@ngrx/effects';
import { loginSuccess, loginFailure } from '../../../core/stores/user/user.actions';
import { userMock } from '../../../tests/mocks/user.mock';

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
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let actions$: Subject<any>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['openSnackBar']);
    actions$ = new Subject();

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
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ActivatedRoute, useValue: {} },
        provideRouter([]),
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: Actions, useValue: actions$ }
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

  it('should call authService.login with form values', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@test.com', '123456');
  });

  it('should navigate on loginSuccess action', fakeAsync(() => {
    const routerSpy = spyOn(component['router'], 'navigate');
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();
    component.loading = true;
    actions$.next(loginSuccess({ user: userMock, access_token: 'token' }));
    tick(1000);
    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/']);
    expect(component.loading).toBeFalse();
  }));

  it('should set error message on loginFailure action', fakeAsync(() => {
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();
    component.loading = true;
    actions$.next(loginFailure({ error: { error: { code: 'DEFAULT' } } }));
    tick(1000);
    fixture.detectChanges();
    expect(component.error).toBe('Erreur');
    expect(component.loading).toBeFalse();
  }));
});
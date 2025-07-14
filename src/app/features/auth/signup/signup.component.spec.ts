import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { MessageService } from '../../../services/message/message.service';
import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';
import { Actions } from '@ngrx/effects';
import { signupSuccess, signupFailure } from '../../../core/stores/user/user.actions';

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

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let actions$: Subject<any>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signup']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['openSnackBar']);
    actions$ = new Subject();

    await TestBed.configureTestingModule({
      imports: [
        SignupComponent,
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
        { provide: MessageService, useValue: messageServiceSpy },
        provideRouter([]),
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: Actions, useValue: actions$ }
      ]
    });

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.signupForm.setValue({ username: '', email: '', password: '', confirmPassword: '' });
    component.onSubmit();
    expect(authServiceSpy.signup).not.toHaveBeenCalled();
  });

  it('should call authService.signup with form values', () => {
    component.signupForm.setValue({
      username: 'user123',
      email: 'test@test.com',
      password: 'Abcdef1!',
      confirmPassword: 'Abcdef1!'
    });
    expect(component.signupForm.valid).toBeTrue();
    component.onSubmit();
    expect(authServiceSpy.signup).toHaveBeenCalledWith('user123', 'test@test.com', 'Abcdef1!');
  });

  it('should navigate on signupSuccess action', fakeAsync(() => {
    const routerSpy = spyOn(component['router'], 'navigate');
    component.signupForm.setValue({
      username: 'user123',
      email: 'test@test.com',
      password: 'Abcdef1!',
      confirmPassword: 'Abcdef1!'
    });
    component.onSubmit();
    component.loading = true;
    actions$.next(signupSuccess({ user: { _id: '1', username: 'user123', email: 'test@test.com' }, access_token: 'token' }));
    tick(1000);
    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/']);
    expect(component.loading).toBeFalse();
  }));

  it('should set error message on signupFailure action', fakeAsync(() => {
    component.signupForm.setValue({
      username: 'user123',
      email: 'test@test.com',
      password: 'Abcdef1!',
      confirmPassword: 'Abcdef1!'
    });
    component.onSubmit();
    component.loading = true;
    actions$.next(signupFailure({ error: { error: { code: 'DEFAULT' } } }));
    tick(1000);
    fixture.detectChanges();
    expect(component.error).toBe('Erreur');
    expect(component.loading).toBeFalse();
  }));

  it('should return error class if password checker fails for a type', () => {
    const control = component.signupForm.get('password');
    // Mot de passe qui ne contient pas de majuscule
    control?.setValue('abcdef1!');
    fixture.detectChanges();
    // uppercase doit échouer, les autres doivent passer
    expect(component.getPasswordCheckerClass('uppercase')).toBe('signup__checker-item--error');
    expect(component.getPasswordCheckerClass('minLength')).toBe('signup__checker-item--valid');
    expect(component.getPasswordCheckerClass('specialChar')).toBe('signup__checker-item--valid');
    expect(component.getPasswordCheckerClass('digit')).toBe('signup__checker-item--valid');
  });

  it('should return valid class if password checker passes for a type', () => {
    const control = component.signupForm.get('password');
    // Mot de passe valide
    control?.setValue('Abcdef1!');
    fixture.detectChanges();
    // Tous les critères doivent passer
    expect(component.getPasswordCheckerClass('uppercase')).toBe('signup__checker-item--valid');
    expect(component.getPasswordCheckerClass('minLength')).toBe('signup__checker-item--valid');
    expect(component.getPasswordCheckerClass('specialChar')).toBe('signup__checker-item--valid');
    expect(component.getPasswordCheckerClass('digit')).toBe('signup__checker-item--valid');
  });

  it('should set passwordStrength errors for too short password', () => {
    const control = component.signupForm.get('password');
    control?.setValue('A1!'); // trop court
    fixture.detectChanges();
    expect(control?.errors?.['passwordStrength']?.minLength).toBe('Le mot de passe doit contenir au moins 6 caractères');
  });

  it('should set passwordStrength errors for missing special character', () => {
    const control = component.signupForm.get('password');
    control?.setValue('Abcdef1'); // pas de caractère spécial
    fixture.detectChanges();
    expect(control?.errors?.['passwordStrength']?.specialChar).toBe('Le mot de passe doit contenir au moins un caractère spécial');
  });

  it('should set passwordStrength errors for missing digit', () => {
    const control = component.signupForm.get('password');
    control?.setValue('Abcdef!'); // pas de chiffre
    fixture.detectChanges();
    expect(control?.errors?.['passwordStrength']?.digit).toBe('Le mot de passe doit contenir au moins un chiffre');
  });

  it('should set passwordStrength errors for missing uppercase', () => {
    const control = component.signupForm.get('password');
    control?.setValue('abcdef1!'); // pas de majuscule
    fixture.detectChanges();
    expect(control?.errors?.['passwordStrength']?.uppercase).toBe('Le mot de passe doit contenir au moins une majuscule');
  });

  it('should not set passwordStrength error for valid password', () => {
    const control = component.signupForm.get('password');
    control?.setValue('Abcdef1!');
    fixture.detectChanges();
    expect(control?.errors).toBeNull();
  });

  it('should set matchOtherControl error if passwords do not match', () => {
    component.signupForm.get('password')?.setValue('Abcdef1!');
    component.signupForm.get('confirmPassword')?.setValue('Abcdef2!');
    fixture.detectChanges();
    expect(component.signupForm.get('confirmPassword')?.errors?.['matchOtherControl']).toBeDefined();
  });

  it('should not set matchOtherControl error if passwords match', () => {
    component.signupForm.get('password')?.setValue('Abcdef1!');
    component.signupForm.get('confirmPassword')?.setValue('Abcdef1!');
    fixture.detectChanges();
    expect(component.signupForm.get('confirmPassword')?.errors).toBeNull();
  });
});
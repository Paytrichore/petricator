import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { BasicInputComponent } from '../../../shared/components/basic-input/basic-input.component';
import { ToFormControlPipe } from '../../../shared/pipes/form-control.pipe';
import { LoaderDirective } from '../../../shared/directives/loader.directive';
import { MatButton } from '@angular/material/button';
import { matchOtherControlValidator, passwordStrengthValidator, patternValidator, requiredValidator } from '../../../shared/helpers/validators/generics.validator';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MessageService } from '../../../services/message/message.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Actions, ofType } from '@ngrx/effects';
import { signupSuccess, signupFailure } from '../../../core/stores/user/user.actions';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToFormControlPipe,
    BasicInputComponent,
    LoaderDirective,
    MatButton,
    RouterLink,
    MatIcon,
    TranslateModule
  ],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private actions$: Actions
  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group({
      username: ['',[
        requiredValidator(
          this.translate.instant('auth.form.username.required')
        ),
        patternValidator(
          '/^.{6,}$/',
          this.translate.instant('auth.form.username.invalid')
        )
      ]],
      email: ['',[
        requiredValidator(
          this.translate.instant('auth.form.mail.required')
        ),
        patternValidator(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          this.translate.instant('auth.form.mail.invalid')
        )
      ]],
      password: ['',[
        requiredValidator(
          this.translate.instant('auth.form.password.required')
        ),
        passwordStrengthValidator()
      ]],
      confirmPassword: ['',[
        requiredValidator(
          this.translate.instant('auth.form.passwordConfirmation.required')
        ),
        matchOtherControlValidator(
          'password',
          this.translate.instant('auth.form.passwordConfirmation.invalid')
        )
      ]],
    });

    this.actions$.pipe(
      ofType(signupSuccess, signupFailure),
      filter(() => this.loading)
    ).subscribe(async (action) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      switch (action.type) {
        case signupSuccess.type:
          this.router.navigate(['/']);
          this.loading = false;
          this.cdr.detectChanges();
          break;
        case signupFailure.type:
          const apiCode = action.error?.error?.error?.code;
          const key = 'auth.form.apiErrors.' + (apiCode || 'DEFAULT');
          const translation = this.translate.instant(key);
          this.error = translation === key
            ? this.translate.instant('auth.form.apiErrors.DEFAULT')
            : translation;
          this.loading = false;
          this.cdr.detectChanges();
          if (this.error) {
            this.messageService.openSnackBar(this.error, true);
          }
          break;
      }
    });
  }

  onSubmit() {
    if (this.signupForm.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, email, password } = this.signupForm.value;
    this.authService.signup(username, email, password);
  }

  getPasswordCheckerClass(type: 'minLength' | 'specialChar' | 'digit' | 'uppercase'): string {
    const control = this.signupForm.get('password');
    const errors = control?.errors || {};
    const value = control?.value;
    if (!value) return '';
    if (errors['passwordStrength'] && errors['passwordStrength'][type]) return 'signup__checker-item--error';
    return 'signup__checker-item--valid';
  }
}
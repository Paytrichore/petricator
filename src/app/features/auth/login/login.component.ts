import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ToFormControlPipe } from '../../../shared/pipes/form-control.pipe';
import { BasicInputComponent } from '../../../shared/components/basic-input/basic-input.component';
import { patternValidator, requiredValidator } from '../../../shared/helpers/validators/generics.validator';
import { LoaderDirective } from '../../../shared/directives/loader.directive';
import { MessageService } from '../../../services/message/message.service';
import { MatButton } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ToFormControlPipe,
    BasicInputComponent,
    MatButton,
    LoaderDirective,
    TranslateModule
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [
        requiredValidator(
          this.translate.instant('auth.form.mail.required')
        ),
        patternValidator(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          this.translate.instant('auth.form.mail.invalid')
        )
      ]],
      password: ['', [
        requiredValidator(
          this.translate.instant('auth.form.password.required')
        ),
        patternValidator(
          '/^.{6,}$/',
          this.translate.instant('auth.form.password.invalid')
        )
      ]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const minLoading = new Promise(resolve => setTimeout(resolve, 1000));
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: async () => {
        await minLoading;
        this.router.navigate(['/']);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: async err => {
        await minLoading;
        const apiCode = err?.error?.error?.code;
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
      }
    });
  }
}
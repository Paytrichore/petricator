import { Component, ChangeDetectorRef } from '@angular/core';
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
    MatIcon
  ],
})
export class SignupComponent {
  signupForm: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.signupForm = this.fb.group({
      username: ['', [requiredValidator('Le pseudo est requis'), patternValidator('/^.{6,}$/', 'Le pseudo doit contenir au moins 6 caractères')]],
      email: ['', [requiredValidator('L\'email est requis'), patternValidator(
        '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        'Adresse email invalide'
      )]],
      password: ['', [requiredValidator('Le mot de passe est requis'), passwordStrengthValidator()]],
      confirmPassword: ['', [requiredValidator('Le validation est requise'), matchOtherControlValidator('password', 'Les mots de passe ne correspondent pas')]],
    });
  }

  onSubmit() {
    if (this.signupForm.invalid) return;

    this.loading = true;
    const minLoading = new Promise(resolve => setTimeout(resolve, 1000));
    const { username, email, password } = this.signupForm.value;
    
    this.authService.signup(username, email, password).subscribe({
      next: async () => {
        await minLoading;
        this.router.navigate(['/']);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: async err => {
        await minLoading;
        const apiMessage = err?.error?.message;
        this.error = typeof apiMessage === 'string' && apiMessage.trim().length > 0
          ? apiMessage
          : 'Erreur lors de l\'inscription';
        this.loading = false;
        this.cdr.detectChanges();
        if (this.error) {
          this.messageService.openSnackBar(this.error, true);
        }
      }
    });
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
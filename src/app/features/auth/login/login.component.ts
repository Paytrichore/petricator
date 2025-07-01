import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ToFormControlPipe } from '../../../shared/pipes/form-control.pipe';
import { BasicInputComponent } from '../../../shared/components/basic-input/basic-input.component';
import { patternValidator, requiredValidator } from '../../../shared/helpers/validators/generics.validator';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [ReactiveFormsModule, RouterLink, ToFormControlPipe, BasicInputComponent, MatButtonModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [requiredValidator('L\'email est requis'), patternValidator(
        '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        'Adresse email invalide'
      )]],
      password: ['', [requiredValidator('Le mot de passe est requis'), patternValidator('/^.{6,}$/', 'Le mot de passe doit contenir au moins 6 caractères')]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => this.error = err?.error?.message || 'Erreur lors de la connexion'
    });
  }

  onChange() {
    console.log('Form changed:', this.loginForm.value);
  }
}
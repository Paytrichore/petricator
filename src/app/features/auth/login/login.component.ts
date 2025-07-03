import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ToFormControlPipe } from '../../../shared/pipes/form-control.pipe';
import { BasicInputComponent } from '../../../shared/components/basic-input/basic-input.component';
import { patternValidator, requiredValidator } from '../../../shared/helpers/validators/generics.validator';
import { LoaderDirective } from '../../../shared/directives/loader.directive';
import { MessageService } from '../../../services/message/message.service';
import { MatButton } from '@angular/material/button';

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
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
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
    this.loading = true;
    const minLoading = new Promise(resolve => setTimeout(resolve, 1000));
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: async () => {
        await minLoading;
        this.router.navigate(['/']);
        this.loading = false;
      },
      error: async err => {
        await minLoading;
        this.error = err?.error?.message || 'Erreur lors de la connexion';
        this.loading = false;
        if (this.error) {
          this.messageService.openSnackBar(this.error, true);
        }
      }
    });
  }

  onChange() {}
}
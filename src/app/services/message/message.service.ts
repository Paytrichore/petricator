import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  public openSnackBar(message: string, error = false): void {
    setTimeout(() => {
      const isAuthenticated = this.isAuthenticatedRoute();
      this.snackBar.open(message, 'Fermer', {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: [
          error ? 'snackbar--error' : 'snackbar--success',
          ...(isAuthenticated ? ['snackbar--authenticated'] : []),
        ]
      });
    }, 500);
  }

  private isAuthenticatedRoute(): boolean {
    return !this.router.url.startsWith('/login') && !this.router.url.startsWith('/signup');
  }
}

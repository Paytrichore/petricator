import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private snackBar: MatSnackBar) {}

  public openSnackBar(message: string, error = false): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: message ? ['snackbar--error'] : undefined
    });
  }
}

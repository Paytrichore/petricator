import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';

import { MatIconModule } from '@angular/material/icon';
import { SnackbarData } from '../../interfaces/snackbar';

/**
 * Responsable de l'affichage de la snackbar à travers
 * toute l'application.
 */
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  imports: [MatIconModule]
})
export class MessageComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData,
    private snackBar: MatSnackBar
  ) {}

  public handleCloseBtn(): void {
    this.snackBar.dismiss();
  }
}

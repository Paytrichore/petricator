import { Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogLayoutComponent } from '../../components/dialog-layout/dialog-layout.component';

export interface DialogLayoutData<T> {
  title: string;
  component: Type<T>;
  inputs?: Partial<T>;
  output?: keyof T & string;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private matDialog: MatDialog) {}

  open<T, TResult = unknown>(
    component: Type<T>,
    config: Omit<DialogLayoutData<T>, 'component'>,
  ): MatDialogRef<DialogLayoutComponent, TResult> {
    return this.matDialog.open(DialogLayoutComponent, {
      data: { component, ...config },
      width: 'min(560px, calc(100vw - 32px))',
      maxWidth: '100vw',
    }) as MatDialogRef<DialogLayoutComponent, TResult>;
  }
}

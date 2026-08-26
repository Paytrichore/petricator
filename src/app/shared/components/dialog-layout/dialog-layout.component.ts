import { Component, ComponentRef, Inject, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogLayoutData } from '../../services/dialog/dialog.service';

@Component({
  selector: 'app-dialog-layout',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './dialog-layout.component.html',
  styleUrl: './dialog-layout.component.scss',
})
export class DialogLayoutComponent implements OnInit {
  private componentRef?: ComponentRef<unknown>;

  @ViewChild('dialogContent', { read: ViewContainerRef, static: true })
  private dialogContent!: ViewContainerRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogLayoutData<unknown>,
    private dialogRef: MatDialogRef<DialogLayoutComponent, unknown>,
  ) {}

  ngOnInit(): void {
    this.componentRef = this.dialogContent.createComponent(this.data.component as Type<unknown>);
    Object.assign(this.componentRef.instance as object, this.data.inputs ?? {});

    if (this.data.output) {
      const output = (this.componentRef.instance as Record<string, unknown>)[this.data.output];
      if (output && typeof (output as { subscribe?: unknown }).subscribe === 'function') {
        (output as { subscribe: (value: unknown) => void }).subscribe((value: unknown) => {
          this.dialogRef.close(value);
        });
      }
    }
  }
}

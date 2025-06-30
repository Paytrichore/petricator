import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BaseFormFieldDirective } from '../../directives/CVA.directive';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-basic-input',
  templateUrl: './basic-input.component.html',
  styleUrls: ['./basic-input.component.scss'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicInputComponent extends BaseFormFieldDirective<string> {

}

import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Peblob } from '../../interfaces/peblob';

@Component({
  selector: 'app-rgb-values',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './rgb-values.component.html',
  styleUrl: './rgb-values.component.scss',
})
export class RgbValuesComponent {
  @Input({ required: true }) color!: Peblob;
  @Input() format: 'default' | 'xs' = 'default';
}

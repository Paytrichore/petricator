import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RgbValuesComponent } from '../rgb-values/rgb-values.component';

interface Peblob {
  r: number;
  g: number;
  b: number;
}

type ComposedPeblob = Array<Array<Peblob>>;

@Component({
  selector: 'app-peblob',
  imports: [RgbValuesComponent],
  templateUrl: './peblob.component.html',
  styleUrl: './peblob.component.scss',
})
export class PeblobComponent {
  @Input() composed!: ComposedPeblob;
  @Input() size = 100;
  @Input() showRgbText = false;
  @Output() colorHovered = new EventEmitter<{ color: Peblob; event: MouseEvent }>();
  @Output() colorHoverEnded = new EventEmitter<void>();

  public onColorHovered(color: Peblob, event: MouseEvent): void {
    this.colorHovered.emit({ color, event });
  }
}

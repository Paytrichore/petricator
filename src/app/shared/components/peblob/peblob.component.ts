import { Component, Input } from '@angular/core';

interface Peblob {
  r: number;
  g: number;
  b: number;
}

type ComposedPeblob = Array<Array<Peblob>>;

@Component({
  selector: 'app-peblob',
  imports: [],
  templateUrl: './peblob.component.html',
  styleUrl: './peblob.component.scss'
})
export class PeblobComponent {
  @Input() composed!: ComposedPeblob;
}

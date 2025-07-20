import { Component, OnInit } from '@angular/core';
import { PeblobComponent } from '../../shared/components/peblob/peblob.component';
import { ComposedPeblob, Tint } from '../../shared/interfaces/peblob';
import { PeblobService } from '../../services/peblob/peblob.service';

@Component({
  selector: 'app-home',
  imports: [PeblobComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  public peblob!: Array<ComposedPeblob>;

  constructor(private peblobService: PeblobService) {}

  ngOnInit(): void {
    this.peblob = [
      this.peblobService.composedPeblobGenerator(Tint.ORANGE),
      this.peblobService.composedPeblobGenerator(Tint.GREEN),
      this.peblobService.composedPeblobGenerator(Tint.BLUE),
      this.peblobService.composedPeblobGenerator(Tint.PURPLE),
      this.peblobService.composedPeblobGenerator(Tint.RED),
      this.peblobService.composedPeblobGenerator(Tint.YELLOW),
      this.peblobService.composedPeblobGenerator(Tint.PINK)
    ];
  }
}

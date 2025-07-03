import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader-spinner.component.html',
  styleUrls: ['./loader-spinner.component.scss']
})
export class LoaderSpinnerComponent implements OnInit, OnDestroy {
  gridSize = 4;
  frame = 0;
  intervalId: any;
  rows: number[] = [];
  cols: number[] = [];
  delays: number[][] = [];

  ngOnInit() {
    this.rows = Array.from({ length: this.gridSize }, (_, i) => i);
    this.cols = Array.from({ length: this.gridSize }, (_, i) => i);
    // Génère un delay aléatoire pour chaque pixel
    this.delays = this.rows.map(() => this.cols.map(() => Math.random() * 1.2));
    this.intervalId = setInterval(() => {
      this.frame = (this.frame + 1) % 2;
    }, 350);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  getOpacity(x: number, y: number): number {
    // Chaque pixel clignote en damier, alternance sur frame
    return ((x + y) % 2 === this.frame) ? 1 : 0.3;
  }

  getDelay(x: number, y: number): string {
    return `${this.delays[y][x]}s`;
  }
}

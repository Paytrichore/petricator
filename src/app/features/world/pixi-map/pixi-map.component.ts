import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Application, Container, Graphics } from 'pixi.js';
import { PeblobEntity } from '../../../core/stores/peblob/peblob.model';
import { Cell } from '../../../shared/interfaces/world.interface';

const CELL_SIZE = 8;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.1;

@Component({
  selector: 'app-pixi-map',
  standalone: true,
  templateUrl: './pixi-map.component.html',
  styleUrl: './pixi-map.component.scss'
})
export class PixiMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() cells: Cell[] = [];
  @Input() peblobs: PeblobEntity[] = [];

  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;
  private application: Application | null = null;
  private mapContainer: Container | null = null;
  private isDestroyed = false;
  private isDragging = false;
  private lastPointer = { x: 0, y: 0 };

  async ngAfterViewInit(): Promise<void> {
    const canvas = this.canvasRef.nativeElement;
    const application = new Application();
    await application.init({
      canvas,
      backgroundColor: 0x101820,
      antialias: false,
      resizeTo: canvas.parentElement ?? undefined
    });

    if (this.isDestroyed) {
      application.destroy(true);
      return;
    }

    this.application = application;
    this.mapContainer = new Container();
    this.mapContainer.position.set(application.screen.width / 2, application.screen.height / 2);
    application.stage.addChild(this.mapContainer);
    this.drawCells();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['cells'] || changes['peblobs']) && this.application) {
      this.drawCells();
    }
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (!this.mapContainer) {
      return;
    }

    const direction = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.mapContainer.scale.x * direction));
    this.mapContainer.scale.set(nextZoom);
  }

  onPointerDown(event: PointerEvent): void {
    this.isDragging = true;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.canvasRef.nativeElement.setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging || !this.mapContainer) {
      return;
    }

    this.mapContainer.position.x += event.clientX - this.lastPointer.x;
    this.mapContainer.position.y += event.clientY - this.lastPointer.y;
    this.lastPointer = { x: event.clientX, y: event.clientY };
  }

  onPointerUp(event: PointerEvent): void {
    this.isDragging = false;
    if (this.canvasRef.nativeElement.hasPointerCapture(event.pointerId)) {
      this.canvasRef.nativeElement.releasePointerCapture(event.pointerId);
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.application?.destroy(true);
    this.application = null;
    this.mapContainer = null;
  }

  private drawCells(): void {
    if (!this.mapContainer) {
      return;
    }

    for (const child of this.mapContainer.removeChildren()) {
      child.destroy();
    }

    for (const cell of this.cells) {
      if (!cell.occupants.length) {
        continue;
      }

      const peblob = this.peblobs.find(candidate => cell.occupants.includes(candidate._id));
      if (peblob) {
        this.drawPeblob(cell, peblob);
      } else {
        const graphics = new Graphics();
        graphics
          .rect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
          .fill(this.occupantColor(cell.occupants.length));
        this.mapContainer.addChild(graphics);
      }
    }
  }

  private drawPeblob(cell: Cell, peblob: PeblobEntity): void {
    const structureSize = Math.max(peblob.structure.length, 1);
    const pixelSize = CELL_SIZE / structureSize;
    const originX = cell.x * CELL_SIZE;
    const originY = cell.y * CELL_SIZE;

    peblob.structure.forEach((row, rowIndex) => {
      row.forEach((pixel, columnIndex) => {
        const graphics = new Graphics();
        graphics
          .rect(originX + columnIndex * pixelSize, originY + rowIndex * pixelSize, pixelSize, pixelSize)
          .fill(this.rgbColor(pixel.r, pixel.g, pixel.b));
        this.mapContainer?.addChild(graphics);
      });
    });
  }

  private occupantColor(occupantCount: number): number {
    const intensity = Math.min(1, Math.max(0, (occupantCount - 1) / 9));
    const red = Math.round(64 + intensity * 191);
    const green = Math.round(220 - intensity * 180);
    return (red << 16) | (green << 8) | 64;
  }

  private rgbColor(red: number, green: number, blue: number): number {
    const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)));
    return (clamp(red) << 16) | (clamp(green) << 8) | clamp(blue);
  }
}
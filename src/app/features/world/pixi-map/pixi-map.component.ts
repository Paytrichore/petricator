import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Application, Container, FederatedPointerEvent, Graphics } from 'pixi.js';
import { PeblobEntity } from '../../../core/stores/peblob/peblob.model';
import { Cell } from '../../../shared/interfaces/world.interface';

const CELL_SIZE = 8;
const CELL_GAP = 1;
const CELL_PITCH = CELL_SIZE + CELL_GAP;
const DRAG_THRESHOLD = 5;
const MIN_COORDINATE = -100;
const MAX_COORDINATE = 100;
const MAP_SIZE = MAX_COORDINATE - MIN_COORDINATE + 1;
const MAP_EXTENT = (MAP_SIZE - 1) * CELL_PITCH + CELL_SIZE;
const MAP_CENTER_OFFSET = CELL_SIZE / 2;

@Component({
  selector: 'app-pixi-map',
  standalone: true,
  templateUrl: './pixi-map.component.html',
  styleUrl: './pixi-map.component.scss'
})
export class PixiMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() cells: Cell[] = [];
  @Input() peblobs: PeblobEntity[] = [];
  @Input() zoom = 1;
  @Input() showAxes = true;
  @Output() cellSelected = new EventEmitter<{
    x: number;
    y: number;
    occupied: boolean;
    clientX: number;
    clientY: number;
  }>();
  @Output() cellHovered = new EventEmitter<{
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    peblob?: PeblobEntity;
  }>();
  @Output() cellHoverEnded = new EventEmitter<void>();

  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;
  private application: Application | null = null;
  private mapContainer: Container | null = null;
  private viewportSize = { width: 0, height: 0 };
  private isDestroyed = false;
  private isDragging = false;
  private didDrag = false;
  private lastPointer = { x: 0, y: 0 };
  private pointerDown = { x: 0, y: 0 };
  private defaultCellLayer: Graphics | null = null;
  private axisLayer: Graphics | null = null;
  private interactionLayer: Graphics | null = null;
  private occupiedCells = new Map<string, Cell>();

  async ngAfterViewInit(): Promise<void> {
    const canvas = this.canvasRef.nativeElement;
    const application = new Application();
    await application.init({
      canvas,
      backgroundAlpha: 0,
      antialias: false
    });

    if (this.isDestroyed) {
      application.destroy(true);
      return;
    }

    this.application = application;
    this.mapContainer = new Container();
    this.mapContainer.scale.set(this.zoom);
    this.mapContainer.position.set(
      application.screen.width / 2 - MAP_CENTER_OFFSET * this.zoom,
      application.screen.height / 2 - MAP_CENTER_OFFSET * this.zoom
    );
    application.stage.addChild(this.mapContainer);
    this.createInteractionLayer();
    this.drawCells();
    this.resizeViewport();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['zoom'] && this.mapContainer) {
      this.mapContainer.scale.set(this.zoom);
      this.clampMapPosition();
      this.drawAxes();
    }

    if (changes['showAxes'] && this.mapContainer) {
      this.drawAxes();
    }

    if ((changes['cells'] || changes['peblobs']) && this.application) {
      this.drawCells();
    }
  }

  onPointerDown(event: PointerEvent): void {
    this.isDragging = true;
    this.didDrag = false;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.pointerDown = { x: event.clientX, y: event.clientY };
    this.canvasRef.nativeElement.setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging || !this.mapContainer) {
      return;
    }

    const distanceX = event.clientX - this.pointerDown.x;
    const distanceY = event.clientY - this.pointerDown.y;
    if (Math.hypot(distanceX, distanceY) >= DRAG_THRESHOLD) {
      this.didDrag = true;
    }

    this.mapContainer.position.x += event.clientX - this.lastPointer.x;
    this.mapContainer.position.y += event.clientY - this.lastPointer.y;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.clampMapPosition();
  }

  onPointerUp(event: PointerEvent): void {
    this.isDragging = false;
    if (this.canvasRef.nativeElement.hasPointerCapture(event.pointerId)) {
      this.canvasRef.nativeElement.releasePointerCapture(event.pointerId);
    }
  }

  onCanvasLeave(): void {
    this.cellHoverEnded.emit();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.application?.destroy(true);
    this.application = null;
    this.mapContainer = null;
    this.defaultCellLayer = null;
    this.axisLayer = null;
    this.interactionLayer = null;
  }

  @HostListener('window:petricator-nav-resized')
  onNavigationLayoutResized(): void {
    this.resizeViewport();
  }

  private drawCells(): void {
    if (!this.mapContainer) {
      return;
    }

    for (const child of [...this.mapContainer.children]) {
      if (child !== this.defaultCellLayer && child !== this.axisLayer && child !== this.interactionLayer) {
        this.mapContainer.removeChild(child);
        child.destroy();
      }
    }

    this.occupiedCells = new Map(this.cells.map(cell => [`${cell.x}_${cell.y}`, cell]));
    this.drawDefaultCells();

    for (const cell of this.occupiedCells.values()) {
      if (!cell.occupants.length || !this.isInBounds(cell.x, cell.y)) {
        continue;
      }

      const peblob = this.peblobs.find(candidate => cell.occupants.includes(candidate._id));
      if (peblob) {
        this.drawPeblob(cell, peblob);
      } else {
        const graphics = new Graphics();
        graphics
          .rect(cell.x * CELL_PITCH, this.screenY(cell.y), CELL_SIZE, CELL_SIZE)
          .fill(this.occupantColor(cell.occupants.length));
        this.mapContainer.addChild(graphics);
      }
    }

    this.drawAxes();
  }

  private drawDefaultCells(): void {
    if (!this.mapContainer) {
      return;
    }

    this.defaultCellLayer?.destroy();
    this.defaultCellLayer = new Graphics();
    const defaultColor = this.cssColor('--mat-sys-surface-container-high', '#2b2d31');

    for (let y = MIN_COORDINATE; y <= MAX_COORDINATE; y += 1) {
      for (let x = MIN_COORDINATE; x <= MAX_COORDINATE; x += 1) {
        this.defaultCellLayer
          .rect(x * CELL_PITCH, this.screenY(y), CELL_SIZE, CELL_SIZE)
          .fill(defaultColor);
      }
    }

    this.mapContainer.addChildAt(this.defaultCellLayer, 0);
  }

  private drawAxes(): void {
    if (!this.mapContainer) {
      return;
    }

    this.axisLayer?.destroy();
    this.axisLayer = null;
    if (!this.showAxes) {
      return;
    }

    this.axisLayer = new Graphics();
    const zoom = this.mapContainer.scale.x;
    const lineWidth = 1 / zoom;
    const start = MIN_COORDINATE * CELL_PITCH;
    const end = MIN_COORDINATE * CELL_PITCH + MAP_EXTENT;
    const axisX = CELL_SIZE / 2;
    const axisY = CELL_SIZE / 2;
    const axisColor = this.cssColor('--mat-sys-error', '#ffb4ab');

    this.axisLayer
      .moveTo(axisX, start)
      .lineTo(axisX, end)
      .moveTo(start, axisY)
      .lineTo(end, axisY)
      .stroke({ color: axisColor, width: lineWidth, alpha: 0.9 });
    this.mapContainer.addChild(this.axisLayer);
  }

  private createInteractionLayer(): void {
    if (!this.mapContainer) {
      return;
    }

    this.interactionLayer = new Graphics()
      .rect(MIN_COORDINATE * CELL_PITCH, MIN_COORDINATE * CELL_PITCH, MAP_EXTENT, MAP_EXTENT)
      .fill({ color: 0xffffff, alpha: 0.001 });
    this.interactionLayer.eventMode = 'static';
    this.interactionLayer.cursor = 'pointer';
    this.interactionLayer.on('pointermove', (event: FederatedPointerEvent) => this.onMapHover(event));
    this.interactionLayer.on('pointerout', () => this.cellHoverEnded.emit());
    this.interactionLayer.on('pointertap', (event: FederatedPointerEvent) => this.onMapClick(event));
    this.mapContainer.addChild(this.interactionLayer);
  }

  private onMapHover(event: FederatedPointerEvent): void {
    if (!this.isInsideCanvas(event)) {
      this.cellHoverEnded.emit();
      return;
    }

    const cell = this.cellFromEvent(event);
    if (!cell) {
      this.cellHoverEnded.emit();
      return;
    }

    const bounds = this.canvasRef.nativeElement.getBoundingClientRect();
    const occupiedCell = this.occupiedCells.get(`${cell.x}_${cell.y}`);
    const peblob = occupiedCell
      ? this.peblobs.find(candidate => occupiedCell.occupants.includes(candidate._id))
      : undefined;
    this.cellHovered.emit({
      ...cell,
      clientX: bounds.left + event.global.x,
      clientY: bounds.top + event.global.y,
      peblob
    });
  }

  private onMapClick(event: FederatedPointerEvent): void {
    if (this.didDrag) {
      return;
    }

    const cell = this.cellFromEvent(event);
    if (!cell) {
      return;
    }

    const bounds = this.canvasRef.nativeElement.getBoundingClientRect();
    this.cellSelected.emit({
      ...cell,
      occupied: this.occupiedCells.has(`${cell.x}_${cell.y}`),
      clientX: bounds.left + event.global.x,
      clientY: bounds.top + event.global.y
    });
  }

  private cellFromEvent(event: FederatedPointerEvent): { x: number; y: number } | null {
    if (!this.mapContainer) {
      return null;
    }

    const local = this.mapContainer.toLocal(event.global);
    const x = Math.floor(local.x / CELL_PITCH);
    const screenY = Math.floor(local.y / CELL_PITCH);
    if (local.x - x * CELL_PITCH >= CELL_SIZE || local.y - screenY * CELL_PITCH >= CELL_SIZE) {
      return null;
    }
    const y = -screenY;
    return this.isInBounds(x, y) ? { x, y } : null;
  }

  private isInsideCanvas(event: FederatedPointerEvent): boolean {
    const application = this.application;
    if (!application) {
      return false;
    }

    return event.global.x >= 0
      && event.global.y >= 0
      && event.global.x <= application.screen.width
      && event.global.y <= application.screen.height;
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= MIN_COORDINATE && x <= MAX_COORDINATE && y >= MIN_COORDINATE && y <= MAX_COORDINATE;
  }

  private resizeViewport(): void {
    if (!this.application || !this.mapContainer || this.isDestroyed) {
      return;
    }

    const viewport = this.canvasRef.nativeElement.parentElement ?? this.canvasRef.nativeElement;
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    if (!width || !height) {
      return;
    }

    if (this.viewportSize.width === width && this.viewportSize.height === height) {
      return;
    }

    this.viewportSize = { width, height };

    this.application.renderer.resize(width, height);
    this.mapContainer.position.set(
      width / 2 - MAP_CENTER_OFFSET * this.zoom,
      height / 2 - MAP_CENTER_OFFSET * this.zoom
    );
    this.clampMapPosition();
  }

  private clampMapPosition(): void {
    if (!this.application || !this.mapContainer) {
      return;
    }

    const halfMap = MAP_EXTENT * this.mapContainer.scale.x / 2;
    const halfViewport = Math.min(this.application.screen.width, this.application.screen.height) / 2;
    const limit = Math.max(0, halfMap - halfViewport);
    const centerX = this.application.screen.width / 2 - MAP_CENTER_OFFSET * this.mapContainer.scale.x;
    const centerY = this.application.screen.height / 2 - MAP_CENTER_OFFSET * this.mapContainer.scale.x;
    this.mapContainer.position.x = Math.min(centerX + limit, Math.max(centerX - limit, this.mapContainer.position.x));
    this.mapContainer.position.y = Math.min(centerY + limit, Math.max(centerY - limit, this.mapContainer.position.y));
  }

  private drawPeblob(cell: Cell, peblob: PeblobEntity): void {
    const structureSize = Math.max(peblob.structure.length, 1);
    const pixelSize = CELL_SIZE / structureSize;
    const originX = cell.x * CELL_PITCH;
    const originY = this.screenY(cell.y);

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
    void occupantCount;
    return 0x000000;
  }

  private rgbColor(red: number, green: number, blue: number): number {
    const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)));
    return (clamp(red) << 16) | (clamp(green) << 8) | clamp(blue);
  }

  private screenY(coordinateY: number): number {
    return -coordinateY * CELL_PITCH;
  }

  private cssColor(variable: string, fallback: string): string {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
  }
}
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, OnDestroy, TemplateRef, ViewContainerRef, ViewEncapsulation, inject } from '@angular/core';

export interface TooltipPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-tooltip',
  standalone: true,
  template: '',
  styleUrl: './tooltip.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class TooltipComponent implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef: OverlayRef | null = null;

  show(template: TemplateRef<unknown>, context: unknown, position: TooltipPosition): void {
    this.hide();

    this.overlayRef = this.overlay.create({
      panelClass: 'app-tooltip-panel',
      positionStrategy: this.createPositionStrategy(position),
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    this.overlayRef.attach(new TemplatePortal(
      template,
      this.viewContainerRef,
      { $implicit: context }
    ));
  }

  hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private createPositionStrategy(position: TooltipPosition) {
    return this.overlay.position()
      .global()
      .left(`${position.x + 12}px`)
      .top(`${position.y + 12}px`);
  }
}

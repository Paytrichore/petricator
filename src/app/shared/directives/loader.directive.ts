import { Directive, Input, ElementRef, Renderer2, OnChanges, SimpleChanges, Injector, ViewContainerRef, ComponentRef } from '@angular/core';
import { LoaderSpinnerComponent } from '../components/loader-spinner/loader-spinner.component';

@Directive({
  selector: '[appLoader]',
  standalone: true,
  inputs: ['appLoader']
})
export class LoaderDirective implements OnChanges {
  @Input('appLoader') loading = false;

  private isButton = false;
  private originalContent: HTMLElement | null = null;
  private spinnerRef: ComponentRef<LoaderSpinnerComponent> | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private injector: Injector,
    private vcr: ViewContainerRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('loading' in changes) {
      this.updateView();
    }
  }

  private updateView() {
    const nativeEl = this.el.nativeElement as HTMLElement;
    this.isButton = nativeEl.tagName === 'BUTTON';
    // Nettoyage
    this.vcr.clear();
    if (this.loading) {
      if (this.isButton) {
        this.renderer.setProperty(nativeEl, 'disabled', true);
        // Cache le contenu du bouton
        if (!this.originalContent) {
          this.originalContent = document.createElement('span');
          this.originalContent.innerHTML = nativeEl.innerHTML;
        }
        nativeEl.innerHTML = '';
        // Crée dynamiquement le spinner
        this.spinnerRef = this.vcr.createComponent(LoaderSpinnerComponent, { injector: this.injector });
        nativeEl.appendChild(this.spinnerRef.location.nativeElement);
      } else {
        // Pour un bloc, remplace le contenu par le spinner
        this.spinnerRef = this.vcr.createComponent(LoaderSpinnerComponent, { injector: this.injector });
        nativeEl.innerHTML = '';
        nativeEl.appendChild(this.spinnerRef.location.nativeElement);
      }
    } else {
      if (this.isButton) {
        this.renderer.setProperty(nativeEl, 'disabled', false);
        if (this.originalContent) {
          nativeEl.innerHTML = this.originalContent.innerHTML;
          this.originalContent = null;
        }
      } else {
        // Pour un bloc, il faudrait restaurer le contenu initial si besoin
        // (optionnel selon usage)
      }
      if (this.spinnerRef) {
        this.spinnerRef.destroy();
        this.spinnerRef = null;
      }
    }
  }
}

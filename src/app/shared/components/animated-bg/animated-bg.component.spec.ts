import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnimatedBgComponent } from './animated-bg.component';

describe('AnimatedBgComponent', () => {
  let component: AnimatedBgComponent;
  let fixture: ComponentFixture<AnimatedBgComponent>;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedBgComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimatedBgComponent);
    component = fixture.componentInstance;
    spyOn(component as any, 'loadColorSetsFromCss');
    component['colorSets'] = [
      ['#morning'], ['#noon'], ['#evening'], ['#night']
    ];
    canvas = document.createElement('canvas');
    Object.defineProperty(component, 'canvasRef', {
      value: { nativeElement: canvas },
      writable: true
    });
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    spyOn(canvas, 'getContext').and.returnValue(ctx);
    spyOn(window, 'getComputedStyle').and.callFake(() => ({
      getPropertyValue: (name: string) => '#123456',
    }) as any);
  });

  it('should set up colorSetInterval and update colors every minute', fakeAsync(() => {
    // Force l'heure à 8h (matin)
    spyOn(Date.prototype, 'getHours').and.returnValue(8);
    component.ngAfterViewInit();
    // Appel manuel pour initialiser colors (car le premier appel dans ngAfterViewInit n'utilise pas notre colorSets mocké)
    component['setColorsForCurrentTime']();
    expect(component['colors']).toEqual(['#morning']);
    // Change l'heure à midi, tick 1min
    (Date.prototype.getHours as any).and.returnValue(13);
    tick(60 * 1000);
    expect(component['colors']).toEqual(['#noon']);
    // Change l'heure à 19h, tick 1min
    (Date.prototype.getHours as any).and.returnValue(19);
    tick(60 * 1000);
    expect(component['colors']).toEqual(['#evening']);
    // Nettoyage
    component.ngOnDestroy();
  }));

  it('should get a CSS variable value and trim it', () => {
    // Arrange
    const spyGetComputedStyle = (window.getComputedStyle as jasmine.Spy);
    spyGetComputedStyle.and.callFake(() => ({
      getPropertyValue: (name: string) => '  #abcdef  ',
    }) as any);
    // Act
    const value = (component as any).getCssVar('--palette-test');
    // Assert
    expect(spyGetComputedStyle).toHaveBeenCalledWith(document.documentElement);
    expect(value).toBe('#abcdef');
  });

  it('should load color sets from CSS variables', () => {
    // Arrange
    const cssVars = [
      '#a1', '#a2', '#a3', '#a4', '#a5', '#a6', '#a7', '#a8',
      '#b1', '#b2', '#b3', '#b4', '#b5', '#b6', '#b7', '#b8',
      '#c1', '#c2', '#c3', '#c4', '#c5', '#c6', '#c7', '#c8',
      '#d1', '#d2', '#d3', '#d4', '#d5', '#d6', '#d7', '#d8',
    ];
    let call = 0;
    (window.getComputedStyle as jasmine.Spy).and.callFake(() => ({
      getPropertyValue: (name: string) => cssVars[call++],
    }) as any);
    component['colorSets'] = [];
    // Restore la vraie méthode pour ce test
    (component as any).loadColorSetsFromCss.and.callThrough();
    // Act
    (component as any).loadColorSetsFromCss();
    // Assert
    expect(component['colorSets'].length).toBe(4);
    expect(component['colorSets'][0]).toEqual(['#a1','#a2','#a3','#a4','#a5','#a6','#a7','#a8']);
    expect(component['colorSets'][1]).toEqual(['#b1','#b2','#b3','#b4','#b5','#b6','#b7','#b8']);
    expect(component['colorSets'][2]).toEqual(['#c1','#c2','#c3','#c4','#c5','#c6','#c7','#c8']);
    expect(component['colorSets'][3]).toEqual(['#d1','#d2','#d3','#d4','#d5','#d6','#d7','#d8']);
  });

  it('should select night palette if hour is outside all other ranges', () => {
    // Arrange
    component['colorSets'] = [
      ['#morning'], ['#noon'], ['#evening'], ['#night']
    ];
    // Heure de nuit (ex: 3h du matin)
    spyOn(Date.prototype, 'getHours').and.returnValue(3);
    // Act
    component['setColorsForCurrentTime']();
    // Assert
    expect(component['colors']).toEqual(['#night']);
  });

  it('should call initCanvas when resizeCanvas is called', () => {
    const spy = spyOn(component as any, 'initCanvas');
    (component as any).resizeCanvas();
    expect(spy).toHaveBeenCalled();
  });
});

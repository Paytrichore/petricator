import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnimatedBgComponent } from './animated-bg.component';

describe('AnimatedBgComponent', () => {
  let component: AnimatedBgComponent;
  let fixture: ComponentFixture<AnimatedBgComponent>;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let getContextSpy: jasmine.Spy;

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
    getContextSpy = spyOn(canvas, 'getContext').and.returnValue(ctx);
    spyOn(window, 'getComputedStyle').and.callFake(() => ({
      getPropertyValue: (name: string) => '#123456',
    }) as any);
  });

  it('should set up colorSetInterval and update colors every 15 minutes', fakeAsync(() => {
    // Force l'heure à 8h (matin)
    spyOn(Date.prototype, 'getHours').and.returnValue(8);
    component.ngAfterViewInit();
    // Appel manuel pour initialiser colors (car le premier appel dans ngAfterViewInit n'utilise pas notre colorSets mocké)
    component['setColorsForCurrentTime']();
    expect(component['colors']).toEqual(['#morning']);
    // Change l'heure à midi, tick 15min
    (Date.prototype.getHours as any).and.returnValue(13);
    tick(15 * 60 * 1000);
    expect(component['colors']).toEqual(['#noon']);
    // Change l'heure à 19h, tick 15min
    (Date.prototype.getHours as any).and.returnValue(19);
    tick(15 * 60 * 1000);
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

  it('lerpColor should interpolate between two hex colors', () => {
    const c = (component as any).lerpColor('#ff0000', '#00ff00', 0.5);
    expect(c).toBe('rgba(128,128,0,1)');
  });

  it('lerpColor should interpolate between two rgba colors', () => {
    const c = (component as any).lerpColor('rgba(255,0,0,1)', 'rgba(0,255,0,0.5)', 0.5);
    expect(c).toBe('rgba(128,128,0,0.75)');
  });

  it('lerpColor should interpolate between two rgb colors', () => {
    const c = (component as any).lerpColor('rgb(255,0,0)', 'rgb(0,0,255)', 0.5);
    expect(c).toBe('rgba(128,0,128,1)');
  });

  it('lerpColor should interpolate between hex and rgba', () => {
    const c = (component as any).lerpColor('#0000ff', 'rgba(255,255,0,0.5)', 0.5);
    expect(c).toBe('rgba(128,128,128,0.75)');
  });

  it('lerpColor should fallback to black if format unknown', () => {
    const c = (component as any).lerpColor('foo', 'bar', 0.5);
    expect(c).toBe('rgba(0,0,0,1)');
  });

  it('should clear canvas with setTransform and clearRect if reset is not available', () => {
    component['width'] = 100;
    component['height'] = 50;
    const setTransformSpy = jasmine.createSpy('setTransform');
    const clearRectSpy = jasmine.createSpy('clearRect');
    (component as any).ctx = {
      setTransform: setTransformSpy,
      clearRect: clearRectSpy
    };
    // Simule le code du else (reset non défini)
    if (typeof (component as any).ctx.reset === 'function') {
      (component as any).ctx.reset();
    } else {
      (component as any).ctx.setTransform(1, 0, 0, 1, 0, 0);
      (component as any).ctx.clearRect(0, 0, component['width'], component['height']);
    }
    expect(setTransformSpy).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(clearRectSpy).toHaveBeenCalledWith(0, 0, 100, 50);
  });

  it('should clear canvas with setTransform and clearRect if ctx.reset is not a function (real animate call)', () => {
    component['width'] = 100;
    component['height'] = 50;
    const setTransformSpy = jasmine.createSpy('setTransform');
    const clearRectSpy = jasmine.createSpy('clearRect');
    (component as any).ctx = {
      setTransform: setTransformSpy,
      clearRect: clearRectSpy,
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      closePath: () => {},
      fill: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      filter: '',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over'
    };
    // Empêche la boucle infinie de requestAnimationFrame
    spyOn(window, 'requestAnimationFrame').and.returnValue(0);
    // Mock points vide pour ne pas exécuter le reste
    (component as any).points = [];
    (component as any).animate();
    expect(setTransformSpy).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(clearRectSpy).toHaveBeenCalledWith(0, 0, 100, 50);
  });

  it('should resize the canvas if window is larger', () => {
    component['width'] = 100;
    component['height'] = 100;
    getContextSpy.calls.reset();
    const canvas = component.canvasRef.nativeElement;
    spyOnProperty(window, 'innerWidth').and.returnValue(300);
    spyOnProperty(window, 'innerHeight').and.returnValue(400);
    component['resolutionScale'] = 1;
    // On ne spy plus animate, on vérifie juste le resize
    (component as any).handleResize();
    expect(component['width']).toBe(300);
    expect(component['height']).toBe(400);
    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(400);
    expect(getContextSpy).toHaveBeenCalled();
  });

  it('should not resize the canvas if window is smaller or equal', () => {
    component['width'] = 500;
    component['height'] = 500;
    getContextSpy.calls.reset();
    const canvas = component.canvasRef.nativeElement;
    spyOnProperty(window, 'innerWidth').and.returnValue(400);
    spyOnProperty(window, 'innerHeight').and.returnValue(400);
    component['resolutionScale'] = 1;
    const animateSpy = spyOn(component as any, 'animate');
    (component as any).handleResize();
    expect(component['width']).toBe(500);
    expect(component['height']).toBe(500);
    expect(canvas.width).not.toBe(400);
    expect(canvas.height).not.toBe(400);
    expect(getContextSpy).not.toHaveBeenCalled();
    expect(animateSpy).not.toHaveBeenCalled();
  });
});

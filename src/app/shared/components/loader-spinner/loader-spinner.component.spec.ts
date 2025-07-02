import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoaderSpinnerComponent } from './loader-spinner.component';

describe('LoaderSpinnerComponent', () => {
  let component: LoaderSpinnerComponent;
  let fixture: ComponentFixture<LoaderSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderSpinnerComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(LoaderSpinnerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize rows, cols, delays and start interval on ngOnInit', () => {
    spyOn(window, 'setInterval').and.callThrough();
    component.ngOnInit();
    expect(component.rows.length).toBe(component.gridSize);
    expect(component.cols.length).toBe(component.gridSize);
    expect(component.delays.length).toBe(component.gridSize);
    expect(component.intervalId).toBeTruthy();
  });

  it('should clear interval on ngOnDestroy', () => {
    component.ngOnInit();
    spyOn(window, 'clearInterval').and.callThrough();
    component.ngOnDestroy();
    expect(window.clearInterval).toHaveBeenCalledWith(component.intervalId);
  });

  it('getOpacity should return 1 or 0.3 depending on frame and coordinates', () => {
    component.frame = 0;
    expect(component.getOpacity(0, 0)).toBe(1);
    expect(component.getOpacity(1, 0)).toBe(0.3);
    component.frame = 1;
    expect(component.getOpacity(0, 0)).toBe(0.3);
    expect(component.getOpacity(1, 0)).toBe(1);
  });

  it('getDelay should return a string ending with s', () => {
    component.ngOnInit();
    const delay = component.getDelay(0, 0);
    expect(typeof delay).toBe('string');
    expect(delay.endsWith('s')).toBeTrue();
  });

  it('should increment frame every 350ms', fakeAsync(() => {
    component.ngOnInit();
    const initialFrame = component.frame;
    tick(350);
    expect(component.frame).toBe((initialFrame + 1) % 2);
    component.ngOnDestroy();
  }));
});

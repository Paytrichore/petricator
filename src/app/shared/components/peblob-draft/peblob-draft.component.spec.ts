import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeblobDraftComponent } from './peblob-draft.component';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('PeblobDraftComponent', () => {
  let component: PeblobDraftComponent;
  let fixture: ComponentFixture<PeblobDraftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeblobDraftComponent],
      providers: [provideAnimations()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeblobDraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedPeblob when selectPeblob is called', () => {
    const fakePeblob = [[{ r: 1, g: 2, b: 3 }], [{ r: 4, g: 5, b: 6 }], [{ r: 7, g: 8, b: 9 }]];
    component.selectPeblob(fakePeblob);
    expect(component.selectedPeblob).toBe(fakePeblob);
  });

  it('should disable the button if no Peblob is selected', () => {
    component.selectedPeblob = undefined;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });

  it('should enable the button if a Peblob is selected', () => {
    const fakePeblob = [[{ r: 1, g: 2, b: 3 }], [{ r: 4, g: 5, b: 6 }], [{ r: 7, g: 8, b: 9 }]];
    component.selectedPeblob = fakePeblob;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeFalse();
  });

  it('should call confirmSelection and log when button is clicked', () => {
    const fakePeblob = [[{ r: 1, g: 2, b: 3 }], [{ r: 4, g: 5, b: 6 }], [{ r: 7, g: 8, b: 9 }]];
    component.selectedPeblob = fakePeblob;
    fixture.detectChanges();
    spyOn(component, 'confirmSelection');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.confirmSelection).toHaveBeenCalled();
  });

  it('should log the selectedPeblob when confirmSelection is called', () => {
    const fakePeblob = [[{ r: 1, g: 2, b: 3 }], [{ r: 4, g: 5, b: 6 }], [{ r: 7, g: 8, b: 9 }]];
    component.selectedPeblob = fakePeblob;
    const logSpy = spyOn(console, 'log');
    component.confirmSelection();
    expect(logSpy).toHaveBeenCalledWith(
      'Peblob confirmé : TODO PeblobAPI add Peblob, link to user, etc...',
      fakePeblob
    );
  });
});

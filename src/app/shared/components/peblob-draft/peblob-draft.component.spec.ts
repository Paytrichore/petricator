import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeblobDraftComponent } from './peblob-draft.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';
import { TranslateService } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import { userStoreMock } from '../../../tests/mocks/user.mock';

describe('PeblobDraftComponent', () => {
  let component: PeblobDraftComponent;
  let fixture: ComponentFixture<PeblobDraftComponent>;
  const fakePeblob = [[{ r: 1, g: 2, b: 3 }], [{ r: 4, g: 5, b: 6 }], [{ r: 7, g: 8, b: 9 }]];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeblobDraftComponent],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        provideAnimations(),
        provideMockStore(userStoreMock)
      ]
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
    component.selectedPeblob = fakePeblob;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeFalse();
  });

  it('should call confirmSelection and log when button is clicked', () => {
    component.selectedPeblob = fakePeblob;
    fixture.detectChanges();
    spyOn(component, 'confirmSelection');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.confirmSelection).toHaveBeenCalled();
  });

  it('should dispatch createPeblob and emit draftDone when confirmSelection is called', (done) => {
    component.selectedPeblob = fakePeblob;
    (component as any).userId = 'user123';
    spyOn((component as any).store, 'dispatch');
    spyOn(component.draftDone, 'emit');

    component.confirmSelection();

    expect(component.draftAnimState).toBe('clicked');
    expect((component as any).store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      userId: 'user123',
      structure: fakePeblob
    }));

    setTimeout(() => {
      expect(component.draftDone.emit).toHaveBeenCalledWith(true);
      done();
    }, 450);
  });

  it('should not dispatch or emit if selectedPeblob is undefined', () => {
  component.selectedPeblob = undefined;
  (component as any).userId = 'user123';
  spyOn((component as any).store, 'dispatch');
  spyOn(component.draftDone, 'emit');

  component.confirmSelection();

  expect((component as any).store.dispatch).not.toHaveBeenCalled();
  expect(component.draftDone.emit).not.toHaveBeenCalled();
});

it('should not dispatch or emit if userId is undefined', () => {
  component.selectedPeblob = fakePeblob;
  (component as any).userId = undefined;
  spyOn((component as any).store, 'dispatch');
  spyOn(component.draftDone, 'emit');

  component.confirmSelection();

  expect((component as any).store.dispatch).not.toHaveBeenCalled();
  expect(component.draftDone.emit).not.toHaveBeenCalled();
});
});

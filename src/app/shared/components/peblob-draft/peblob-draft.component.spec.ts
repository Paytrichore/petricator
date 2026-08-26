import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeblobDraftComponent } from './peblob-draft.component';
import { GeneratedPeblob, Tint } from '../../interfaces/peblob';
import { provideAnimations } from '@angular/platform-browser/animations';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../services/message/message.service';
import { PeblobService } from '../../../services/peblob/peblob.service';
import { DraftStatus, DraftSession } from '../../../core/stores/peblob/peblob.model';
import { of } from 'rxjs';

describe('PeblobDraftComponent', () => {
  let component: PeblobDraftComponent;
  let fixture: ComponentFixture<PeblobDraftComponent>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let peblobServiceSpy: jasmine.SpyObj<PeblobService>;
  const fakePeblob: GeneratedPeblob = {
    structure: [[{ r: 1, g: 2, b: 3 }], [{ r: 4, g: 5, b: 6 }], [{ r: 7, g: 8, b: 9 }]],
    dominantColor: Tint.ORANGE,
  };
  const draftSession: DraftSession = {
    _id: 'draft-1',
    userId: 'user-1',
    question: { situation: 's', choices: [] },
    choices: [fakePeblob, fakePeblob, fakePeblob],
    status: DraftStatus.IN_PROGRESS,
  };

  beforeEach(async () => {
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['openSnackBar']);
    peblobServiceSpy = jasmine.createSpyObj('PeblobService', ['selectDraft']);
    peblobServiceSpy.selectDraft.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [PeblobDraftComponent],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: PeblobService, useValue: peblobServiceSpy },
        provideAnimations(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeblobDraftComponent);
    component = fixture.componentInstance;
    component.draftSession = draftSession;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedPeblob when selectPeblob is called', () => {
    component.selectPeblob(fakePeblob, 0);
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

  it('should select the chosen draft and emit draftDone on success', () => {
    component.selectPeblob(fakePeblob, 1);
    spyOn(component.draftDone, 'emit');

    component.confirmSelection();

    expect(component.draftAnimState).toBe('clicked');
    expect(peblobServiceSpy.selectDraft).toHaveBeenCalledWith('draft-1', 1);

    expect(messageServiceSpy.openSnackBar).toHaveBeenCalledWith('Le péblob a été capturé.');
    expect(component.draftDone.emit).toHaveBeenCalledWith(true);
  });

  it('should not select or emit if selectedPeblob is undefined', () => {
  component.selectedPeblob = undefined;
  spyOn(component.draftDone, 'emit');

  component.confirmSelection();

  expect(peblobServiceSpy.selectDraft).not.toHaveBeenCalled();
  expect(component.draftDone.emit).not.toHaveBeenCalled();
});

});

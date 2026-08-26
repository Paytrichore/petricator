import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AdventureComponent } from './adventure.component';
import { PeblobService } from '../../../services/peblob/peblob.service';
import { DraftStatus, DraftSession } from '../../../core/stores/peblob/peblob.model';
import { Story } from '../../../shared/interfaces/story';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';

describe('AdventureComponent', () => {
  let component: AdventureComponent;
  let fixture: ComponentFixture<AdventureComponent>;
  let peblobService: jasmine.SpyObj<PeblobService>;

  beforeEach(async () => {
    const draftSession: DraftSession = {
      _id: 'draft-1',
      userId: 'user-1',
      question: { situation: 's', choices: [] },
      choices: [],
      status: DraftStatus.IN_PROGRESS,
    };

    peblobService = jasmine.createSpyObj('PeblobService', ['startDraft', 'answerDraft']);
    peblobService.startDraft.and.returnValue(of(draftSession));
    peblobService.answerDraft.and.callFake((_draftId, choice) => of({
      ...draftSession,
      story: choice,
      choices: [],
    }));

    await TestBed.configureTestingModule({
      imports: [AdventureComponent],
      providers: [
        { provide: PeblobService, useValue: peblobService },
        { provide: TranslateService, useValue: translateServiceMock },
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdventureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start a draft when a story is ready', fakeAsync(() => {
    const question: Story = { situation: 's', choices: [{ color: 'orange', action: 'a', result: 'r' }] };
    component.userId = 'user-1';

    component.onStoryReady(question);
    tick();

    expect(component.storyDone).toBeFalse();
    expect(peblobService.startDraft).toHaveBeenCalledWith('user-1', question);
  }));

  it('should keep story result after choice selection', fakeAsync(() => {
    const choice = { color: 'orange', action: 'a', result: 'Le resultat' };
    component.userId = 'user-1';
    component.draftSession = {
      _id: 'draft-1',
      userId: 'user-1',
      question: { situation: 's', choices: [choice] },
      choices: [],
      status: DraftStatus.IN_PROGRESS,
    };

    component.onChoiceSelected(choice);
    tick();

    expect(component.story?.result).toBe('Le resultat');
  }));
});

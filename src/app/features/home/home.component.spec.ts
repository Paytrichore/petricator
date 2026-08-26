import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectUser, selectIsHydrating } from '../../core/stores/user/user.selectors';
import { provideAnimations } from '@angular/platform-browser/animations';
import { userMock } from '../../tests/mocks/user.mock';
import { User } from '../../core/stores/user/user.model';
import { fakeAsync, tick } from '@angular/core/testing';
import { PeblobService } from '../../services/peblob/peblob.service';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: selectUser,
              value: userMock,
            },
            {
              selector: selectIsHydrating,
              value: false,
            }
          ]
        }),
        {
          provide: PeblobService,
          useValue: { getCurrentDraft: () => of(null) },
        },
        provideAnimations()
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display adventure when showAdventure is called', () => {
    component.showAdventure();

    expect(component.isAdventureVisible).toBeTrue();
  });

  it('should show the status skeleton while refreshing after draft completion', () => {
    component.isDraftLoading = false;

    component.onDraftDone();

    expect(component.isDraftLoading).toBeTrue();
    expect(component.isAdventureVisible).toBeFalse();
  });

  it('should compute a real-time countdown from nextDLA for drafted users', fakeAsync(() => {
    const draftedUser: User = {
      ...userMock,
      drafted: true,
      nextDLA: new Date(Date.now() + 3665000).toISOString(),
    };

    store.overrideSelector(selectUser, draftedUser);
    store.refreshState();
    tick(0);

    expect(component.countdown.hours).toBe(1);
    expect(component.countdown.minutes).toBe(1);
    expect(component.countdown.seconds).toBe(5);
  }));

  it('should decrement countdown every second', fakeAsync(() => {
    const draftedUser: User = {
      ...userMock,
      drafted: true,
      nextDLA: new Date(Date.now() + 5000).toISOString(),
    };

    store.overrideSelector(selectUser, draftedUser);
    store.refreshState();
    tick(0);

    const firstSecond = component.countdown.seconds;

    tick(1000);

    expect(component.countdown.seconds).toBe(firstSecond - 1);
  }));

  it('should fallback to timeUntilNextDLA when nextDLA is invalid', fakeAsync(() => {
    const draftedUser: User = {
      ...userMock,
      drafted: true,
      nextDLA: 'invalid-date',
      timeUntilNextDLA: {
        hours: 0,
        minutes: 1,
      },
    };

    store.overrideSelector(selectUser, draftedUser);
    store.refreshState();
    tick(0);

    expect(component.countdown.hours).toBe(0);
    expect(component.countdown.minutes).toBe(1);
    expect(component.countdown.seconds).toBe(0);
  }));

  it('should complete destroy$ on ngOnDestroy', () => {
    const nextSpy = spyOn((component as any).destroy$, 'next').and.callThrough();
    const completeSpy = spyOn((component as any).destroy$, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
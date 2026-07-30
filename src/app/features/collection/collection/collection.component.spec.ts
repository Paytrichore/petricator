import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionComponent } from './collection.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectPeblobs } from '../../../core/stores/peblob/peblob.selectors';
import { ComposedPeblob } from '../../../shared/interfaces/peblob';
import { mockPeblobs } from '../../../tests/mocks/peblob.mock';
import { selectUser } from '../../../core/stores/user/user.selectors';
import * as PeblobActions from '../../../core/stores/peblob/peblob.actions';

describe('CollectionComponent', () => {
  let component: CollectionComponent;
  let fixture: ComponentFixture<CollectionComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionComponent],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: selectPeblobs,
              value: [
                { structure: mockPeblobs[0] },
                { structure: mockPeblobs[1] }
              ]
            },
            {
              selector: selectUser,
              value: {
                _id: 'user-123',
                username: 'camille',
                email: 'camille@example.com',
                actionPoints: 0,
                nextDLA: '',
                drafted: false,
                timeUntilNextDLA: {
                  hours: 0,
                  minutes: 0,
                },
              }
            }
          ]
        })
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose peblobs$ as an observable of ComposedPeblob[]', (done) => {
    component.peblobs$.subscribe(peblobs => {
      expect(peblobs).toEqual(mockPeblobs);
      done();
    });
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const spy = spyOn(component['destroy$'], 'next');
    const spyComplete = spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });

  it('should dispatch peblob load on init when user exists', () => {
    expect(store.dispatch).toHaveBeenCalledWith(
      PeblobActions.loadPeblobsByUserIds({ userId: 'user-123' })
    );
  });
});
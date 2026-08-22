import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CollectionComponent } from './collection.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectPeblobs, selectPeblobsTotal } from '../../../core/stores/peblob/peblob.selectors';
import { PeblobEntity } from '../../../core/stores/peblob/peblob.model';
import { mockPeblobs } from '../../../tests/mocks/peblob.mock';
import { selectUser } from '../../../core/stores/user/user.selectors';
import * as PeblobActions from '../../../core/stores/peblob/peblob.actions';
import { PeblobComponent } from '../../../shared/components/peblob/peblob.component';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceMock } from '../../../tests/mocks/translate.service.mock';
import { of } from 'rxjs';

describe('CollectionComponent', () => {
  let component: CollectionComponent;
  let fixture: ComponentFixture<CollectionComponent>;
  let store: MockStore;
  const collectionPeblobs: PeblobEntity[] = [
    {
      _id: 'peblob-1',
      userId: 'user-123',
      structure: mockPeblobs[0],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      _id: 'peblob-2',
      userId: 'user-123',
      structure: mockPeblobs[1],
      createdAt: new Date('2026-01-02'),
      updatedAt: new Date('2026-01-02')
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionComponent],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: selectPeblobs,
              value: collectionPeblobs
            },
            {
              selector: selectPeblobsTotal,
              value: collectionPeblobs.length
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
        }),
        { provide: TranslateService, useValue: translateServiceMock }
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

  it('should expose peblobs$ as an observable of PeblobEntity[]', (done) => {
    component.peblobs$.subscribe(peblobs => {
      expect(peblobs).toEqual(collectionPeblobs);
      done();
    });
  });

  it('should reuse rendered peblobs when refreshed entities keep the same ids', () => {
    const initialComponents = fixture.debugElement
      .queryAll(By.directive(PeblobComponent))
      .map(({ componentInstance }) => componentInstance);
    const refreshedPeblobs = collectionPeblobs.map((peblob) => ({
      ...peblob,
      structure: peblob.structure.map((row) => row.map((pixel) => ({ ...pixel })))
    }));

    store.overrideSelector(selectPeblobs, refreshedPeblobs);
    store.refreshState();
    fixture.detectChanges();

    const refreshedComponents = fixture.debugElement
      .queryAll(By.directive(PeblobComponent))
      .map(({ componentInstance }) => componentInstance);

    refreshedComponents.forEach((refreshedComponent, index) => {
      expect(refreshedComponent).toBe(initialComponents[index]);
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
      PeblobActions.loadPeblobsByUserIds({
        userId: 'user-123',
        page: 1,
        pageSize: 20,
        color: undefined,
        sortOrder: 'desc',
        status: undefined,
      })
    );
  });

  it('should dispatch a rename action when saving a name', () => {
    component.saveName(collectionPeblobs[0], '  Blue  ');

    expect(store.dispatch).toHaveBeenCalledWith(
      PeblobActions.renamePeblob({
        peblobId: 'peblob-1',
        name: '  Blue  ',
      })
    );
  });
});
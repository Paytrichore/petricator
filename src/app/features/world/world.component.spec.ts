import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { WorldComponent } from './world.component';
import { selectAllCells, selectIsConnected, selectWorldError, selectWorldLoading } from '../../core/stores/world/world.selectors';
import { selectMapPeblobs, selectPeblobs } from '../../core/stores/peblob/peblob.selectors';
import { selectUser } from '../../core/stores/user/user.selectors';
import * as WorldActions from '../../core/stores/world/world.actions';
import { mockCell } from '../../tests/mocks/world.mock';
import { mockPeblob } from '../../tests/mocks/peblob.mock';
import { MessageService } from '../../services/message/message.service';
import { ActionsSubject } from '@ngrx/store';
import { take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { translateServiceMock } from '../../tests/mocks/translate.service.mock';
import { userMock } from '../../tests/mocks/user.mock';

describe('WorldComponent', () => {
  let component: WorldComponent;
  let fixture: ComponentFixture<WorldComponent>;
  let store: MockStore;
  let actionsSubject: ActionsSubject;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    messageService = jasmine.createSpyObj('MessageService', ['openSnackBar']);
    await TestBed.configureTestingModule({
      imports: [WorldComponent],
      providers: [
        { provide: MessageService, useValue: messageService },
        { provide: TranslateService, useValue: translateServiceMock },
        provideMockStore({
          selectors: [
            { selector: selectAllCells, value: [mockCell] },
            { selector: selectIsConnected, value: true },
            { selector: selectWorldLoading, value: false },
            { selector: selectWorldError, value: null },
            { selector: selectPeblobs, value: [] },
            { selector: selectUser, value: userMock },
            { selector: selectMapPeblobs, value: [] }
          ]
        })
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    actionsSubject = TestBed.inject(ActionsSubject);
    spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(WorldComponent);
    component = fixture.componentInstance;
    spyOn(localStorage, 'getItem').and.returnValue('token-123');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should connect and load the snapshot on init', () => {
    const dispatchCalls = (store.dispatch as jasmine.Spy).calls.allArgs();
    expect(dispatchCalls[0][0]).toEqual(WorldActions.connectWs({ token: 'token-123' }));
    expect(dispatchCalls[1][0]).toEqual(WorldActions.loadSnapshot());
  });

  it('should disconnect the websocket on destroy', () => {
    fixture.destroy();
    expect(store.dispatch).toHaveBeenCalledWith(WorldActions.disconnectWs());
  });

  it('should dispatch the selected peblob placement', () => {
    component.selectCell({ x: 3, y: 0, occupied: false, clientX: 120, clientY: 80 });
    component.placementPeblobControl.setValue(mockPeblob);

    component.placePeblob();

    expect(store.dispatch).toHaveBeenCalledWith(WorldActions.placeOnCell({
      x: 3,
      y: 0,
      peblobIds: [mockPeblob._id]
    }));
    expect(component.selectedCell?.x).toBe(3);
    expect(component.selectedCell?.y).toBe(0);
  });

  it('should mark an occupied cell so placement can be disabled', () => {
    component.selectCell({ x: 3, y: 0, occupied: true, clientX: 120, clientY: 80 });

    expect(component.selectedCellOccupied).toBeTrue();
  });

  it('should ignore cell tooltips while the context menu is open', () => {
    const hideTooltip = spyOn(component, 'hideCellTooltip');

    component.onContextMenuOpened();

    expect(component.contextMenuOpen).toBeTrue();
    expect(hideTooltip).toHaveBeenCalled();
  });

  it('should stop ignoring cell tooltips after the context menu closes', () => {
    const hideTooltip = spyOn(component, 'hideCellTooltip');

    component.onContextMenuOpened();
    component.onContextMenuClosed();

    expect(component.contextMenuOpen).toBeFalse();
    expect(hideTooltip).toHaveBeenCalledTimes(2);
  });

  it('should not allow placement when no free peblob is available', (done) => {
    component.canPlace$.pipe(take(1)).subscribe(canPlace => {
      expect(canPlace).toBeFalse();
      done();
    });
  });

  it('should not allow placement when the user has fewer than two action points', (done) => {
    store.overrideSelector(selectPeblobs, [mockPeblob]);
    store.overrideSelector(selectUser, { ...userMock, actionPoints: 1 });
    store.refreshState();

    component.canPlace$.pipe(take(1)).subscribe(canPlace => {
      expect(canPlace).toBeFalse();
      done();
    });
  });

  it('should exclude peblobs already placed on the map', (done) => {
    const availablePeblob = { ...mockPeblob, _id: 'available-peblob' };
    store.overrideSelector(selectPeblobs, [mockPeblob, availablePeblob]);
    store.overrideSelector(selectAllCells, [{ ...mockCell, occupants: [mockPeblob._id] }]);
    store.refreshState();

    component.filteredPeblobs$.pipe(take(1)).subscribe(peblobs => {
      expect(peblobs).toEqual([availablePeblob]);
      done();
    });
  });

  it('should close placement and show a success message after placement succeeds', () => {
    component.selectCell({ x: 3, y: 0, occupied: false, clientX: 120, clientY: 80 });
    component.placementPeblobControl.setValue(mockPeblob);
    component.placePeblob();

    actionsSubject.next(WorldActions.placeOnCellSuccess());

    expect(messageService.openSnackBar).toHaveBeenCalledWith('Le péblob a été placé sur la carte.');
    expect(component.selectedCell).toBeNull();
    expect(component.placementFormOpen).toBeFalse();
  });

  it('should show a translated error and keep placement open after a placement failure', () => {
    component.selectCell({ x: 3, y: 0, occupied: false, clientX: 120, clientY: 80 });
    component.placementPeblobControl.setValue(mockPeblob);
    component.placePeblob();

    actionsSubject.next(WorldActions.placeOnCellFailure({
      error: { code: 'INSUFFICIENT_ACTION_POINTS', status: 422 }
    }));

    expect(messageService.openSnackBar).toHaveBeenCalledWith('Erreur', true);
    expect(messageService.openSnackBar).not.toHaveBeenCalledWith(
      jasmine.stringMatching(/url|status|HttpErrorResponse/i),
      true
    );
    expect(component.placementPending).toBeFalse();
    expect(component.selectedCell).not.toBeNull();
  });

  it('should show a generic translated message for snapshot failures', () => {
    actionsSubject.next(WorldActions.loadSnapshotFailure({
      error: { code: 'WORLD_LOAD_FAILED', status: 502 }
    }));

    expect(messageService.openSnackBar).toHaveBeenCalledWith('Erreur', true);
  });
});

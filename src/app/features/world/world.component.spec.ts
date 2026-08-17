import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { WorldComponent } from './world.component';
import { selectAllCells, selectIsConnected, selectWorldError, selectWorldLoading } from '../../core/stores/world/world.selectors';
import { selectPeblobs } from '../../core/stores/peblob/peblob.selectors';
import * as WorldActions from '../../core/stores/world/world.actions';
import { mockCell } from '../../tests/mocks/world.mock';
import { mockPeblob } from '../../tests/mocks/peblob.mock';
import { MessageService } from '../../services/message/message.service';
import { ActionsSubject } from '@ngrx/store';

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
        provideMockStore({
          selectors: [
            { selector: selectAllCells, value: [mockCell] },
            { selector: selectIsConnected, value: true },
            { selector: selectWorldLoading, value: false },
            { selector: selectWorldError, value: null },
            { selector: selectPeblobs, value: [] }
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
    component.selectCell({ x: 3, y: 0, clientX: 120, clientY: 80 });
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

  it('should close placement and show a success message after placement succeeds', () => {
    component.selectCell({ x: 3, y: 0, clientX: 120, clientY: 80 });
    component.placementPeblobControl.setValue(mockPeblob);
    component.placePeblob();

    actionsSubject.next(WorldActions.placeOnCellSuccess());

    expect(messageService.openSnackBar).toHaveBeenCalledWith('Le péblob a été placé sur la carte.');
    expect(component.selectedCell).toBeNull();
    expect(component.placementFormOpen).toBeFalse();
  });
});

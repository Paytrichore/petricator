import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { WorldComponent } from './world.component';
import { selectAllCells, selectIsConnected, selectWorldLoading } from '../../core/stores/world/world.selectors';
import * as WorldActions from '../../core/stores/world/world.actions';
import { mockCell } from '../../tests/mocks/world.mock';

describe('WorldComponent', () => {
  let component: WorldComponent;
  let fixture: ComponentFixture<WorldComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAllCells, value: [mockCell] },
            { selector: selectIsConnected, value: true },
            { selector: selectWorldLoading, value: false }
          ]
        })
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(WorldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadSnapshot', () => {
    component.loadSnapshot();
    expect(store.dispatch).toHaveBeenCalledWith(WorldActions.loadSnapshot());
  });

  it('should dispatch disconnectWs', () => {
    component.disconnectWs();
    expect(store.dispatch).toHaveBeenCalledWith(WorldActions.disconnectWs());
  });

  it('should dispatch connectWs with the stored token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('token-123');
    component.connectWs();
    expect(store.dispatch).toHaveBeenCalledWith(WorldActions.connectWs({ token: 'token-123' }));
  });

  it('should not dispatch connectWs when no token is stored', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.connectWs();
    expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: WorldActions.connectWs.type }));
  });

  it('should dispatch cellUpdated with a normalized cell from the form', () => {
    component.cellUpdateForm.setValue({ x: 3, y: 4, occupants: 'a, b' });
    component.simulateCellUpdate();

    const [action] = (store.dispatch as jasmine.Spy).calls.mostRecent().args;
    expect(action.type).toBe(WorldActions.cellUpdated.type);
    expect(action.cell.x).toBe(3);
    expect(action.cell.y).toBe(4);
    expect(action.cell.occupants).toEqual(['a', 'b']);
  });

  it('should not dispatch cellUpdated when the form is invalid', () => {
    component.cellUpdateForm.setValue({ x: null, y: 4, occupants: '' });
    component.simulateCellUpdate();
    expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: WorldActions.cellUpdated.type }));
  });
});

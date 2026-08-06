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
});

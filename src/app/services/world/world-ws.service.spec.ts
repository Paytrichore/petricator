import { WorldWsService } from './world-ws.service';
import { Cell } from '../../shared/interfaces/world.interface';

describe('WorldWsService', () => {
  let service: WorldWsService;
  let mockSocket: { on: jasmine.Spy; emit: jasmine.Spy; disconnect: jasmine.Spy; removeAllListeners: jasmine.Spy };
  let handlers: Record<string, (...args: unknown[]) => void>;
  let socketFactorySpy: jasmine.Spy;

  beforeEach(() => {
    handlers = {};
    mockSocket = {
      on: jasmine.createSpy('on').and.callFake((event: string, cb: (...args: unknown[]) => void) => {
        handlers[event] = cb;
      }),
      emit: jasmine.createSpy('emit'),
      disconnect: jasmine.createSpy('disconnect'),
      removeAllListeners: jasmine.createSpy('removeAllListeners')
    };
    socketFactorySpy = jasmine.createSpy('socketFactory').and.returnValue(mockSocket);
    service = new WorldWsService();
    (service as unknown as { socketFactory: unknown }).socketFactory = socketFactorySpy;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect with the given token', () => {
    service.connect('token-123');
    expect(socketFactorySpy).toHaveBeenCalledWith(jasmine.any(String), {
      auth: { token: 'token-123' },
      reconnection: true
    });
  });

  it('should not open a second connection if already connected', () => {
    service.connect('token-123');
    service.connect('token-456');
    expect(socketFactorySpy).toHaveBeenCalledTimes(1);
  });

  it('should emit received cell updates on cellUpdates$', () => {
    service.connect('token-123');
    const cell: Cell = { _id: '1', x: 0, y: 0, occupants: [], createdAt: '', updatedAt: '' };
    const received: Cell[] = [];
    service.cellUpdates$.subscribe(c => received.push(c));

    handlers['cell:update'](cell);

    expect(received).toEqual([cell]);
  });

  it('should emit true/false on connectionStatus$ for connect/disconnect socket events', () => {
    service.connect('token-123');
    const statuses: boolean[] = [];
    service.connectionStatus$.subscribe(s => statuses.push(s));

    handlers['connect']();
    handlers['disconnect']();

    expect(statuses).toEqual([true, false]);
  });

  it('should disconnect and clear the socket reference without leaking listeners', () => {
    service.connect('token-123');
    service.disconnect();

    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();

    // second call is a no-op since the internal reference was cleared
    service.disconnect();
    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when keepAlive is called without an active connection', () => {
    service.keepAlive();
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('should ping once immediately after connecting', () => {
    service.connect('token-123');
    service.keepAlive();
    expect(mockSocket.emit).toHaveBeenCalledWith('ping');
  });

  it('should not ping again before 55 minutes have elapsed', () => {
    const baseTime = 1_700_000_000_000;
    spyOn(Date, 'now').and.returnValue(baseTime);
    service.connect('token-123');
    service.keepAlive();
    mockSocket.emit.calls.reset();

    service.keepAlive();

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('should ping again once 55 minutes have elapsed', () => {
    const baseTime = 1_700_000_000_000;
    const nowSpy = spyOn(Date, 'now').and.returnValue(baseTime);
    service.connect('token-123');
    service.keepAlive();
    mockSocket.emit.calls.reset();

    nowSpy.and.returnValue(baseTime + 55 * 60 * 1000 + 1);
    service.keepAlive();

    expect(mockSocket.emit).toHaveBeenCalledWith('ping');
  });
});

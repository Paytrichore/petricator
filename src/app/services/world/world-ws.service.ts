import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cell } from '../../shared/interfaces/world.interface';

const KEEP_ALIVE_INTERVAL_MS = 55 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class WorldWsService {
  private readonly worldApiUrl = environment.worldApiUrl;
  // overridable in tests, since socket.io-client's `io` export cannot be spied on directly (frozen ESM namespace)
  private socketFactory: typeof io = io;
  private socket: Socket | null = null;
  private lastPingAt: number | null = null;

  private readonly cellUpdatesSubject = new Subject<Cell>();
  private readonly connectionStatusSubject = new Subject<boolean>();

  public readonly cellUpdates$: Observable<Cell> = this.cellUpdatesSubject.asObservable();
  public readonly connectionStatus$: Observable<boolean> = this.connectionStatusSubject.asObservable();

  public connect(token: string): void {
    if (this.socket) {
      return;
    }

    this.socket = this.socketFactory(this.worldApiUrl, {
      auth: { token },
      reconnection: true
    });

    this.socket.on('cell:update', (cell: Cell) => this.cellUpdatesSubject.next(cell));
    this.socket.on('connect', () => this.connectionStatusSubject.next(true));
    this.socket.on('disconnect', () => this.connectionStatusSubject.next(false));
  }

  public disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  // Only pings when the last one is older than 55 minutes, avoiding a dedicated timer to keep the GCP websocket alive.
  public keepAlive(): void {
    if (!this.socket) {
      return;
    }

    const now = Date.now();
    if (this.lastPingAt !== null && now - this.lastPingAt < KEEP_ALIVE_INTERVAL_MS) {
      return;
    }

    this.socket.emit('ping');
    this.lastPingAt = now;
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DraftUpdatedEvent {
  type: 'draft.updated';
  payload: {
    drafted: boolean;
    peblobId: string;
    eventId: string;
    status: 'processed' | 'duplicate';
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserEventsService {
  private source: EventSource | null = null;

  connect(token: string): Observable<DraftUpdatedEvent> {
    this.disconnect();

    const url = `${environment.userApiUrl}/users/events?token=${encodeURIComponent(token)}`;
    this.source = new EventSource(url);

    return new Observable<DraftUpdatedEvent>((observer) => {
      if (!this.source) {
        observer.complete();
        return;
      }

      this.source.onmessage = (event: MessageEvent<string>) => {
        try {
          const parsed = JSON.parse(event.data) as DraftUpdatedEvent;
          observer.next(parsed);
        } catch {
          // Ignore malformed payloads.
        }
      };

      this.source.onerror = () => {
        observer.error(new Error('SSE connection failed'));
      };

      return () => {
        this.disconnect();
      };
    });
  }

  disconnect(): void {
    if (this.source) {
      this.source.close();
      this.source = null;
    }
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cell } from '../../shared/interfaces/world.interface';

@Injectable({
  providedIn: 'root',
})
export class WorldService {
  constructor(private http: HttpClient) {}

  private readonly worldApiUrl = environment.worldApiUrl;

  public loadSnapshot(): Observable<Cell[]> {
    return this.http.get<Cell[]>(`${this.worldApiUrl}/world/snapshot`);
  }

  // Expects a matching POST /world/place-on-cell route in papi-world, backed by WorldService.placeOnCell(x, y, peblobId).
  public placeOnCell(x: number, y: number, peblobId: string): Observable<Cell> {
    return this.http.post<Cell>(`${this.worldApiUrl}/world/place-on-cell`, { x, y, peblobId });
  }
}

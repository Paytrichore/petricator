import { Injectable } from '@angular/core';
import { ComposedPeblob, GeneratedPeblob, Peblob, RGBEffect, Tint } from '../../shared/interfaces/peblob';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DraftSession, PeblobEntity, PeblobStatus } from '../../core/stores/peblob/peblob.model';
import { Story, StoryChoice } from '../../shared/interfaces/story';
import { PeblobPage } from '../../core/stores/peblob/peblob.model';

@Injectable({
  providedIn: 'root',
})
export class PeblobService {
  constructor(private http: HttpClient) {}

  private readonly peblobApiUrl = environment.peblobApiUrl;

  public createPeblob(userId: string, structure: ComposedPeblob, dominantColor?: Tint): Observable<PeblobEntity> {
    const body = {
      userId: userId,
      structure: structure,
      ...(dominantColor ? { dominantColor } : {})
    };
    
    return this.http.post<PeblobEntity>(`${this.peblobApiUrl}/peblob`, body);
  }

  public startDraft(userId: string, question: Story): Observable<DraftSession> {
    return this.http.post<DraftSession>(`${this.peblobApiUrl}/peblob/drafts`, { userId, question });
  }

  public answerDraft(draftId: string, choice: StoryChoice): Observable<DraftSession> {
    return this.http.post<DraftSession>(`${this.peblobApiUrl}/peblob/drafts/${draftId}/answer`, choice);
  }

  public getCurrentDraft(userId: string): Observable<DraftSession | null> {
    return this.http.get<DraftSession | null>(`${this.peblobApiUrl}/peblob/drafts/current/${userId}`);
  }

  public selectDraft(draftId: string, choiceIndex: number): Observable<PeblobEntity> {
    return this.http.post<PeblobEntity>(`${this.peblobApiUrl}/peblob/drafts/${draftId}/select`, { choiceIndex });
  }

  public loadPeblobsByUserId(userId: string, query: {
    page?: number;
    pageSize?: number;
    color?: Tint;
    sortOrder?: 'asc' | 'desc';
    status?: PeblobStatus;
  } = {}): Observable<PeblobPage> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PeblobPage>(`${this.peblobApiUrl}/peblob/user/${userId}`, { params });
  }

  public loadPeblobsByIds(peblobIds: string[]): Observable<PeblobEntity[]> {
    return this.http.post<PeblobEntity[]>(`${this.peblobApiUrl}/peblob/by-ids`, { ids: peblobIds });
  }

  public updatePeblobName(peblobId: string, name: string): Observable<PeblobEntity> {
    return this.http.patch<PeblobEntity>(`${this.peblobApiUrl}/peblob/${peblobId}`, {
      name: name.trim() || undefined,
    });
  }

  public applyStory(peblobId: string, storyId: string, effect: RGBEffect): Observable<PeblobEntity> {
    return this.http.post<PeblobEntity>(`${this.peblobApiUrl}/peblob/${peblobId}/stories`, {
      storyId,
      ...effect,
    });
  }

  public purchasePower(peblobId: string, powerId: string): Observable<PeblobEntity> {
    return this.http.post<PeblobEntity>(`${this.peblobApiUrl}/peblob/${peblobId}/powers`, { powerId });
  }

  public generatePeblob(tint?: Tint): GeneratedPeblob {
    const dominantColor = tint ?? this.randomTint();

    return {
      structure: this.composedPeblobGenerator(dominantColor),
      dominantColor,
    };
  }

  public composedPeblobGenerator(tint?: Tint): ComposedPeblob {
    tint ??= this.randomTint();

    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const composed: ComposedPeblob = [
      [
        this.makeColor(tint, rand(20, 40)),
        this.makeColor(tint, rand(10, 40)),
        this.makeColor(tint, rand(0, 40))
      ],
      [
        this.makeColor(tint, rand(10, 40)),
        this.makeColor(tint, rand(0, 40)),
        this.makeColor(tint, rand(0, 40))
      ],
      [
        this.makeColor(tint, rand(10, 40)),
        this.makeColor(tint, rand(0, 40)),
        this.makeColor(tint, rand(0, 40))
      ]
    ];

    return composed;
  }

  private randomTint(): Tint {
    const rand = Math.random();
    if (rand < 0.75) {
      const mainTints = [Tint.YELLOW, Tint.RED, Tint.BLUE];
      return mainTints[Math.floor(Math.random() * mainTints.length)];
    }

    if (rand < 0.95) {
      const secondaryTints = [Tint.PURPLE, Tint.GREEN, Tint.ORANGE];
      return secondaryTints[Math.floor(Math.random() * secondaryTints.length)];
    }

    return Tint.PINK;
  }

  // Helper pour générer une couleur dans la teinte
  private makeColor(tint: Tint, base: number): Peblob {
    const percent = (val: number, min: number, max: number) => Math.floor(val * (min + Math.random() * (max - min)));
    const low = () => Math.floor(Math.random() * 6);

    switch (tint) {
      case Tint.ORANGE:
        return { r: base, g: percent(base, 0.3, 0.6), b: low() };
      case Tint.PURPLE:
        return { r: base, g: percent(base, 0.2, 0.4), b: base };
      case Tint.PINK:
        return { r: base, g: percent(base, 0.2, 0.4), b: percent(base, 0.5, 0.8) };
      case Tint.YELLOW:
        return { r: base, g: percent(base, 0.8, 1), b: low() };
      case Tint.GREEN:
        return { r: percent(base, 0.2, 0.4), g: base, b: percent(base, 0.2, 0.4) };
      case Tint.BLUE:
        return { r: percent(base, 0.2, 0.4), g: percent(base, 0.2, 0.4), b: base };
      case Tint.RED:
        return { r: base, g: percent(base, 0.2, 0.4), b: percent(base, 0.2, 0.4) };
      default:
        return { r: base, g: base, b: base };
    }
  }
}

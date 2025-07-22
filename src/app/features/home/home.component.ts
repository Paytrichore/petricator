import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeblobComponent } from '../../shared/components/peblob/peblob.component';
import { ComposedPeblob, tintMap } from '../../shared/interfaces/peblob';
import { PeblobService } from '../../services/peblob/peblob.service';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { selectUser } from '../../core/stores/user/user.selectors';
import { User } from '../../core/stores/user/user.types';
import { AsyncPipe } from '@angular/common';
import { StoryComponent } from "../../shared/components/story/story.component";
import { takeUntil } from 'rxjs/operators';
import { shuffleArray } from '../../shared/helpers/array.helpers';
import { MatButtonModule } from '@angular/material/button';
import { PeblobDraftComponent } from '../../shared/components/peblob-draft/peblob-draft.component';

@Component({
  selector: 'app-home',
  imports: [PeblobComponent, AsyncPipe, StoryComponent, MatButtonModule, PeblobDraftComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  public peblob!: Array<ComposedPeblob>;
  public peblobDraft!: Array<ComposedPeblob>;
  public user$!: Observable<User | null>;
  public storyDone = false;
  public story?: any;
  private destroy$ = new Subject<void>();

  constructor(private peblobService: PeblobService, private store: Store) {}

  ngOnInit(): void {
    this.user$ = this.store.select(selectUser);
    this.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user && user.peblobs && user.peblobs.length > 0) {
        this.peblob = user.peblobs;
      }
    });
  }

  onChoiceSelected(choice: { color: string; action: string; result: string }) {
    this.peblobDraft = [
      this.peblobService.composedPeblobGenerator(tintMap[choice.color.toLowerCase()]),
      this.peblobService.composedPeblobGenerator(),
      this.peblobService.composedPeblobGenerator()
    ];
    this.peblobDraft = shuffleArray(this.peblobDraft);
    this.storyDone = true;
    this.story = choice;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

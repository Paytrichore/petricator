import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComposedPeblob, tintMap } from '../../shared/interfaces/peblob';
import { PeblobService } from '../../services/peblob/peblob.service';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { selectUser } from '../../core/stores/user/user.selectors';
import { User } from '../../core/stores/user/user.model';
import { AsyncPipe } from '@angular/common';
import { StoryComponent } from "../../shared/components/story/story.component";
import { shuffleArray } from '../../shared/helpers/array.helpers';
import { MatButtonModule } from '@angular/material/button';
import { PeblobDraftComponent } from '../../shared/components/peblob-draft/peblob-draft.component';
import { MatIconModule } from '@angular/material/icon';
import { ActionCheckedComponent } from '../../shared/components/action-checked/action-checked.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [
    ActionCheckedComponent,
    PeblobDraftComponent,
    StoryComponent,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    AsyncPipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  public peblobs$!: Observable<ComposedPeblob[]>;
  public peblobDraft!: Array<ComposedPeblob>;
  public user$!: Observable<User | null>;
  public storyDone = false;
  public story?: any;
  public draftDone = false;
  private destroy$ = new Subject<void>();

  constructor(private peblobService: PeblobService, private store: Store) {}

  ngOnInit(): void {
    this.user$ = this.store.select(selectUser);
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

  onDraftDone(draftDone: boolean) {
    this.draftDone = draftDone;
    console.log('Draft done:', this.draftDone);
  }
}

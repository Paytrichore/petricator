import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ComposedPeblob } from '../../interfaces/peblob';
import { PeblobComponent } from '../peblob/peblob.component';
import { MatButtonModule } from '@angular/material/button';
import { sequencedFadeInAnimation } from '../../animations/sequenced-fade-in.animation';
import { TranslateModule } from '@ngx-translate/core';
import { PeblobService } from '../../../services/peblob/peblob.service';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../core/stores/user/user.selectors';
import * as PeblobActions from '../../../core/stores/peblob/peblob.actions';

@Component({
  selector: 'app-peblob-draft',
  imports: [PeblobComponent, MatButtonModule, TranslateModule],
  templateUrl: './peblob-draft.component.html',
  styleUrl: './peblob-draft.component.scss',
  animations: [
    sequencedFadeInAnimation('.peblob-draft__result', '.peblob-draft__event')
  ]
})
export class PeblobDraftComponent implements OnDestroy, OnInit {
  constructor(private store: Store) {}

  @Input() peblobDraft!: Array<ComposedPeblob>;
  @Output() draftDone = new EventEmitter<boolean>();

  public selectedPeblob?: ComposedPeblob;
  public draftAnimState: 'default' | 'clicked' = 'default';
  private userId?: string;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userId = user?._id;
      });
  }

  public selectPeblob(peblob: ComposedPeblob) {
    this.selectedPeblob = peblob;
  }

  public confirmSelection() {
    if (!this.selectedPeblob) return;
    if (!this.userId) return;

    this.draftAnimState = 'clicked';
    this.store.dispatch(PeblobActions.createPeblob({
      userId: this.userId,
      structure: this.selectedPeblob
    }));

    setTimeout(() => {
      this.draftDone.emit(true);
    }, 400);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

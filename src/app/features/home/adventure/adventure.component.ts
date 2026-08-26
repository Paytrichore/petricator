import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StoryComponent } from '../../../shared/components/story/story.component';
import { PeblobDraftComponent } from '../../../shared/components/peblob-draft/peblob-draft.component';
import { DraftSession } from '../../../core/stores/peblob/peblob.model';
import { Story, StoryChoice } from '../../../shared/interfaces/story';
import { PeblobService } from '../../../services/peblob/peblob.service';

@Component({
  selector: 'app-adventure',
  standalone: true,
  imports: [StoryComponent, PeblobDraftComponent],
  templateUrl: './adventure.component.html',
  styleUrl: './adventure.component.scss',
})
export class AdventureComponent implements OnInit {
  @Input() draftSession?: DraftSession;
  @Input() userId = '';
  @Output() draftDone = new EventEmitter<boolean>();

  public storyDone = false;
  public story?: DraftSession['story'];
  public question?: Story;

  constructor(
    private peblobService: PeblobService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.draftSession) {
      this.question = this.draftSession.question;
      this.story = this.draftSession.story;
      this.storyDone = this.draftSession.choices.length > 0;
    }
  }

  onStoryReady(question: Story): void {
    this.peblobService.startDraft(this.userId, question).subscribe({
      next: (draftSession) => setTimeout(() => {
        this.draftSession = draftSession;
        this.changeDetectorRef.detectChanges();
      }),
    });
  }

  onChoiceSelected(choice: StoryChoice): void {
    if (!this.draftSession) {
      return;
    }

    this.peblobService.answerDraft(this.draftSession._id, choice).subscribe({
      next: (draftSession) => setTimeout(() => {
        this.draftSession = draftSession;
        this.storyDone = true;
        this.story = draftSession.story;
        this.changeDetectorRef.detectChanges();
      }),
    });
  }
}

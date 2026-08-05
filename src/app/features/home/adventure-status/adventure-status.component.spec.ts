import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdventureStatusComponent } from './adventure-status.component';
import { userMock } from '../../../tests/mocks/user.mock';

describe('AdventureStatusComponent', () => {
  let component: AdventureStatusComponent;
  let fixture: ComponentFixture<AdventureStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdventureStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdventureStatusComponent);
    component = fixture.componentInstance;
    component.user = { ...userMock, drafted: false };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit ctaClicked when button is clicked', () => {
    const emitSpy = spyOn(component.ctaClicked, 'emit');

    component.onCtaClick();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should show skeleton when isHydrating is true', () => {
    component.isHydrating = true;
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('.skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('should show adventure message when not hydrating and user is not drafted', () => {
    component.user = { ...userMock, drafted: false };
    component.isHydrating = false;
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain('Une aventure te tend les bras !');
  });

  it('should show countdown text when user is drafted', () => {
    component.user = { ...userMock, drafted: true };
    component.isHydrating = false;
    component.countdown = { hours: 1, minutes: 2, seconds: 3 };

    fixture.detectChanges();

    const content = fixture.nativeElement.textContent as string;
    expect(content).toContain('Prochaine aventure dans');
    expect(content).toContain('1 heure');
    expect(content).toContain('2 minutes');
    expect(content).toContain('3 secondes');
  });
});


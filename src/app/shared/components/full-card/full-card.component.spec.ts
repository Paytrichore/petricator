import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FullCardComponent } from './full-card.component';

@Component({
  template: '<app-full-card><p class="projected">Contenu projete</p></app-full-card>',
  imports: [FullCardComponent],
})
class TestHostComponent {}

describe('FullCardComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should render projected content', () => {
    const projected = fixture.nativeElement.querySelector('.projected') as HTMLElement | null;

    expect(projected).not.toBeNull();
    expect(projected?.textContent).toContain('Contenu projete');
  });
});

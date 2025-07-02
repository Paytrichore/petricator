import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderDirective } from './loader.directive';
import { LoaderSpinnerComponent } from '../components/loader-spinner/loader-spinner.component';
import { By } from '@angular/platform-browser';
import { Injector } from '@angular/core';

@Component({
  template: `
    <button appLoader="loading" [appLoader]="loading">Bouton</button>
    <div appLoader [appLoader]="loading">Bloc</div>
  `,
  standalone: true,
  imports: [LoaderDirective, LoaderSpinnerComponent]
})
class TestHostComponent {
  loading = false;
}

describe('LoaderDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let buttonDe: DebugElement;
  let divDe: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    buttonDe = fixture.debugElement.query(By.css('button'));
    divDe = fixture.debugElement.query(By.css('div'));
  });

  it('should not show spinner by default', () => {
    expect(buttonDe.nativeElement.querySelector('app-loader-spinner')).toBeNull();
    expect(divDe.nativeElement.querySelector('app-loader-spinner')).toBeNull();
  });

  it('should show spinner and disable button when loading is true', () => {
    host.loading = true;
    fixture.detectChanges();
    expect(buttonDe.nativeElement.disabled).toBeTrue();
    expect(buttonDe.nativeElement.querySelector('app-loader-spinner')).not.toBeNull();
    expect(divDe.nativeElement.querySelector('app-loader-spinner')).not.toBeNull();
  });

  it('should restore button content and enable when loading is false', () => {
    host.loading = true;
    fixture.detectChanges();
    host.loading = false;
    fixture.detectChanges();
    expect(buttonDe.nativeElement.disabled).toBeFalse();
    expect(buttonDe.nativeElement.textContent).toContain('Bouton');
    expect(buttonDe.nativeElement.querySelector('app-loader-spinner')).toBeNull();
  });
});

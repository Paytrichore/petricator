import { requiredValidator } from './../../helpers/validators/generics.validator';
import { BasicInputComponent } from './basic-input.component';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { By } from '@angular/platform-browser';
import { BasicInputStateMatcher } from '../../helpers/validators/generics.validator';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { Click } from '../../../tests/helpers/generics/click';

describe('BasicInputComponent Integration-Testing', () => {
  let testHostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;
  let basicInputDe: DebugElement;
  let matInput: MatInputHarness;
  let writeValueSpy: jasmine.Spy;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        TestHostComponent, BasicInputComponent,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    basicInputDe = fixture.debugElement.query(By.css('app-basic-input'));
    writeValueSpy = spyOn(basicInputDe.componentInstance, 'writeValue').and.callThrough();
    matInput = await loader.getHarness<MatInputHarness>(MatInputHarness);
  });

  describe('Component Initialization', () => {
    it('should display a correct label (Input)', async () => {
      // Arrange, Act
      const materialFormField = await loader.getHarness<MatFormFieldHarness>(MatFormFieldHarness);
      const matLabel = await materialFormField.getLabel();

      // Assert
      expect(matLabel).toContain(testHostComponent.label);
    });

    it('should display correct content in input field', async () => {
      // Arrange, Act
      const matInputValue = await matInput.getValue();
      const parentControlValue: string = testHostComponent.formGroup.controls.control.value as string;

      // Assert
      expect(writeValueSpy).toHaveBeenCalledWith(parentControlValue);
      expect(matInputValue).toEqual(parentControlValue);
    });
  });
  describe('Component Behavior', () => {
    it('should mark the component to check for any update on ngSubmit emission', () => {
      // Arrange
      fixture.detectChanges();
      const checkSpy = spyOn(basicInputDe.componentInstance.cdRef, 'markForCheck');
      basicInputDe.componentInstance.formGroupDir.ngSubmit.emit('submitted');

      // Assert
      expect(checkSpy).toHaveBeenCalled();
    });

    it('should properly update parent form', async () => {
      // Arrange, Act
      await matInput.setValue('PanPanForever');
      const matInputValue = await matInput.getValue();
      testHostComponent.formGroup.controls.control.setValue(matInputValue);
      const parentControlValue: string = testHostComponent.formGroup.controls.control.value as string;

      fixture.detectChanges();

      // Assert
      expect(matInputValue).toEqual(parentControlValue);
    });

    it('should properly reset view on parent call', async () => {
      // Arrange
      await matInput.setValue('PanPanForever');

      // Act
      testHostComponent.resetForm();
      const matInputValue = await matInput.getValue();

      // Assert
      expect(writeValueSpy).toHaveBeenCalledWith(null);
      expect(matInputValue).toBeFalsy();
    });

    it('should instanciate a correct error state matcher', () => {
      // Assert
      expect(basicInputDe.componentInstance.stateMatcher).toEqual(
        jasmine.any(BasicInputStateMatcher)
      );
    });

    it('should constantly check for errors based on control state', async () => {
      // Arrange
      fixture.detectChanges();
      testHostComponent.resetForm();
      testHostComponent.markAllAsTouched();

      // Force le contrôle à être invalid
      testHostComponent.formGroup.controls.control.setValue('');
      testHostComponent.formGroup.controls.control.markAsTouched();
      testHostComponent.formGroup.controls.control.updateValueAndValidity();
      fixture.detectChanges();

      // Act
      const materialFormField = await loader.getHarness<MatFormFieldHarness>(MatFormFieldHarness);
      const hasErrors = await materialFormField.hasErrors();
      const errors = await materialFormField.getTextErrors();

      // Assert
      expect(hasErrors).toBeTrue();
      expect(errors).toEqual(['Bambinou']);
      expect(errors).toEqual(
        Object.values(basicInputDe.componentInstance.errors || {})
      );
    });

    it('should update the value and trigger the onChange method on a clear button click', () => {
      // Arrange
      basicInputDe.componentInstance.clearable = true;
      testHostComponent.formGroup.controls.control.setValue('BAMBINOUNET');
      fixture.detectChanges();
      const clearBtn = fixture.debugElement.query(By.css('button'));
      const onChangeSpy = spyOn(basicInputDe.componentInstance, 'onChange').and.callThrough();

      // Act
      Click(clearBtn);
      fixture.detectChanges();

      // Assert
      expect(basicInputDe.componentInstance.value).toEqual('');
      expect(onChangeSpy).toHaveBeenCalledWith('');
    });

    it('should emit change event when value changes (covers emitChanges of CVADirective)', async () => {
      // Arrange
      const changeSpy = jasmine.createSpy('change');
      basicInputDe.componentInstance.change.subscribe(changeSpy);
      await matInput.setValue('emitTest');
      fixture.detectChanges();

      // Act
      basicInputDe.componentInstance.emitChanges('emitTest');
      fixture.detectChanges();

      // Assert
      expect(changeSpy).toHaveBeenCalledWith('emitTest');
    });
  });

  describe('inputType getter and password visibility', () => {
    it('should return "password" when isPassword is true and passwordVisible is false', () => {
      basicInputDe.componentInstance.isPassword = true;
      basicInputDe.componentInstance.passwordVisible = false;
      expect(basicInputDe.componentInstance.inputType).toBe('password');
    });

    it('should return "text" when isPassword is true and passwordVisible is true', () => {
      basicInputDe.componentInstance.isPassword = true;
      basicInputDe.componentInstance.passwordVisible = true;
      expect(basicInputDe.componentInstance.inputType).toBe('text');
    });

    it('should return the value of type if isPassword is false and type is set', () => {
      basicInputDe.componentInstance.isPassword = false;
      (basicInputDe.componentInstance as any).type = 'email';
      expect(basicInputDe.componentInstance.inputType).toBe('email');
    });

    it('should return "text" if isPassword is false and type is not set', () => {
      basicInputDe.componentInstance.isPassword = false;
      (basicInputDe.componentInstance as any).type = undefined;
      expect(basicInputDe.componentInstance.inputType).toBe('text');
    });

    it('should toggle passwordVisible when togglePasswordVisibility is called', () => {
      basicInputDe.componentInstance.passwordVisible = false;
      basicInputDe.componentInstance.togglePasswordVisibility();
      expect(basicInputDe.componentInstance.passwordVisible).toBeTrue();
      basicInputDe.componentInstance.togglePasswordVisibility();
      expect(basicInputDe.componentInstance.passwordVisible).toBeFalse();
    });
  });
});

// BasicInputComponent Test Helpers
@Component({
  template: `<form [formGroup]="formGroup">
    <app-basic-input
      [errors]="formGroup.controls.control.errors"
      label="{{ label }}"
      formControlName="control"
    ></app-basic-input>
  </form>`,
  imports: [BasicInputComponent, ReactiveFormsModule],
  standalone: true
})
class TestHostComponent {
  public clearable: boolean = false;
  public label = 'formLabel';
  public formGroup = new FormGroup(
    {
      control: new FormControl('BAMBI', requiredValidator('Bambinou')),
    },
    { validators: requiredValidator('BAMBINOu') }
  );
  public resetForm(): void {
    this.formGroup.reset();
  }
  public markAllAsTouched(): void {
    this.formGroup.markAsDirty();
    this.formGroup.markAllAsTouched();
    this.formGroup.updateValueAndValidity();
  }
}

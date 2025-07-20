import { ErrorStateMatcher } from '@angular/material/core';
import {
  ControlValueAccessor,
  NgControl,
  FormGroupDirective,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  ChangeDetectorRef,
  Directive,
  DoCheck,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output,
  Self,
  SkipSelf,
} from '@angular/core';
import { tap } from 'rxjs/operators';
import { BasicInputStateMatcher } from '../helpers/validators/generics.validator';

export interface LastChange<T, U> {
  value: T[];
  lastChangedItem: T;
  action?: U;
}

@Directive()
export abstract class BaseFormFieldDirective<T, U = unknown>
  implements ControlValueAccessor, OnDestroy, DoCheck {
  private _errors: ValidationErrors | null = null;

  @Input() public ariaLabel?: string;

  @Input() public placeholder?: string;
  @Input() public label?: string;
  @Input() public type!: string;

  @Input() public set errors(errors: ValidationErrors | null) {
    if (errors) {
      this._errors = errors;
      this.errorMessages = Object.values(errors);
    }
  }
  public get errors(): ValidationErrors | null {
    return this._errors;
  }

  @Input() public errorMessages?: string[];

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change = new EventEmitter<T | T[] | null>();
  @Output() lastChange = new EventEmitter<LastChange<T, U>>();

  public value?: T | T[];
  public disabled = false;
  public required = false;

  public stateMatcher!: ErrorStateMatcher;

  // eslint-disable-next-line max-len
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unused-vars
  public onChange = (value: T | T[]) => {};
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public onTouched = () => {};

  constructor(
    @Optional() @Self() public controlDir: NgControl,
    @Optional() @SkipSelf() public formGroupDir: FormGroupDirective,
    public cdRef: ChangeDetectorRef
  ) {
    controlDir.valueAccessor = this;

    if (this.formGroupDir) {
      formGroupDir.ngSubmit
        .pipe(
          tap(() => this.cdRef.markForCheck()),
        )
        .subscribe();
    }
  }

  public ngDoCheck(): void {
    this.stateMatcher = new BasicInputStateMatcher(this.controlDir.control ?? null);
  }

  public ngOnDestroy(): void {
  }

  public writeValue(value: T | T[] | null): void;
  public writeValue(value: T): void {
    this.value = value;

    this.onChange(this.value);
    this.change.emit(this.value);
    this.cdRef.markForCheck();
  }

  public registerOnChange(fn: (_: T | T[] | null) => void): void {
    this.onChange = (value: T | T[]) => {
      this.change.emit(value);
      fn(value);
    };
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public emitChanges(value: T | T[]): void {
    this.change.emit(value);
  }

  public getErrors(ctrl: AbstractControl | NgControl): string[] {
    return ctrl.errors ? Object.values(ctrl.errors) : [];
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdRef.markForCheck();
  }
}

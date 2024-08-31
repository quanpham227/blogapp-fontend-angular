// src/app/validators/validators.ts
import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Validator cho các trường có nội dung dài, ví dụ: CKEditor
 * @param minLength Độ dài tối thiểu của nội dung
 * @param maxLength Độ dài tối đa của nội dung
 */
export function contentLengthValidator(
  minLength: number,
  maxLength: number
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (value && (value.length < minLength || value.length > maxLength)) {
      return { invalidContentLength: { minLength, maxLength } };
    }
    return null;
  };
}

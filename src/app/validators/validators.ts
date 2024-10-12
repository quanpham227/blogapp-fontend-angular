// src/app/validators/validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator cho các trường có nội dung dài, ví dụ: CKEditor
 * @param minLength Độ dài tối thiểu của nội dung
 * @param maxLength Độ dài tối đa của nội dung
 */
export function contentLengthValidator(
  minLength: number,
  maxLength: number,
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (value && (value.length < minLength || value.length > maxLength)) {
      return { invalidContentLength: { minLength, maxLength } };
    }
    return null;
  };
}
/**
 * Validator tùy chỉnh để kiểm tra số lượng thẻ
 * @param max Số lượng thẻ tối đa
 */
export function maxTagsValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const tags = control.value;
    return tags && tags.length > max ? { maxTags: { max } } : null;
  };
}

/**
 * Validator tùy chỉnh để kiểm tra thẻ không được rỗng
 */
export function nonEmptyTagsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const tags = control.value;
    return tags && tags.length === 0 ? { nonEmptyTags: true } : null;
  };
}

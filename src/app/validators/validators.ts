import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator cho các trường có nội dung dài, ví dụ: CKEditor
 * @param minLength Độ dài tối thiểu của nội dung
 * @param maxLength Độ dài tối đa của nội dung
 */
export function contentLengthValidator(minLength: number, maxLength: number): ValidatorFn {
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

/**
 * Validator tùy chỉnh để kiểm tra không có khoảng trắng
 */
export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  };
}

export function emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null; // Không cần kiểm tra nếu giá trị rỗng

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phonePattern = /^[0-9]{10,15}$/;

  const isValidEmail = emailPattern.test(value);
  const isValidPhone = phonePattern.test(value);

  // Nếu không khớp với cả email và số điện thoại, trả về lỗi
  return isValidEmail || isValidPhone ? null : { emailOrPhone: true };
}

/**
 * Validator tùy chỉnh để kiểm tra mật khẩu và xác nhận mật khẩu khớp nhau
 */
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    // Nếu mật khẩu không khớp, trả về lỗi
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

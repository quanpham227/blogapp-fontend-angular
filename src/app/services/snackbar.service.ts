import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  show(
    message: string,
    duration: number = 5000,
    horizontalPosition: 'start' | 'center' | 'end' | 'left' | 'right' = 'center',
    verticalPosition: 'top' | 'bottom' = 'top',
  ) {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition,
      verticalPosition,
    });
  }
  success(
    message: string,
    duration: number = 5000,
    horizontalPosition: 'start' | 'center' | 'end' | 'left' | 'right' = 'center',
    verticalPosition: 'top' | 'bottom' = 'top',
  ) {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition,
      verticalPosition,
      panelClass: ['success-snackbar'],
    };
    this.snackBar.open(message, 'Close', config);
  }
}

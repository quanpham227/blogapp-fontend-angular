import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Image } from '../../../models/image';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { ToasterService } from '../../../services/toaster.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-image-detail-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatGridListModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FlexLayoutModule,
  ],
  templateUrl: './image-detail-admin.component.html',
  styleUrls: ['./image-detail-admin.component.scss'],
})
export class ImageDetailDialogAdminComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageDetailDialogAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image: Image },
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
  ) {}
  closeDialog(): void {
    this.dialogRef.close();
  }
  copyUrl(url: string): void {
    this.clipboard.copy(url);
    this.snackBar.open('URL đã được sao chép vào clipboard', 'Đóng', {
      duration: 3000,
    });
  }
}

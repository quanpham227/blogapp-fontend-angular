import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-update-comment-admin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './update-comment-admin.component.html',
  styleUrls: ['./update-comment-admin.component.scss'],
})
export class UpdateCommentAdminComponent {
  commentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateCommentAdminComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any,
  ) {
    this.commentForm = this.fb.group({
      content: this.fb.control(data?.comment.content || '', Validators.required),
    });
  }

  onSave() {
    if (this.commentForm.valid) {
      const updatedComment = {
        ...this.data.comment,
        content: this.commentForm.value.content,
        userId: this.data.comment.userId,
      };
      this.dialogRef.close(updatedComment);
      console.log('Updated comment:', updatedComment);
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

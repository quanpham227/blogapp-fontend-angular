import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Image } from '../../../models/image';
import { ImageService } from '../../../services/image.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse } from '../../../models/response';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../common/confirm-modal/confirm-modal.component';
import { checkFile, FileValidationResult } from '../../../utils/file-validator';
import { firstValueFrom } from 'rxjs';
import { LazyLoadDirective } from '../../../directives/lazy-load.directive';
@Component({
  selector: 'comment-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment.admin.component.html',
  styleUrl: './comment.admin.component.scss',
})
export class CommentAdminComponent {
  selectedObjectType: string = '';

  constructor(
    private renderer: Renderer2,
    private imageService: ImageService,
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) {}

  filterComment(type: string) {
    this.selectedObjectType = type;
    console.log('Filter media by type:', type);
  }
}

import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Image } from '../../../models/image';
import { ImageService } from '../../../services/image.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterService } from '../../../services/toaster.service';

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
    private toast: ToasterService,
  ) {}

  filterComment(type: string) {
    this.selectedObjectType = type;
    console.log('Filter media by type:', type);
  }
}

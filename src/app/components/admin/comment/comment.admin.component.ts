import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
interface Comment {
  id: number;
  userName: string;
  userAvatar: string;
  content: string;
  date: Date;
  status: string;
}
@Component({
  selector: 'comment-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment.admin.component.html',
  styleUrl: './comment.admin.component.scss',
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ transform: 'translateY(100%)', opacity: 0 }))]),
    ]),
  ],
})
export class CommentAdminComponent {
  comments: Comment[] = [
    {
      id: 1,
      userName: 'John Doe',
      userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
      content: 'This is a great post! Very informative.',
      date: new Date(),
      status: 'pending',
    },
    {
      id: 2,
      userName: 'Jane Smith',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      content: 'Thanks for sharing this valuable information.',
      date: new Date(),
      status: 'approved',
    },
  ];

  filteredComments: Comment[] = [];
  filterStatus: string = 'all';
  searchTerm: string = '';
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  editingComment: any = {};
  deleteCommentId: number | null = null;
  notification = {
    show: false,
    message: '',
    type: 'success',
  };

  ngOnInit(): void {
    this.filteredComments = [...this.comments];
  }

  filterComments(): void {
    this.filteredComments = this.comments.filter((comment) => {
      const matchesStatus = this.filterStatus === 'all' || comment.status === this.filterStatus;
      const matchesSearch =
        comment.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        comment.userName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  searchComments(): void {
    this.filterComments();
  }

  approveComment(comment: Comment): void {
    comment.status = 'approved';
    this.showNotification('Comment approved successfully', 'success');
  }

  rejectComment(comment: Comment): void {
    comment.status = 'rejected';
    this.showNotification('Comment rejected', 'info');
  }

  editComment(comment: Comment): void {
    this.editingComment = { ...comment };
    this.showEditModal = true;
  }

  updateComment(): void {
    const index = this.comments.findIndex((c) => c.id === this.editingComment.id);
    if (index !== -1) {
      this.comments[index] = { ...this.editingComment };
      this.filterComments();
      this.closeEditModal();
      this.showNotification('Comment updated successfully', 'success');
    }
  }

  deleteComment(comment: Comment): void {
    this.deleteCommentId = comment.id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.deleteCommentId) {
      this.comments = this.comments.filter((c) => c.id !== this.deleteCommentId);
      this.filterComments();
      this.closeDeleteModal();
      this.showNotification('Comment deleted successfully', 'success');
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingComment = {};
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteCommentId = null;
  }

  showNotification(message: string, type: string): void {
    this.notification = {
      show: true,
      message,
      type,
    };

    setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }
}

import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../components/common/confirm-modal/confirm-modal.component';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  constructor(private modalService: NgbModal) {}

  confirm(
    title: string = 'Confirm',
    message: string = 'Are you sure you want to proceed?',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
  ): Observable<boolean> {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: true,
      windowClass: 'admin-modal',
      size: 'md',
    });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.confirmText = confirmText;
    modalRef.componentInstance.cancelText = cancelText;

    return from(modalRef.result).pipe(
      map((result) => !!result),
      map(() => true),
      map(() => false),
    );
  }
}

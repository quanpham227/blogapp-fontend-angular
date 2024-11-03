import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard.admin.component.html',
  styleUrls: ['./dashboard.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class DashboardAdminComponent {
  newTask: string = '';
  tasks: { name: string; completed: boolean }[] = [];

  private toasterService = inject(ToasterService);

  showSuccess() {
    this.toasterService.success('Task added successfully');
  }
  showError() {
    this.toasterService.error('Task could not be added');
  }
  showWarning() {
    this.toasterService.warning('Task is not completed');
  }
  showInfo() {
    this.toasterService.info('Task is completed');
  }
}

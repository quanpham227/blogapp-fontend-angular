import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  addTask() {
    if (this.newTask.trim()) {
      this.tasks.push({ name: this.newTask, completed: false });
      this.newTask = '';
    }
  }

  toggleTaskCompletion(index: number) {
    this.tasks[index].completed = !this.tasks[index].completed;
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
  }
}

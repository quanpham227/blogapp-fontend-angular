import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notfound-admin',
  templateUrl: './notfound.admin.component.html',
  styleUrls: ['./notfound.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule],
})
export class NotfoundAdminComponent {}

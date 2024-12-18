import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-notfound-admin',
  templateUrl: './notfound.admin.component.html',
  styleUrls: ['./notfound.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, RouterModule],
})
export class NotfoundAdminComponent {}

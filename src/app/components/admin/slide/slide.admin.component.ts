import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.admin.component.html',
  styleUrls: ['./slide.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SlideAdminComponent {}

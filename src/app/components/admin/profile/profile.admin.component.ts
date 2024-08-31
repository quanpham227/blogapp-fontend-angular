import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-admin',
  templateUrl: './profile.admin.component.html',
  styleUrls: ['./profile.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class ProfileAdminComponent {}

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { DashboardService } from '../../../services/dashboard.service';
import { Dashboard } from '../../../models/dashboard';
import { Post } from '../../../models/post';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { take } from 'rxjs/operators';
import { SnackbarService } from '../../../services/snackbar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
Chart.register(...registerables);

@UntilDestroy()
@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard.admin.component.html',
  styleUrls: ['./dashboard.admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatGridListModule,
    MatListModule,
    MatSlideToggleModule,
    NgChartsModule, // Thêm NgChartsModule vào đây
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAdminComponent implements OnInit {
  isDarkMode = false;
  totalPosts = 0;
  activeUsers = 0;
  todayComments = 0;
  recentPosts: Post[] = [];

  // Biểu đồ Page Views
  public pageViewsChartData: ChartConfiguration<'line'>['data'] = {
    labels: this.getLast7Days(),
    datasets: [
      {
        data: [], // Dữ liệu sẽ được cập nhật
        label: 'Page Views',
        borderColor: 'blue',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
    ],
  };

  public pageViewsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  // Biểu đồ Engagement
  public engagementChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Likes', 'Shares', 'Comments'],
    datasets: [
      {
        data: [], // Dữ liệu sẽ được cập nhật
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
      },
    ],
  };

  public engagementChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Biểu đồ Comments
  public commentsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.getLast7Days(),
    datasets: [
      {
        data: [], // Dữ liệu sẽ được cập nhật
        label: 'Comments',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  public commentsChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef, private snackbar: SnackbarService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.dashboardService
      .getDashboard()
      .pipe(take(1), untilDestroyed(this))
      .subscribe({
        next: (response) => {
          if (response?.data) {
            this.updateDashboardData(response.data);
          }
        },
        error: (err) => {
          this.snackbar.show(err.error?.message || 'Failed to load dashboard data');
        },
      });
  }

  private updateDashboardData(data: Dashboard): void {
    this.totalPosts = data.totalPosts || 0;
    this.activeUsers = data.activeUsers || 0;
    this.todayComments = data.commentsToday || 0;
    this.recentPosts = data.recentPosts || [];

    // Cập nhật dữ liệu biểu đồ
    this.pageViewsChartData.datasets[0].data = data.pageViewsPerDayLastWeek || [];
    this.commentsChartData.datasets[0].data = data.commentsPerDayLastWeek || [];

    // Giả lập dữ liệu cho biểu đồ User Engagement
    const likes = Math.floor(Math.random() * 100); // Giả lập số lượng likes ngẫu nhiên
    const shares = Math.floor(Math.random() * 50); // Giả lập số lượng shares ngẫu nhiên
    const comments = Math.floor(Math.random() * 30); // Giả lập số lượng comments ngẫu nhiên

    this.engagementChartData.datasets[0].data = [likes, shares, comments];

    this.cdr.markForCheck();
  }

  private getLast7Days(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  }
}

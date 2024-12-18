import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardService } from '../../../services/dashboard.service';
import { Dashboard } from '../../../models/dashboard';
import { Post } from '../../../models/post';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { take } from 'rxjs/operators';
import { SnackbarService } from '../../../services/snackbar.service';

@UntilDestroy()
@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard.admin.component.html',
  styleUrls: ['./dashboard.admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatSlideToggleModule, MatListModule, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAdminComponent implements OnInit {
  isDarkMode = false;
  totalPosts = 0;
  activeUsers = 0;
  todayComments = 0;
  recentPosts: Post[] = [];

  pageViewsChart: any = this.initializeChart('line', 'Weekly Page Views');
  engagementChart: any = this.initializeChart('pie', 'Engagement Distribution', ['Likes', 'Shares', 'Comments']);
  commentsChart: any = this.initializeChart('bar', 'Daily Comments');

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private snackbar: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.updateChartsTheme();
    this.loadDashboardData();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.updateChartsTheme();
    this.cdr.markForCheck();
  }

  private initializeChart(type: string, title: string, labels: string[] = []): any {
    return {
      series: [],
      chart: {
        type: type,
        height: 350,
        toolbar: { show: false },
      },
      xaxis: {
        categories: this.getLast7Days(),
      },
      title: {
        text: title,
      },
      labels: labels,
    };
  }

  private updateChartsTheme(): void {
    const theme = this.isDarkMode
      ? {
          mode: 'dark',
          background: '#2d2d2d',
          foreColor: '#ffffff',
        }
      : {
          mode: 'light',
          background: '#ffffff',
          foreColor: '#373d3f',
        };

    [this.pageViewsChart, this.engagementChart, this.commentsChart].forEach((chart) => {
      chart.theme = theme;
    });
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

    this.pageViewsChart.series = [
      {
        name: 'Page Views',
        data: data.pageViewsPerDayLastWeek || [],
      },
    ];

    this.engagementChart.series = (data.recentPosts || []).map((post) => post.viewCount || 0);

    this.commentsChart.series = [
      {
        name: 'Comments',
        data: data.commentsPerDayLastWeek || [],
      },
    ];

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

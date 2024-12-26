import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewChecked } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AchievementService, Achievement } from '../../services/achievement.service';
import { BehaviorSubject } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';
import { CountUp } from 'countup.js';

@UntilDestroy()
@Component({
  selector: 'app-counts',
  templateUrl: './counts.component.html',
  styleUrls: ['./counts.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountsComponent implements OnInit, AfterViewChecked {
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  achievements$ = this.achievementsSubject.asObservable();
  private initialized = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private achievementService: AchievementService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadAchievements();
  }

  ngAfterViewChecked(): void {
    if (!this.initialized && this.achievementsSubject.value.length > 0) {
      this.initializeCountUp(this.achievementsSubject.value);
      this.initialized = true;
    }
  }

  loadAchievements(): void {
    this.achievementService
      .getActiveAchievementsForUser()
      .pipe(
        map((response) => {
          return response.data;
        }),
        untilDestroyed(this),
      )
      .subscribe((achievements: Achievement[]) => {
        this.achievementsSubject.next(achievements);
        this.cdr.markForCheck();
      });
  }

  private initializeCountUp(achievements: Achievement[]): void {
    if (isPlatformBrowser(this.platformId)) {
      achievements.forEach((achievement, index) => {
        const options = { duration: 3 };
        const countUp = new CountUp(`counter-${index}`, achievement.value, options);
        if (!countUp.error) {
          countUp.start();
        } else {
          console.error(countUp.error);
        }
      });
    }
  }
}

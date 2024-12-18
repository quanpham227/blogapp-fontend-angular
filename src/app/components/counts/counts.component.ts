import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AchievementService, Achievement } from '../../services/achievement.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-counts',
  templateUrl: './counts.component.html',
  styleUrls: ['./counts.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountsComponent implements OnInit {
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  achievements$ = this.achievementsSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private achievementService: AchievementService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadAchievements();
  }

  loadAchievements(): void {
    this.achievementService
      .getActiveAchievementsForUser()
      .pipe(
        map((response) => {
          console.log('Response data:', response.data);
          return response.data;
        }),
        untilDestroyed(this),
      )
      .subscribe((achievements: Achievement[]) => {
        this.achievementsSubject.next(achievements);
        this.cdr.markForCheck();
        this.initializePureCounter();
      });
  }

  private initializePureCounter(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('@srexi/purecounterjs').then(({ default: PureCounter }) => {
        new PureCounter();
      });
    }
  }
}

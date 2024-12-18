import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SuccessHandlerService } from './success-handler.service';
import { map, tap } from 'rxjs/operators';
import { ApiResponse } from '../models/response';

export interface Achievement {
  id: number;
  title: string;
  value: number;
  description: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AchievementService {
  private apiAchievement = `${environment.apiBaseUrl}/achievements`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}
  private convertToServerFormat(achievement: Achievement) {
    return {
      ...achievement,
      is_active: achievement.isActive,
    };
  }

  private convertFromServerFormat(achievement: any): Achievement {
    return {
      ...achievement,
      isActive: achievement.is_active,
    };
  }
  private convertResponse(response: ApiResponse<any>): ApiResponse<any> {
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map(this.convertFromServerFormat);
    } else if (response.data && typeof response.data === 'object') {
      response.data = this.convertFromServerFormat(response.data);
    }
    return response;
  }
  getAchievementsForAdmin(): Observable<ApiResponse<Achievement[]>> {
    return this.http
      .get<ApiResponse<Achievement[]>>(`${this.apiAchievement}/admin`)
      .pipe(map(this.convertResponse.bind(this)));
  }

  getActiveAchievementsForUser(): Observable<ApiResponse<Achievement[]>> {
    return this.http
      .get<ApiResponse<Achievement[]>>(`${this.apiAchievement}/user`)
      .pipe(map(this.convertResponse.bind(this)));
  }
  updateAchievement(id: number, achievement: Achievement): Observable<ApiResponse<Achievement>> {
    const payload = this.convertToServerFormat(achievement);
    return this.http.put<ApiResponse<Achievement>>(`${this.apiAchievement}/${id}`, payload).pipe(
      map(this.convertResponse.bind(this)),
      tap((response) => this.successHandlerService.handleApiResponse(response)),
    );
  }

  createAchievement(achievement: Achievement): Observable<ApiResponse<Achievement>> {
    const payload = this.convertToServerFormat(achievement);
    return this.http.post<ApiResponse<Achievement>>(this.apiAchievement, payload).pipe(
      map(this.convertResponse.bind(this)),
      tap((response) => this.successHandlerService.handleApiResponse(response)),
    );
  }

  deleteAchievement(id: number): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiAchievement}/${id}`)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}

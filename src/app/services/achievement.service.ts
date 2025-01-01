import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SuccessHandlerService } from './success-handler.service';
import { map, tap } from 'rxjs/operators';
import { ApiResponse } from '../models/response';
import { convertToCamelCase, convertToSnakeCase } from '../utils/case-converter';

export interface Achievement {
  id: number;
  title: string;
  value: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AchievementService {
  private apiAchievement = `${environment.apiBaseUrl}/achievements`;

  constructor(private http: HttpClient, private successHandlerService: SuccessHandlerService) {}
  getAchievementsForAdmin(): Observable<ApiResponse<Achievement[]>> {
    return this.http.get<ApiResponse<Achievement[]>>(`${this.apiAchievement}/admin`).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = response.data.map((achievement) => convertToCamelCase(achievement));
        }
        return response;
      }),
    );
  }

  getActiveAchievementsForUser(): Observable<ApiResponse<Achievement[]>> {
    return this.http.get<ApiResponse<Achievement[]>>(`${this.apiAchievement}/user`).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = response.data.map((achievement) => convertToCamelCase(achievement));
        }
        return response;
      }),
    );
  }
  updateAchievement(id: number, achievement: Achievement): Observable<ApiResponse<Achievement>> {
    const payload = convertToSnakeCase(achievement);
    return this.http.put<ApiResponse<Achievement>>(`${this.apiAchievement}/${id}`, payload).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }

  createAchievement(achievement: Achievement): Observable<ApiResponse<Achievement>> {
    const payload = convertToSnakeCase(achievement);
    return this.http.post<ApiResponse<Achievement>>(this.apiAchievement, payload).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }

  deleteAchievement(id: number): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiAchievement}/${id}`)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}

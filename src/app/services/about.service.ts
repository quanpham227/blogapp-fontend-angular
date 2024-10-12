import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { About } from '../models/about';
import { ApiResponse } from '../models/response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private apiAbout = `${environment.apiBaseUrl}/about`;

  constructor(private http: HttpClient) {}

  getAbout(): Observable<ApiResponse<About>> {
    return this.http.get<ApiResponse<About>>(this.apiAbout);
  }
  updateAbout(id: number, about: About): Observable<ApiResponse<About>> {
    return this.http.put<ApiResponse<About>>(`${this.apiAbout}/${id}`, about);
  }
}

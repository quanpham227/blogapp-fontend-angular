import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserDetailService {
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;

  constructor(private http: HttpClient) {}

  getUserDetail(token: string): Observable<any> {
    return this.http.post(this.apiUserDetail, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

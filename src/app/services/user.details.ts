import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { convertToCamelCase, convertToSnakeCase } from '../utils/case-converter';

@Injectable({
  providedIn: 'root',
})
export class UserDetailService {
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;

  constructor(private http: HttpClient) {}

  getUserDetail(token: string): Observable<any> {
    return this.http
      .post(
        this.apiUserDetail,
        {},
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        },
      )
      .pipe(map((response) => convertToCamelCase(response)));
  }
}

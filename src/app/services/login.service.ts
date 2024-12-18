import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { convertToSnakeCase, convertToCamelCase } from '../utils/case-converter';
import { LoginDTO } from '../dtos/user/login.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiConfig = {
    headers: this.createHeaders(),
  };
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }
  constructor(private http: HttpClient) {}

  login(loginDTO: LoginDTO): Observable<any> {
    const snakeCaseDTO = convertToSnakeCase(loginDTO);
    return this.http
      .post(this.apiLogin, snakeCaseDTO, {
        ...this.apiConfig,
        withCredentials: true,
      })
      .pipe(map((response) => convertToCamelCase(response)));
  }
}

import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client } from '../models/client';
import { ClientRequest } from '../request/client.request';
import { SuccessHandlerService } from './success-handler.service';
import { tap, map } from 'rxjs/operators';
import { convertToCamelCase, convertToSnakeCase } from '../utils/case-converter';
@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiClients = `${environment.apiBaseUrl}/clients`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}
  getClients(): Observable<ApiResponse<Client[]>> {
    return this.http.get<ApiResponse<Client[]>>(this.apiClients).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = response.data.map((slide) => convertToCamelCase(slide));
        }
        return response;
      }),
    );
  }

  insertClient(client: ClientRequest): Observable<ApiResponse<Client>> {
    const snakeCaseSlide = convertToSnakeCase(client);

    return this.http.post<ApiResponse<Client>>(this.apiClients, snakeCaseSlide).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }

  deleteClient(id: number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiClients}/${id}`)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  updateClient(id: number, client: ClientRequest): Observable<ApiResponse<Client>> {
    const snakeCaseSlide = convertToSnakeCase(client);
    return this.http.put<ApiResponse<Client>>(`${this.apiClients}/${id}`, snakeCaseSlide).pipe(
      tap((response) => this.successHandlerService.handleApiResponse(response)),
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }
}

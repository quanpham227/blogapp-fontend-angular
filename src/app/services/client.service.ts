import { ApiResponse } from '../models/response';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client } from '../models/client';
import { ClientRequest } from '../request/client.request';
@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiClients = `${environment.apiBaseUrl}/clients`;

  constructor(private http: HttpClient) {}
  getClients(): Observable<ApiResponse<Client[]>> {
    return this.http.get<ApiResponse<Client[]>>(this.apiClients);
  }

  insertClient(client: ClientRequest): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(this.apiClients, client);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiClients}/${id}`);
  }
  getClientById(id: number): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.apiClients}/${id}`);
  }

  updateClient(
    id: number,
    client: ClientRequest,
  ): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(
      `${this.apiClients}/${id}`,
      client,
    );
  }
}

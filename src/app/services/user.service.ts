import { LoginDTO } from './../dtos/user/login.dto';
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterDTO } from '../../app/dtos/user/register.dto';
import { environment } from '../../environments/environment';
import { UserResponse } from '../..//app/responses/user/user.response';
import { UpdateUserDTO } from '../../app/dtos/user/update.user';
import { ApiResponse } from '../../app/models/response';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;
  localStorage?: Storage;

  private apiConfig = {
    headers: this.createHeaders(),
  };
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.localStorage = this.document.defaultView?.localStorage;
  }

  register(registerDTO: RegisterDTO): Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, this.apiConfig);
  }

  login(loginDTO: LoginDTO): Observable<any> {
    return this.http.post(this.apiLogin, loginDTO, this.apiConfig);
  }
  getUserDetail(token: String) {
    return this.http.post(this.apiUserDetail, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    });
  }

  updateUserDetail(token: string, updateUserDTO: UpdateUserDTO) {
    debugger;
    let userResponse = this.getFromLocalStorage();
    return this.http.put(
      `${this.apiUserDetail}/${userResponse?.id}`,
      updateUserDTO,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
      },
    );
  }

  saveToLocalStorage(userResponse?: UserResponse) {
    try {
      debugger;
      if (userResponse === null || userResponse === undefined) {
        console.error('UserResponse is undefined');
        return;
      }
      //convert userResponse obj to JSON string
      const userResponseJSON = JSON.stringify(userResponse);

      //save to local storage with key 'user'
      this.localStorage?.setItem('user', userResponseJSON);
      console.log('User saved to local storage');
    } catch (error) {
      console.error('Error saving user to local storage:', error);
    }
  }

  getFromLocalStorage(): UserResponse | null {
    try {
      // Kiểm tra sự tồn tại của localStorage
      if (!this.localStorage) {
        console.error('localStorage is not available.');
        return null;
      }
      //get user from local storage
      const userResponseJSON = this.localStorage?.getItem('user');
      if (userResponseJSON === null || userResponseJSON === undefined) {
        return null;
      }
      //parse JSON string to UserResponse obj
      const userResponse: UserResponse = JSON.parse(userResponseJSON);
      console.log('User retrieved from local storage');
      return userResponse;
    } catch (error) {
      console.error('Error retrieving user from local storage:', error);
      return null;
    }
  }

  removeUserFromLocalStorage(): void {
    debugger;
    try {
      // Kiểm tra sự tồn tại của localStorage
      if (!this.localStorage) {
        console.error('localStorage is not available.');
        return;
      }

      // Remove the user data from local storage using the key
      this.localStorage?.removeItem('user');
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
      // Handle the error as needed
    }
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserResponse } from '../responses/user/user.response';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  private userResponseSubject = new BehaviorSubject<UserResponse | null>(null);
  userResponse$ = this.userResponseSubject.asObservable();

  setLoading(isLoading: boolean) {
    this.isLoadingSubject.next(isLoading);
  }

  setUserResponse(userResponse: UserResponse | null) {
    this.userResponseSubject.next(userResponse);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  private helpTextSubject = new BehaviorSubject<string | null>(null);
  helpText$ = this.helpTextSubject.asObservable();

  setHelpText(helpText: string) {
    this.helpTextSubject.next(helpText);
  }
}

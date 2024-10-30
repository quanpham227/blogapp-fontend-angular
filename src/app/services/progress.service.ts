import { Injectable } from '@angular/core';
import { NgProgressOptions } from 'ngx-progressbar';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  options: NgProgressOptions = {
    min: 8,
    max: 100,
    speed: 200,
    trickleSpeed: 300,
    debounceTime: 0,
    spinnerPosition: 'right',
    direction: 'ltr+',
    relative: false,
    flat: false,
    spinner: true,
  };

  constructor(public http: HttpClient) {}
}

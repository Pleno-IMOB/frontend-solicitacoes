import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DatePickerService {
  private date$ = new BehaviorSubject<string[]>([]);

  constructor() { }

  public get date() {
    return this.date$;
  }

  public setDate(v: string[], storage = true) {
    if (storage)
      localStorage.setItem('periodo', JSON.stringify(v));

    this.date$.next(v);
  }
}

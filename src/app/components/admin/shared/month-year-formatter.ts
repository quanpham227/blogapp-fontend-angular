import { Injectable } from '@angular/core';
import {
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class MonthYearFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const parts = value.split('-');
      return { year: +parts[0], month: +parts[1], day: 1 };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? `${date.year}-${('0' + date.month).slice(-2)}` : '';
  }
}

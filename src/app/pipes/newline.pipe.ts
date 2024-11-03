import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newline',
  standalone: true,
})
export class NewlinePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    return value.replace(/ /g, '<br>');
  }
}

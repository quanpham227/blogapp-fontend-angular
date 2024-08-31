import { Injectable } from '@angular/core';
import DOMPurify from 'dompurify';
@Injectable({
  providedIn: 'root',
})
export class SanitizeService {
  constructor() {}

  sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'b',
        'i',
        'em',
        'strong',
        'a',
        'p',
        'img',
        'ul',
        'ol',
        'li',
        'br',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target'],
    });
  }
}

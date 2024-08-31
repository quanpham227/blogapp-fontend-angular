// strip-html.ts
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export function stripHtml(html: string, platformId: Object): string {
  if (isPlatformBrowser(platformId)) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
  return '';
}

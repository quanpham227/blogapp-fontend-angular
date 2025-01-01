// strip-html.ts

export function stripHtml(html: string, platformId: object): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
  return '';
}
